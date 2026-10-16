import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryFirst, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const EditProductSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  sku: z.string().min(2).max(50),
  price: z.number().int().positive(),
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const data = EditProductSchema.parse(body);

    const existing = await queryFirst('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const imagesJson = JSON.stringify(data.images.length > 0 ? data.images : [existing.images ? JSON.parse(existing.images)[0] : '']);

    await execute(
      `UPDATE products SET 
        name = ?, slug = ?, description = ?, category_id = ?, sku = ?, 
        price = ?, sale_price = ?, stock = ?, low_stock_threshold = ?, 
        sound_level = ?, altitude = ?, burst_effect = ?, safety_instructions = ?, 
        images = ?, video = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
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
        data.video !== undefined ? data.video : existing.video,
        data.isFeatured ? 1 : 0,
        data.isActive ? 1 : 0,
        id,
      ]
    );

    // If stock changed manually, record adjustment
    if (data.stock !== existing.stock) {
      const diff = data.stock - existing.stock;
      await execute(
        `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reason)
         VALUES (?, ?, 'adjustment', ?, 'Manual stock edit from admin panel')`,
        [`im_${Date.now()}`, id, diff]
      );
    }

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
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

    const { id } = params;

    // Check if referenced in orders or sales
    const inOrderItems = await queryFirst('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [id]);
    const inSaleItems = await queryFirst('SELECT id FROM sale_items WHERE product_id = ? LIMIT 1', [id]);

    if (inOrderItems || inSaleItems) {
      // Safe archival instead of hard deletion to preserve historical records
      await execute('UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
      return NextResponse.json({
        success: true,
        message: 'Product is linked to existing order records. It has been safely archived (marked inactive).',
        archived: true,
      });
    }

    // Otherwise safe to delete
    await execute('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Product deleted permanently' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
