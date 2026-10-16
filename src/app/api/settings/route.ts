import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await queryAll('SELECT key, value FROM settings');
    const settings: Record<string, string> = {
      store_name: 'Boom Bazaar',
      store_logo: '',
      whatsapp_phone: '8128627017',
      support_email: 'orders@boombazaar.com',
      store_address: 'Boom Bazaar Fireworks Depot, Main Hub',
      delivery_fee_rupees: '150',
      free_delivery_threshold_rupees: '2500',
      legal_disclaimer: 'All fireworks sold are compliant with safety and environmental standards. Always maintain a safe distance and supervise children.',
    };

    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}
