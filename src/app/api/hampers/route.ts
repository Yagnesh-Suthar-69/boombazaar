import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hampers = await queryAll('SELECT * FROM hampers WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC');

    for (const h of hampers) {
      h.images = h.images ? JSON.parse(h.images) : [];
      
      const items = await queryAll(`
        SELECT 
          hi.quantity, 
          p.id as product_id, 
          p.name as product_name, 
          p.slug as product_slug, 
          p.sku, 
          p.price, 
          p.sale_price, 
          p.sound_level, 
          p.altitude,
          p.images as product_images,
          p.category_id
        FROM hamper_items hi
        JOIN products p ON hi.product_id = p.id
        WHERE hi.hamper_id = ?
      `, [h.id]);

      h.items = items.map((it: any) => {
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

      // Calculate total retail value of included items
      h.retail_total = h.items.reduce((sum: number, it: any) => {
        const itemPrice = it.sale_price && it.sale_price > 0 ? it.sale_price : it.price;
        return sum + (itemPrice * it.quantity);
      }, 0);

      // Fetch related products (other popular products not in this hamper or complementary items)
      const includedIds = h.items.map((it: any) => `'${it.product_id}'`).join(',');
      const excludeClause = includedIds ? `AND id NOT IN (${includedIds})` : '';
      const related = await queryAll(`
        SELECT id, name, slug, price, sale_price, images, sound_level, altitude, category_id
        FROM products
        WHERE is_active = 1 ${excludeClause}
        ORDER BY is_featured DESC, stock DESC
        LIMIT 6
      `);

      h.related_products = related.map((r: any) => {
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
    }

    return NextResponse.json({ hampers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch hampers' }, { status: 500 });
  }
}
