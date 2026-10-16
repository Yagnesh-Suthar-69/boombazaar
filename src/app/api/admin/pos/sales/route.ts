import { NextResponse } from 'next/server';
import { queryAll, queryFirst, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const offset = (page - 1) * limit;

    let conditions = ['1=1'];
    let params: any[] = [];

    if (search) {
      conditions.push('(invoice_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await queryFirst<{ total: number }>(`SELECT COUNT(*) as total FROM sales ${whereClause}`, params);
    const total = countRes?.total || 0;

    const sales = await queryAll(
      `SELECT * FROM sales ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching counter sales:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sales' }, { status: 500 });
  }
}

// Handle eligible counter return / refund
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { saleId, reason } = await request.json();
    const sale = await queryFirst('SELECT * FROM sales WHERE id = ?', [saleId]);

    if (!sale) {
      return NextResponse.json({ error: 'Sale record not found' }, { status: 404 });
    }

    if (sale.status === 'refunded') {
      return NextResponse.json({ error: 'This counter sale has already been returned/refunded.' }, { status: 400 });
    }

    // Restore stock for all items
    const items = await queryAll('SELECT product_id, quantity FROM sale_items WHERE sale_id = ?', [sale.id]);
    for (const item of items) {
      await execute('UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        item.quantity,
        item.product_id,
      ]);
      await execute(
        `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reason, reference_id)
         VALUES (?, ?, 'return', ?, ?, ?)`,
        [`im_ret_${Date.now()}`, item.product_id, item.quantity, `Counter Return: ${reason || 'Customer returned items'}`, sale.id]
      );
    }

    // Mark sale refunded
    await execute("UPDATE sales SET status = 'refunded', notes = ? WHERE id = ?", [
      `Refunded by ${session.name}. Reason: ${reason || 'Return'}`,
      sale.id,
    ]);

    return NextResponse.json({ success: true, message: 'Sale refunded and stock returned successfully' });
  } catch (error: any) {
    console.error('Counter return error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process return' }, { status: 500 });
  }
}
