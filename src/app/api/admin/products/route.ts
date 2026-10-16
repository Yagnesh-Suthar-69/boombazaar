import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryAll, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ProductSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  sku: z.string().min(2).max(50),
  price: z.number().int().positive('Price must be greater than zero'),
  salePrice: z.number().int().optional().nullable(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(1).default(10),
  soundLevel: z.string().default('Medium'),
  altitude: z.string().default('Ground'),
  burstEffect: z.string().optional().nullable(),
  safetyInstructions: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  video: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;
    const products = await queryAll(sql);

    const parsed = products.map((prod: any) => {
      let images = [];
      try {
        images = typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images || [];
      } catch {
        images = [prod.images || ''];
      }
      return { ...prod, images };
    });

    return NextResponse.json({ products: parsed });
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = ProductSchema.parse(body);

    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const imagesJson = JSON.stringify(data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80']);

    await execute(
      `INSERT INTO products (
        id, name, slug, description, category_id, sku, price, sale_price, 
        stock, low_stock_threshold, sound_level, altitude, burst_effect, 
        safety_instructions, images, video, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.slug,
        data.description || '',
        data.categoryId,
        data.sku,
        data.price,
        data.salePrice || null,
        data.stock,
        data.lowStockThreshold,
        data.soundLevel,
        data.altitude,
        data.burstEffect || '',
        data.safetyInstructions || '',
        imagesJson,
        data.video || null,
        data.isFeatured ? 1 : 0,
        data.isActive ? 1 : 0,
      ]
    );

    // Record initial inventory movement
    if (data.stock > 0) {
      await execute(
        `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reason)
         VALUES (?, ?, 'restock', ?, 'Initial product creation inventory')`,
        [`im_${Date.now()}`, id, data.stock]
      );
    }

    return NextResponse.json({ success: true, id, message: 'Product created successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
