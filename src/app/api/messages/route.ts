import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getMessagesByUsername, getRecentPublicMessages, createMessage, verifyAndUpgradeUserPin, markMessagesAsRead } from '@/lib/dbHelper';
import { sanitizeInput, isValidUsername } from '@/lib/security';
import { isRateLimited } from '@/lib/rateLimit';
import { verifySessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username');
  const pin = searchParams.get('pin');
  const tokenParam = searchParams.get('token');
  const isPublic = searchParams.get('public') === 'true';
  const isRecent = searchParams.get('recent') === 'true';

  if (isRecent) {
    try {
      const recentMessages = await getRecentPublicMessages(6);
      const sanitized = recentMessages.map((m) => ({
        ...m,
        username: 'Penerima Anonim',
      }));
      return NextResponse.json({ messages: sanitized });
    } catch (err) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  if (!rawUsername) {
    return NextResponse.json({ error: 'Username parameter required' }, { status: 400 });
  }

  const username = rawUsername.trim().toLowerCase();

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!isPublic) {
      // 1. Check Session Token first (Fast HMAC check, 0 bcrypt overhead!)
      const authHeader = request.headers.get('authorization');
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      const cookieToken = request.cookies.get('bisiklagu_token')?.value;
      const token = bearerToken || cookieToken || tokenParam;

      let isAuthenticated = false;

      if (token && verifySessionToken(token, username)) {
        isAuthenticated = true;
      } else if (pin) {
        // 2. Fallback to PIN verification if no session token
        isAuthenticated = await verifyAndUpgradeUserPin(user, pin);
      }

      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Akses inbox ditolak. Silakan login terlebih dahulu.' }, { status: 401 });
      }

      // Mark unread messages as read upon authenticated inbox access
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
    // Rate Limiting: Max 10 messages per minute per IP to prevent spamming
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    if (isRateLimited(ip, 'send_message', 10, 60000)) {
      return NextResponse.json(
        { error: 'Terlalu banyak pesan terkirim. Silakan tunggu 1 menit lagi.' },
        { status: 429 }
      );
    }

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

    const targetUsername = (username || '').trim().toLowerCase();

    if (!isValidUsername(targetUsername) || !message_text || !message_text.trim()) {
      return NextResponse.json(
        { error: 'Username dan isi pesan wajib diisi' },
        { status: 400 }
      );
    }

    const targetUser = await getUserByUsername(targetUsername);
    if (!targetUser) {
      return NextResponse.json({ error: 'User tujuan tidak ditemukan' }, { status: 404 });
    }

    // XSS Sanitization for incoming secret message fields
    const safeSenderAlias = sanitizeInput(sender_alias, 50) || 'Pengagum Rahasia';
    const safeMessageText = sanitizeInput(message_text, 1000);
    const safeSongTitle = sanitizeInput(song_title, 100);
    const safeSongArtist = sanitizeInput(song_artist, 100);
    const safeSelectedLyrics = sanitizeInput(selected_lyrics, 500);
    const safeThemeStyle = sanitizeInput(theme_style, 30) || 'paper_binder';
    const safeHintSender = sanitizeInput(hint_sender, 100);

    const messageId = `msg_${crypto.randomUUID().slice(0, 10)}`;

    const message = await createMessage({
      id: messageId,
      username: targetUsername,
      sender_alias: safeSenderAlias,
      message_text: safeMessageText,
      song_title: safeSongTitle,
      song_artist: safeSongArtist,
      song_album_cover: song_album_cover || null,
      song_preview_url: song_preview_url || null,
      selected_lyrics: safeSelectedLyrics,
      theme_style: safeThemeStyle,
      hint_sender: safeHintSender,
    });

    return NextResponse.json({ message, status: 'sent' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
