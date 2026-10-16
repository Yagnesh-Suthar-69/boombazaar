import { NextResponse } from 'next/server';
import { queryFirst, queryAll } from '@/lib/db';
import { buildWhatsAppOrderUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;

    const order = await queryFirst(
      `SELECT * FROM orders WHERE order_number = ? OR id = ?`,
      [orderNumber, orderNumber]
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = await queryAll(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [order.id]
    );

    const history = await queryAll(
      `SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC`,
      [order.id]
    );

    const cancellationRequest = await queryFirst(
      `SELECT * FROM cancellation_requests WHERE order_id = ? ORDER BY created_at DESC LIMIT 1`,
      [order.id]
    );

    const settingsWhatsapp = await queryFirst('SELECT value FROM settings WHERE key = ?', ['whatsapp_phone']);
    const whatsappPhone = settingsWhatsapp?.value || '8128627017';

    const whatsappUrl = buildWhatsAppOrderUrl({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      deliveryType: order.delivery_type,
      address: order.address,
      items: items.map((i: any) => ({
        productName: i.product_name,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        totalPrice: i.total_price,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
      orderStatus: order.order_status,
      whatsappPhone,
    });

    return NextResponse.json({
      order,
      items,
      history,
      cancellationRequest,
      whatsappUrl,
    });
  } catch (error: any) {
    console.error('Order lookup error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}
