import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryAll, execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
});

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await queryAll('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = CategorySchema.parse(body);

    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await execute(
      'INSERT INTO categories (id, name, slug, description, image, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.name, data.slug, data.description || '', data.image || '', data.displayOrder]
    );

    return NextResponse.json({ success: true, id, message: 'Category created successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
