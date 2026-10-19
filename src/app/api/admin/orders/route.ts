import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';
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
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const channel = searchParams.get('channel');
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const offset = (page - 1) * limit;

    let conditions: string[] = ['1=1'];
    let params: any[] = [];

    if (search) {
      conditions.push('(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (status && status !== 'all') {
      conditions.push('order_status = ?');
      params.push(status);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      conditions.push('payment_status = ?');
      params.push(paymentStatus);
    }

    if (channel && channel !== 'all') {
      conditions.push('sales_channel = ?');
      params.push(channel);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await queryFirst<{ total: number }>(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      params
    );
    const total = countRes?.total || 0;

    const orders = await queryAll(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}
