import { NextResponse } from 'next/server';
import { queryFirst, queryAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.slug = ? OR p.id = ?) AND p.is_active = 1
    `;

    const product = await queryFirst(sql, [slug, slug]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let images: string[] = [];
    try {
      images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
    } catch {
      images = [product.images || ''];
    }

    // Fetch related products in same category
    const relatedSql = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
      LIMIT 4
    `;
    const related = await queryAll(relatedSql, [product.category_id, product.id]);

    const parsedRelated = related.map((r: any) => {
      let rImgs = [];
      try {
        rImgs = typeof r.images === 'string' ? JSON.parse(r.images) : r.images || [];
      } catch {
        rImgs = [];
      }
      return {
        ...r,
        images: rImgs,
        primary_image: rImgs[0] || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
      };
    });

    return NextResponse.json({
      product: {
        ...product,
        images,
        primary_image: images[0] || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
      },
      related: parsedRelated,
    });
  } catch (error: any) {
    console.error('Error fetching product details:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}
