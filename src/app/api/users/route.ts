import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, createUser } from '@/lib/dbHelper';
import { sanitizeInput, isValidUsername, isValidPinFormat } from '@/lib/security';
import { isRateLimited } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username');

  if (!rawUsername) {
    return NextResponse.json({ error: 'Username parameter required' }, { status: 400 });
  }

  const cleanUsername = rawUsername.trim().toLowerCase();

  try {
    const user = await getUserByUsername(cleanUsername);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { pin, ...publicUser } = user;
    return NextResponse.json({ user: publicUser });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Client IP rate limiting (Max 3 account creations per 5 minutes per IP)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    if (isRateLimited(ip, 'create_user', 3, 5 * 60000)) {
      return NextResponse.json(
        { error: 'Terlalu banyak pendaftaran dari perangkat ini. Silakan coba lagi nanti.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, name, pin, bio_prompt, theme, avatar } = body;

    const cleanedUsername = (username || '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    if (!isValidUsername(cleanedUsername)) {
      return NextResponse.json(
        { error: 'Username harus 3-30 karakter (hanya huruf, angka, dan underscore _)' },
        { status: 400 }
      );
    }

    if (!isValidPinFormat(pin)) {
      return NextResponse.json(
        { error: 'PIN/Password minimal 4 karakter' },
        { status: 400 }
      );
    }

    const existingUser = await getUserByUsername(cleanedUsername);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan. Silakan pilih username lain.' },
        { status: 409 }
      );
    }

    // XSS Sanitization for text fields
    const safeName = sanitizeInput(name, 50) || 'Pengguna BisikLagu';
    const safeBio = sanitizeInput(bio_prompt, 200) || 'Kirimkan pesan rahasia & lagu favoritmu!';
    const safeTheme = sanitizeInput(theme, 30) || 'paper_binder';
    const safeAvatar = sanitizeInput(avatar, 10) || '🎵';

    const userId = `user_${crypto.randomUUID().slice(0, 8)}`;
    const user = await createUser({
      id: userId,
      username: cleanedUsername,
      name: safeName,
      pin,
      bio_prompt: safeBio,
      theme: safeTheme,
      avatar: safeAvatar,
    });

    if (!user) {
      return NextResponse.json({ error: 'Gagal membuat user' }, { status: 500 });
    }

    const { pin: _, ...publicUser } = user;
    return NextResponse.json({ user: publicUser, status: 'created' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
