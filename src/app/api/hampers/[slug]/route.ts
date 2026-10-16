import { NextResponse } from 'next/server';
import { queryFirst, queryAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const hamper = await queryFirst('SELECT * FROM hampers WHERE slug = ? AND is_active = 1', [params.slug]);
    if (!hamper) {
      return NextResponse.json({ error: 'Hamper not found' }, { status: 404 });
    }

    hamper.images = hamper.images ? JSON.parse(hamper.images) : [];
    const items = await queryAll(`
      SELECT hi.quantity, p.id as product_id, p.name as product_name, p.slug as product_slug, p.sku, p.price, p.sale_price, p.sound_level, p.altitude, p.images as product_images
      FROM hamper_items hi
      JOIN products p ON hi.product_id = p.id
      WHERE hi.hamper_id = ?
    `, [hamper.id]);

    hamper.items = items.map((it: any) => {
      let parsedImages: string[] = [];
      try {
        parsedImages = it.product_images ? JSON.parse(it.product_images) : [];
      } catch {
        parsedImages = [];
      }
      return {
        ...it,
        product_images: parsedImages,
        image: parsedImages[0] || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
      };
    });

    hamper.retail_total = hamper.items.reduce((sum: number, it: any) => {
      const itemPrice = it.sale_price && it.sale_price > 0 ? it.sale_price : it.price;
      return sum + (itemPrice * it.quantity);
    }, 0);

    const includedIds = hamper.items.map((it: any) => `'${it.product_id}'`).join(',');
    const excludeClause = includedIds ? `AND id NOT IN (${includedIds})` : '';
    const related = await queryAll(`
      SELECT id, name, slug, price, sale_price, images, sound_level, altitude, category_id
      FROM products
      WHERE is_active = 1 ${excludeClause}
      ORDER BY is_featured DESC, stock DESC
      LIMIT 8
    `);

    hamper.related_products = related.map((r: any) => {
      let parsed: string[] = [];
      try {
        parsed = r.images ? JSON.parse(r.images) : [];
      } catch {
        parsed = [];
      }
      return {
        ...r,
        images: parsed,
        image: parsed[0] || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
      };
    });

    return NextResponse.json({ hamper });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch hamper details' }, { status: 500 });
  }
}
