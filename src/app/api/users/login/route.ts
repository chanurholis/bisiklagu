import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyAndUpgradeUserPin } from '@/lib/dbHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, pin } = body;

    if (!username || !pin) {
      return NextResponse.json({ error: 'Username dan PIN harus diisi' }, { status: 400 });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const isValidPin = await verifyAndUpgradeUserPin(user, pin);

    if (!isValidPin) {
      return NextResponse.json({ error: 'PIN / Password salah! Akses ditolak.' }, { status: 401 });
    }

    // Never expose encrypted or raw PIN in API response
    const { pin: _, ...publicUser } = user;
    return NextResponse.json({ success: true, user: publicUser });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
