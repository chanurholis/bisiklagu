import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUnreadMessageCount, verifyAndUpgradeUserPin } from '@/lib/dbHelper';
import { isValidUsername } from '@/lib/security';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username');
  const pin = searchParams.get('pin');

  if (!rawUsername) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  const username = rawUsername.trim().toLowerCase();

  if (!isValidUsername(username)) {
    return NextResponse.json({ unreadCount: 0 });
  }

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ unreadCount: 0 });
    }

    if (pin) {
      const isValid = await verifyAndUpgradeUserPin(user, pin);
      if (!isValid) {
        return NextResponse.json({ unreadCount: 0 });
      }
    }

    const unreadCount = await getUnreadMessageCount(username);
    return NextResponse.json({ unreadCount });
  } catch (err) {
    return NextResponse.json({ unreadCount: 0 });
  }
}
