import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getMessagesByUsername, getRecentPublicMessages, createMessage, verifyAndUpgradeUserPin, markMessagesAsRead } from '@/lib/dbHelper';
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const pin = searchParams.get('pin');
  const isPublic = searchParams.get('public') === 'true';
  const isRecent = searchParams.get('recent') === 'true';

  if (isRecent) {
    try {
      const recentMessages = await getRecentPublicMessages(6);
      // Hide exact target username for anonymity & CTA attraction
      const sanitized = recentMessages.map((m) => ({
        ...m,
        username: 'Penerima Anonim',
      }));
      return NextResponse.json({ messages: sanitized });
    } catch (err) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  if (!username) {
    return NextResponse.json({ error: 'Username parameter required' }, { status: 400 });
  }

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!isPublic) {
      if (!pin) {
        return NextResponse.json({ error: 'PIN wajib diisi untuk inbox' }, { status: 401 });
      }
      const isValidPin = await verifyAndUpgradeUserPin(user, pin);
      if (!isValidPin) {
        return NextResponse.json({ error: 'PIN salah! Akses inbox ditolak.' }, { status: 401 });
      }
      // When user successfully accesses inbox with PIN, mark unread messages as read
      await markMessagesAsRead(username);
    }

    const messages = await getMessagesByUsername(username);
    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      sender_alias,
      message_text,
      song_title,
      song_artist,
      song_album_cover,
      song_preview_url,
      selected_lyrics,
      theme_style,
      hint_sender,
    } = body;

    if (!username || !message_text) {
      return NextResponse.json(
        { error: 'Username dan isi pesan wajib diisi' },
        { status: 400 }
      );
    }

    const targetUser = await getUserByUsername(username);
    if (!targetUser) {
      return NextResponse.json({ error: 'User tujuan tidak ditemukan' }, { status: 404 });
    }

    const messageId = `msg_${crypto.randomUUID().slice(0, 10)}`;

    const message = await createMessage({
      id: messageId,
      username,
      sender_alias,
      message_text,
      song_title,
      song_artist,
      song_album_cover,
      song_preview_url,
      selected_lyrics,
      theme_style,
      hint_sender,
    });

    return NextResponse.json({ message, status: 'sent' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
