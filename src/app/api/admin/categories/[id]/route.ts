import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryFirst, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CategoryUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
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

    const body = await request.json();
    const data = CategoryUpdateSchema.parse(body);

    // Check slug collision
    const slugCheck = await queryFirst('SELECT id FROM categories WHERE slug = ? AND id != ?', [data.slug, params.id]);
    if (slugCheck) {
      return NextResponse.json({ error: 'Another category already uses this slug' }, { status: 400 });
    }

    await execute(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image = ?, display_order = ? WHERE id = ?',
      [data.name, data.slug, data.description || '', data.image || '', data.displayOrder, params.id]
    );

    return NextResponse.json({ success: true, message: 'Category updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
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

    // Check if category has products
    const productCount = await queryFirst('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [params.id]);
    if (productCount && productCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category because it contains ${productCount.count} products. Reassign products first.` },
        { status: 400 }
      );
    }

    await execute('DELETE FROM categories WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
