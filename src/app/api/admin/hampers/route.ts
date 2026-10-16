import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryAll, queryFirst, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CreateHamperSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(150),
  description: z.string().optional().nullable(),
  priceRupees: z.number().positive(),
  salePriceRupees: z.number().positive().optional().nullable(),
  images: z.array(z.string()).default([]),
  video: z.string().optional().nullable(),
  isFeatured: z.boolean().default(true),
  isActive: z.boolean().default(true),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'A hamper must contain at least one product'),
});

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hampers = await queryAll('SELECT * FROM hampers ORDER BY created_at DESC');
    
    // Fetch included items for all hampers
    for (const h of hampers) {
      h.images = h.images ? JSON.parse(h.images) : [];
      const items = await queryAll(`
        SELECT hi.id, hi.product_id, hi.quantity, p.name as product_name, p.sku, p.price, p.sale_price, p.images as product_images
        FROM hamper_items hi
        JOIN products p ON hi.product_id = p.id
        WHERE hi.hamper_id = ?
      `, [h.id]);
      
      h.items = items.map((it: any) => ({
        ...it,
        product_images: it.product_images ? JSON.parse(it.product_images) : [],
      }));
    }

    return NextResponse.json({ hampers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch hampers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = CreateHamperSchema.parse(body);

    const hamperId = `hmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const pricePaise = Math.round(data.priceRupees * 100);
    const salePricePaise = data.salePriceRupees ? Math.round(data.salePriceRupees * 100) : null;

    // Check slug uniqueness
    const existing = await queryFirst('SELECT id FROM hampers WHERE slug = ?', [data.slug]);
    if (existing) {
      return NextResponse.json({ error: 'A hamper with this slug already exists' }, { status: 400 });
    }

    // Insert hamper
    await execute(
      `INSERT INTO hampers (id, name, slug, description, price, sale_price, images, video, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hamperId,
        data.name,
        data.slug,
        data.description || '',
        pricePaise,
        salePricePaise,
        JSON.stringify(data.images),
        data.video || null,
        data.isFeatured ? 1 : 0,
        data.isActive ? 1 : 0,
      ]
    );

    // Insert included hamper items
    for (const item of data.items) {
      const itemId = `hmi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await execute(
        'INSERT INTO hamper_items (id, hamper_id, product_id, quantity) VALUES (?, ?, ?, ?)',
        [itemId, hamperId, item.productId, item.quantity]
      );
    }

    // Sync into products table to satisfy order_items foreign key constraint and reports
    const hamperSku = `HMP-${data.slug.substring(0, 10).toUpperCase()}`;
    await execute(
      `INSERT INTO products (id, name, slug, description, category_id, sku, price, sale_price, stock, low_stock_threshold, images, is_featured, is_active)
       VALUES (?, ?, ?, ?, 'cat_gift', ?, ?, ?, 9999, 10, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         slug = excluded.slug,
         price = excluded.price,
         sale_price = excluded.sale_price,
         images = excluded.images,
         is_active = excluded.is_active`,
      [
        hamperId,
        data.name,
        data.slug,
        data.description || '',
        hamperSku,
        pricePaise,
        salePricePaise,
        JSON.stringify(data.images),
        data.isFeatured ? 1 : 0,
        data.isActive ? 1 : 0,
      ]
    );

    return NextResponse.json({ success: true, id: hamperId, message: 'Hamper created successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create hamper' }, { status: 500 });
  }
}
