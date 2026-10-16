import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryAll, queryFirst, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const POSSaleSchema = z.object({
  customerName: z.string().default('Walk-in Customer'),
  customerPhone: z.string().optional().nullable(),
  paymentMethod: z.enum(['cash', 'upi', 'card']),
  discountAmount: z.number().int().min(0).default(0), // in paise
  notes: z.string().max(300).optional().nullable(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'At least one product is required for sale'),
});

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = POSSaleSchema.parse(body);

    // Validate products & stock atomically
    const productIds = data.items.map(i => i.productId);
    const placeholders = productIds.map(() => '?').join(',');
    const productsInDb = await queryAll(
      `SELECT id, name, sku, price, sale_price, stock, is_active FROM products WHERE id IN (${placeholders})`,
      productIds
    );

    const productMap = new Map(productsInDb.map((p: any) => [p.id, p]));
    const saleLineItems: Array<{
      productId: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }> = [];

    let subtotal = 0;

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ID "${item.productId}" not found.` }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}` },
          { status: 400 }
        );
      }

      const unitPrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      saleLineItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice,
        quantity: item.quantity,
        totalPrice: lineTotal,
      });
    }

    const finalTotal = Math.max(0, subtotal - data.discountAmount);
    const invoiceNumber = `POS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const saleId = `sale_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Insert sale record
    await execute(
      `INSERT INTO sales (
        id, invoice_number, sales_channel, customer_name, customer_phone,
        subtotal, discount_amount, tax_amount, total_amount, payment_method,
        payment_status, status, created_by, notes
      ) VALUES (?, ?, 'offline', ?, ?, ?, ?, 0, ?, ?, 'paid', 'completed', ?, ?)`,
      [
        saleId,
        invoiceNumber,
        data.customerName || 'Walk-in Customer',
        data.customerPhone || null,
        subtotal,
        data.discountAmount,
        finalTotal,
        data.paymentMethod,
        session.name,
        data.notes || null,
      ]
    );

    // Insert line items & decrement stock
    for (const line of saleLineItems) {
      const saleItemId = `si_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await execute(
        `INSERT INTO sale_items (id, sale_id, product_id, product_name, sku, unit_price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [saleItemId, saleId, line.productId, line.productName, line.sku, line.unitPrice, line.quantity, line.totalPrice]
      );

      await execute('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        line.quantity,
        line.productId,
      ]);

      await execute(
        `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reason, reference_id)
         VALUES (?, ?, 'sale', ?, 'Counter POS Sale', ?)`,
        [`im_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, line.productId, -line.quantity, saleId]
      );
    }

    // Also record payment entry
    await execute(
      `INSERT INTO payments (id, sale_id, amount, payment_method, transaction_reference, status)
       VALUES (?, ?, ?, ?, ?, 'completed')`,
      [`pay_${Date.now()}`, saleId, finalTotal, data.paymentMethod, invoiceNumber]
    );

    return NextResponse.json({
      success: true,
      sale: {
        id: saleId,
        invoiceNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        subtotal,
        discountAmount: data.discountAmount,
        totalAmount: finalTotal,
        paymentMethod: data.paymentMethod,
        createdAt: new Date().toISOString(),
        items: saleLineItems,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('POS sale creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process counter sale' }, { status: 500 });
  }
}
