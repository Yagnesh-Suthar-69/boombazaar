import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await queryAll('SELECT * FROM customers ORDER BY lifetime_spend DESC');
    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}
