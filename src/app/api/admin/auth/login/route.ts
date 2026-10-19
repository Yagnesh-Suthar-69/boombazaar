import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryFirst } from '@/lib/db';
import { verifyPassword, createSessionToken, getSessionCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const LoginSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  usernameOrEmail: z.string().optional(),
  password: z.string().min(1, 'Please enter password'),
}).refine(data => data.email || data.username || data.usernameOrEmail, {
  message: 'Please enter username or email',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.parse(body);
    const identifier = (parsed.usernameOrEmail || parsed.username || parsed.email || '').trim().toLowerCase();
    const password = parsed.password;

    const admin = await queryFirst(
      'SELECT id, name, email, username, password_hash, role, must_change_password FROM admins WHERE LOWER(email) = ? OR LOWER(username) = ?',
      [identifier, identifier]
    );

    if (!admin) {
      return NextResponse.json({ error: 'Invalid admin username/email or password' }, { status: 401 });
    }

    const isValid = verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid admin username/email or password' }, { status: 401 });
    }

    const mustChangePassword = Number(admin.must_change_password) === 1;

    const sessionPayload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      username: admin.username || undefined,
      role: admin.role,
      must_change_password: mustChangePassword,
    };

    const token = await createSessionToken(sessionPayload);
    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      admin: sessionPayload,
      must_change_password: mustChangePassword,
      message: mustChangePassword ? 'Password change required on first login' : 'Login successful',
    });

    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Admin login error:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
