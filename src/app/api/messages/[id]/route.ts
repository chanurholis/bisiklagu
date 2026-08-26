import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, deleteMessageById, replyToMessage } from '@/lib/dbHelper';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { username, pin, reply_text } = body;

    if (!username || !pin || !reply_text) {
      return NextResponse.json({ error: 'Username, PIN, dan isi balasan wajib diisi' }, { status: 400 });
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    if (user.pin !== pin) {
      return NextResponse.json({ error: 'PIN salah! Akses balasan ditolak.' }, { status: 401 });
    }

    const success = await replyToMessage(id, username, reply_text);
    if (!success) {
      return NextResponse.json({ error: 'Gagal menyimpannya' }, { status: 500 });
    }

    return NextResponse.json({ status: 'replied', reply_text });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
