import { NextRequest, NextResponse } from 'next/server';
import { decodeHTMLEntities } from '@/lib/security';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const track = searchParams.get('track');
  const artist = searchParams.get('artist');

  if (!track || !artist) {
    return NextResponse.json({ lyrics: [] });
  }

  try {
    const lrcUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(
      track
    )}&artist_name=${encodeURIComponent(artist)}`;

    const res = await fetch(lrcUrl, { headers: { 'User-Agent': 'SecretVibeApp/1.0' } });
    if (!res.ok) {
      return NextResponse.json({ lyrics: [] });
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const match = data[0];
      const plainLyrics = match.plainLyrics || match.syncedLyrics || '';
      
      // Split into clean lines, decode HTML entities, remove empty lines
      const lines = plainLyrics
        .split('\n')
        .map((line: string) => decodeHTMLEntities(line.replace(/\[\d+:\d+\.\d+\]/g, '')).trim())
        .filter((line: string) => line.length > 0 && !line.startsWith('['));

      return NextResponse.json({
        lyrics: lines.slice(0, 30),
        syncedLyrics: match.syncedLyrics,
      });
    }

    return NextResponse.json({ lyrics: [] });
  } catch (err) {
    return NextResponse.json({ lyrics: [] });
  }
}
