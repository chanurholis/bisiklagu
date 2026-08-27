import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, deleteMessageById, replyToMessage, verifyAndUpgradeUserPin } from '@/lib/dbHelper';
import { sanitizeInput } from '@/lib/security';
import { verifySessionToken } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username');
  const pin = searchParams.get('pin');
  const tokenParam = searchParams.get('token');

  if (!rawUsername) {
    return NextResponse.json({ error: 'Username parameter required' }, { status: 400 });
  }

  const username = rawUsername.trim().toLowerCase();

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Auth check: Session token (0 CPU overhead) or PIN fallback
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const cookieToken = request.cookies.get('bisiklagu_token')?.value;
    const token = bearerToken || cookieToken || tokenParam;

    let isAuthenticated = false;
    if (token && verifySessionToken(token, username)) {
      isAuthenticated = true;
    } else if (pin) {
      isAuthenticated = await verifyAndUpgradeUserPin(user, pin);
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Akses hapus ditolak. Hanya penerima asli yang dapat menghapus.' }, { status: 403 });
    }

    // deleteMessageById checks BOTH message id AND recipient username
    const success = await deleteMessageById(id, username);
    if (!success) {
      return NextResponse.json({ error: 'Pesan tidak ditemukan atau Anda bukan pemilik pesan ini.' }, { status: 404 });
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
    const { username, pin, token: tokenBody, reply_text } = body;

    if (!username || !reply_text) {
      return NextResponse.json({ error: 'Username dan isi balasan wajib diisi' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    const user = await getUserByUsername(cleanUsername);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Auth check: Session token or PIN fallback
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const cookieToken = request.cookies.get('bisiklagu_token')?.value;
    const token = bearerToken || cookieToken || tokenBody;

    let isAuthenticated = false;
    if (token && verifySessionToken(token, cleanUsername)) {
      isAuthenticated = true;
    } else if (pin) {
      isAuthenticated = await verifyAndUpgradeUserPin(user, pin);
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Akses balasan ditolak. Hanya pemilik link yang berhak membalas.' }, { status: 403 });
    }

    // Sanitize public reply text to prevent stored XSS
    const safeReplyText = sanitizeInput(reply_text, 1000);

    // replyToMessage checks BOTH message id AND recipient username
    const success = await replyToMessage(id, cleanUsername, safeReplyText);
    if (!success) {
      return NextResponse.json({ error: 'Gagal menyimpan balasan atau Anda bukan pemilik pesan ini.' }, { status: 404 });
    }

    return NextResponse.json({ status: 'replied', reply_text: safeReplyText });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
