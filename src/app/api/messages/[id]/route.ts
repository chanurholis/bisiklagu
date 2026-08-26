import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, deleteMessageById } from '@/lib/dbHelper';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const pin = searchParams.get('pin');

  if (!username || !pin) {
    return NextResponse.json({ error: 'Username dan PIN required' }, { status: 400 });
  }

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    if (user.pin !== pin) {
      return NextResponse.json({ error: 'PIN salah' }, { status: 401 });
    }

    const success = await deleteMessageById(id, username);
    if (!success) {
      return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ status: 'deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
