import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStockOnly = searchParams.get('inStockOnly') === 'true';
    const sort = searchParams.get('sort') || 'featured';
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const offset = (page - 1) * limit;

    let conditions: string[] = ['p.is_active = 1'];
    let params: any[] = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (category) {
      conditions.push('(c.slug = ? OR p.category_id = ?)');
      params.push(category, category);
    }

    if (inStockOnly) {
      conditions.push('p.stock > 0');
    }

    if (minPrice) {
      conditions.push('COALESCE(p.sale_price, p.price) >= ?');
      params.push(Number(minPrice) * 100);
    }

    if (maxPrice) {
      conditions.push('COALESCE(p.sale_price, p.price) <= ?');
      params.push(Number(maxPrice) * 100);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'p.is_featured DESC, p.created_at DESC';
    if (sort === 'price_asc') {
      orderBy = 'COALESCE(p.sale_price, p.price) ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'COALESCE(p.sale_price, p.price) DESC';
    } else if (sort === 'name_asc') {
      orderBy = 'p.name ASC';
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countResult = await queryFirst<{ total: number }>(countQuery, params);
    const total = countResult?.total || 0;

    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const products = await queryAll(sql, [...params, limit, offset]);

    // Parse image JSON arrays safely
    const parsedProducts = products.map((prod: any) => {
      let images: string[] = [];
      try {
        images = typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images || [];
      } catch {
        images = [prod.images || ''];
      }
      return {
        ...prod,
        images,
        primary_image: images[0] || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
      };
    });

    return NextResponse.json({
      products: parsedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}
