import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSession, hashPassword, verifyPassword, createSessionToken, getSessionCookieOptions } from '@/lib/auth';
import { execute, queryFirst } from '@/lib/db';

export const dynamic = 'force-dynamic';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Please enter current password'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(body);

    // Fetch existing password hash
    const admin = await queryFirst('SELECT id, password_hash, email, name, role, username FROM admins WHERE id = ?', [session.id]);
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = verifyPassword(currentPassword, admin.password_hash);
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    // Hash new password & clear must_change_password flag
    const newHash = hashPassword(newPassword);
    await execute(
      'UPDATE admins SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, session.id]
    );

    // Generate new session token with must_change_password: false
    const updatedSession = {
      ...session,
      must_change_password: false,
    };
    const token = await createSessionToken(updatedSession);
    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      message: 'Password changed successfully. You can now access the full admin dashboard.',
    });
    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Password change error:', error);
    return NextResponse.json({ error: error.message || 'Failed to change password' }, { status: 500 });
  }
}
