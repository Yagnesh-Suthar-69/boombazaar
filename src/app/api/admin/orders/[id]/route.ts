import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryFirst, queryAll, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const UpdateOrderSchema = z.object({
  orderStatus: z.enum([
    'Pending',
    'Confirmed',
    'Processing',
    'Ready for Pickup',
    'Shipped',
    'Completed',
    'Cancellation Requested',
    'Cancelled',
  ]).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']).optional(),
  comment: z.string().max(500).optional(),
  cancellationAction: z.enum(['approve', 'reject']).optional(),
  cancellationNotes: z.string().max(500).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const order = await queryFirst('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = await queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const history = await queryAll('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [order.id]);
    const cancellationRequest = await queryFirst('SELECT * FROM cancellation_requests WHERE order_id = ? ORDER BY created_at DESC LIMIT 1', [order.id]);

    return NextResponse.json({
      order,
      items,
      history,
      cancellationRequest,
    });
  } catch (error: any) {
    console.error('Error fetching admin order:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validated = UpdateOrderSchema.parse(body);

    const order = await queryFirst('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle cancellation approval or rejection if requested
    if (validated.cancellationAction) {
      const cancelReq = await queryFirst(
        'SELECT * FROM cancellation_requests WHERE order_id = ? AND status = ? LIMIT 1',
        [order.id, 'pending']
      );

      if (validated.cancellationAction === 'approve') {
        // Approve cancellation and restore stock idempotently
        await execute(
          'UPDATE cancellation_requests SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['approved', validated.cancellationNotes || 'Approved by administrator', cancelReq?.id || '']
        );

        // Check if stock already restored
        const alreadyRestored = await queryFirst(
          "SELECT id FROM inventory_movements WHERE reference_id = ? AND movement_type = 'cancellation_restore'",
          [order.id]
        );

        if (!alreadyRestored) {
          const items = await queryAll('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order.id]);
          for (const item of items) {
            await execute('UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
              item.quantity,
              item.product_id,
            ]);
            await execute(
              `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reason, reference_id)
               VALUES (?, ?, 'cancellation_restore', ?, 'Stock restored on approved cancellation', ?)`,
              [`im_res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, item.product_id, item.quantity, order.id]
            );
          }
        }

        await execute("UPDATE orders SET order_status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [order.id]);
        await execute(
          `INSERT INTO order_status_history (id, order_id, previous_status, new_status, comment, changed_by)
           VALUES (?, ?, ?, 'Cancelled', ?, ?)`,
          [`osh_${Date.now()}`, order.id, order.order_status, validated.cancellationNotes || 'Cancellation approved by admin', session.name]
        );

        return NextResponse.json({ success: true, message: 'Cancellation approved and stock restored successfully' });
      } else if (validated.cancellationAction === 'reject') {
        await execute(
          'UPDATE cancellation_requests SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['rejected', validated.cancellationNotes || 'Rejected by administrator', cancelReq?.id || '']
        );

        await execute("UPDATE orders SET order_status = 'Confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [order.id]);
        await execute(
          `INSERT INTO order_status_history (id, order_id, previous_status, new_status, comment, changed_by)
           VALUES (?, ?, ?, 'Confirmed', ?, ?)`,
          [`osh_${Date.now()}`, order.id, order.order_status, `Cancellation rejected: ${validated.cancellationNotes || 'Rejected'}`, session.name]
        );

        return NextResponse.json({ success: true, message: 'Cancellation request rejected' });
      }
    }

    // Normal status or payment update
    const newStatus = validated.orderStatus || order.order_status;
    const newPayment = validated.paymentStatus || order.payment_status;

    // If changing to Cancelled directly
    if (newStatus === 'Cancelled' && order.order_status !== 'Cancelled') {
      const alreadyRestored = await queryFirst(
        "SELECT id FROM inventory_movements WHERE reference_id = ? AND movement_type = 'cancellation_restore'",
        [order.id]
      );
      if (!alreadyRestored) {
        const items = await queryAll('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order.id]);
        for (const item of items) {
          await execute('UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
            item.quantity,
            item.product_id,
          ]);
          await execute(
            `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reason, reference_id)
             VALUES (?, ?, 'cancellation_restore', ?, 'Stock restored on cancellation', ?)`,
            [`im_res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, item.product_id, item.quantity, order.id]
          );
        }
      }
    }

    await execute(
      'UPDATE orders SET order_status = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, newPayment, order.id]
    );

    if (newStatus !== order.order_status || validated.comment) {
      await execute(
        `INSERT INTO order_status_history (id, order_id, previous_status, new_status, comment, changed_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `osh_${Date.now()}`,
          order.id,
          order.order_status,
          newStatus,
          validated.comment || `Order status updated to ${newStatus}`,
          session.name,
        ]
      );
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Update order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
