import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryAll, queryFirst, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const AdjustSchema = z.object({
  productId: z.string().min(1),
  adjustmentType: z.enum(['restock', 'adjustment', 'damaged', 'writeoff']),
  quantity: z.number().int().refine(q => q !== 0, 'Quantity adjustment cannot be zero'),
  reason: z.string().min(3).max(300),
});

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await queryAll(`
      SELECT 
        p.id, p.name, p.sku, p.stock, p.low_stock_threshold, p.price, p.is_active,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.stock ASC
    `);

    const movements = await queryAll(`
      SELECT 
        im.*,
        p.name as product_name,
        p.sku
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      ORDER BY im.created_at DESC
      LIMIT 50
    `);

    return NextResponse.json({ products, movements });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = AdjustSchema.parse(body);

    const product = await queryFirst('SELECT id, name, stock FROM products WHERE id = ?', [data.productId]);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newStock = product.stock + data.quantity;
    if (newStock < 0) {
      return NextResponse.json({ error: 'Cannot reduce stock below zero' }, { status: 400 });
    }

    await execute('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStock, data.productId]);

    await execute(
      `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reason, reference_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        `im_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        data.productId,
        data.adjustmentType,
        data.quantity,
        `${data.reason} (by ${session.name})`,
        null,
      ]
    );

    return NextResponse.json({ success: true, newStock, message: 'Stock updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Inventory adjust error:', error);
    return NextResponse.json({ error: error.message || 'Failed to adjust inventory' }, { status: 500 });
  }
}
