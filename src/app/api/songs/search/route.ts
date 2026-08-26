import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 1. Search iTunes API for song details & audio preview MP3 link
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=song&limit=15&country=ID`;

    const res = await fetch(itunesUrl, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error('Failed to fetch from iTunes');
    }

    const data = await res.json();

    const formattedTracks = await Promise.all(
      (data.results || []).map(async (item: any) => {
        const highResArt = item.artworkUrl100
          ? item.artworkUrl100.replace('100x100bb', '600x600bb')
          : '';

        return {
          trackId: item.trackId,
          trackName: item.trackName,
          artistName: item.artistName,
          collectionName: item.collectionName,
          artworkUrl100: item.artworkUrl100,
          artworkUrl600: highResArt,
          previewUrl: item.previewUrl || '',
        };
      })
    );

    return NextResponse.json({ results: formattedTracks });
  } catch (error: any) {
    console.error('Song search error:', error);
    return NextResponse.json(
      { error: 'Failed to search songs', details: error.message },
      { status: 500 }
    );
  }
}
