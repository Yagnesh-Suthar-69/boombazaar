import { NextResponse } from 'next/server';
import { getAdminSession, getSessionCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ admin: session });
}

export async function POST() {
  const cookieOptions = getSessionCookieOptions();
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete(cookieOptions.name);
  return response;
}
