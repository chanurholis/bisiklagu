import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyAndUpgradeUserPin } from '@/lib/dbHelper';
import { isValidUsername, isValidPinFormat } from '@/lib/security';
import { isRateLimited } from '@/lib/rateLimit';
import { generateSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // Brute force protection: Max 5 login attempts per minute
    if (isRateLimited(ip, 'login', 5, 60000)) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login. Silakan tunggu 1 menit lagi.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, pin } = body;

    const cleanUsername = (username || '').trim().toLowerCase();

    if (!isValidUsername(cleanUsername) || !isValidPinFormat(pin)) {
      return NextResponse.json({ error: 'Format Username atau PIN tidak valid' }, { status: 400 });
    }

    const user = await getUserByUsername(cleanUsername);

    if (!user) {
      return NextResponse.json({ error: 'Username atau PIN salah' }, { status: 401 });
    }

    const isValidPin = await verifyAndUpgradeUserPin(user, pin);

    if (!isValidPin) {
      return NextResponse.json({ error: 'Username atau PIN salah' }, { status: 401 });
    }

    // Generate lightweight, cryptographically signed auth token
    const token = generateSessionToken(cleanUsername);

    const { pin: _, ...publicUser } = user;
    const response = NextResponse.json({
      success: true,
      token,
      user: publicUser,
    });

    // Set secure cookie
    response.cookies.set('bisiklagu_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
