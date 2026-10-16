import { NextResponse } from 'next/server';
import { queryAll, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await queryAll('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    for (const [key, val] of Object.entries(body)) {
      await execute(
        'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
        [key, String(val)]
      );

      if (key === 'delivery_fee_rupees') {
        const paise = Math.round(Number(val) * 100);
        await execute(
          'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
          ['delivery_fee', String(paise)]
        );
      } else if (key === 'free_delivery_threshold_rupees') {
        const paise = Math.round(Number(val) * 100);
        await execute(
          'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
          ['free_delivery_threshold', String(paise)]
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}
