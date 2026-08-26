import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, createUser } from '@/lib/dbHelper';
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username parameter required' }, { status: 400 });
  }

  try {
    const user = await getUserByUsername(username);

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
    const body = await request.json();
    const { username, name, pin, bio_prompt, theme, avatar } = body;

    if (!username || !name || !pin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanedUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    if (cleanedUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter (huruf, angka, _)' },
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

    const userId = `user_${crypto.randomUUID().slice(0, 8)}`;
    const user = await createUser({
      id: userId,
      username: cleanedUsername,
      name,
      pin,
      bio_prompt,
      theme,
      avatar,
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
