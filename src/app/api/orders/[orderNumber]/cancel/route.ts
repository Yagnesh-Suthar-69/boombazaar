import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryFirst, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

const CancelRequestSchema = z.object({
  accessToken: z.string().min(10, 'Valid order access token is required to request cancellation'),
  reason: z.string().min(5, 'Please provide a reason of at least 5 characters').max(500),
});

export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    const body = await request.json();
    const { accessToken, reason } = CancelRequestSchema.parse(body);

    const order = await queryFirst(
      `SELECT * FROM orders WHERE order_number = ? OR id = ?`,
      [orderNumber, orderNumber]
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order access token for ownership protection
    if (order.access_token !== accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid order security access token. Cancellation request rejected.' },
        { status: 403 }
      );
    }

    // Check if cancellation is permissible
    if (order.order_status === 'Cancelled') {
      return NextResponse.json({ error: 'This order is already cancelled.' }, { status: 400 });
    }

    if (['Shipped', 'Completed'].includes(order.order_status)) {
      return NextResponse.json(
        { error: `Cannot cancel order at status '${order.order_status}'. Please contact customer support.` },
        { status: 400 }
      );
    }

    if (order.order_status === 'Cancellation Requested') {
      return NextResponse.json(
        { error: 'A cancellation request for this order is already pending admin review.' },
        { status: 400 }
      );
    }

    // Record cancellation request
    const requestId = `cr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await execute(
      `INSERT INTO cancellation_requests (id, order_id, customer_reason, status)
       VALUES (?, ?, ?, 'pending')`,
      [requestId, order.id, reason]
    );

    // Update order status
    await execute(
      `UPDATE orders SET order_status = 'Cancellation Requested', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [order.id]
    );

    // Audit status history
    await execute(
      `INSERT INTO order_status_history (id, order_id, previous_status, new_status, comment, changed_by)
       VALUES (?, ?, ?, 'Cancellation Requested', ?, 'Customer')`,
      [
        `osh_${Date.now()}`,
        order.id,
        order.order_status,
        `Customer requested cancellation: "${reason}"`,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Cancellation request submitted successfully. Our team will review and approve.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Cancellation request error:', error);
    return NextResponse.json({ error: error.message || 'Failed to request cancellation' }, { status: 500 });
  }
}
