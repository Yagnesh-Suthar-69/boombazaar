import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryFirst, queryAll, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const UpdateHamperSchema = z.object({
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hamper = await queryFirst('SELECT * FROM hampers WHERE id = ?', [params.id]);
    if (!hamper) {
      return NextResponse.json({ error: 'Hamper not found' }, { status: 404 });
    }

    hamper.images = hamper.images ? JSON.parse(hamper.images) : [];
    const items = await queryAll(`
      SELECT hi.id, hi.product_id, hi.quantity, p.name as product_name, p.sku, p.price, p.sale_price
      FROM hamper_items hi
      JOIN products p ON hi.product_id = p.id
      WHERE hi.hamper_id = ?
    `, [params.id]);
    hamper.items = items;

    return NextResponse.json({ hamper });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch hamper' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = UpdateHamperSchema.parse(body);

    const pricePaise = Math.round(data.priceRupees * 100);
    const salePricePaise = data.salePriceRupees ? Math.round(data.salePriceRupees * 100) : null;

    // Check slug collision
    const slugCheck = await queryFirst('SELECT id FROM hampers WHERE slug = ? AND id != ?', [data.slug, params.id]);
    if (slugCheck) {
      return NextResponse.json({ error: 'Another hamper already uses this slug' }, { status: 400 });
    }

    // Update hamper
    await execute(
      `UPDATE hampers
       SET name = ?, slug = ?, description = ?, price = ?, sale_price = ?,
           images = ?, video = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        data.name,
        data.slug,
        data.description || '',
        pricePaise,
        salePricePaise,
        JSON.stringify(data.images),
        data.video || null,
        data.isFeatured ? 1 : 0,
        data.isActive ? 1 : 0,
        params.id,
      ]
    );

    // Replace included items
    await execute('DELETE FROM hamper_items WHERE hamper_id = ?', [params.id]);
    for (const item of data.items) {
      const itemId = `hmi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await execute(
        'INSERT INTO hamper_items (id, hamper_id, product_id, quantity) VALUES (?, ?, ?, ?)',
        [itemId, params.id, item.productId, item.quantity]
      );
    }

    // Sync products table
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
        params.id,
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

    return NextResponse.json({ success: true, message: 'Hamper updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update hamper' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if hamper is in any existing orders
    const inOrders = await queryFirst('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [params.id]);
    if (inOrders) {
      // Soft-delete / archive
      await execute('UPDATE hampers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [params.id]);
      await execute('UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [params.id]);
      return NextResponse.json({ success: true, message: 'Hamper appears in existing orders and was archived instead of deleted.' });
    }

    await execute('DELETE FROM hamper_items WHERE hamper_id = ?', [params.id]);
    await execute('DELETE FROM hampers WHERE id = ?', [params.id]);
    await execute('DELETE FROM products WHERE id = ?', [params.id]);

    return NextResponse.json({ success: true, message: 'Hamper deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete hamper' }, { status: 500 });
  }
}
