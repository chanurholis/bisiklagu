import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const username = searchParams.get('username') || 'bisiklagu';
    const name = searchParams.get('name') || username;
    const bio = searchParams.get('bio') || 'Kirimkan pesan rahasia & lagu favoritmu secara anonim!';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1c1917',
            fontFamily: 'sans-serif',
            padding: '40px',
          }}
        >
          {/* Main Paper Notebook Card Container */}
          <div
            style={{
              width: '1000px',
              height: '520px',
              backgroundColor: '#fffefb',
              border: '6px solid #292524',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '48px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative',
            }}
          >
            {/* Red Margin Line */}
            <div
              style={{
                position: 'absolute',
                left: '120px',
                top: 0,
                bottom: 0,
                width: '3px',
                backgroundColor: 'rgba(239, 68, 68, 0.35)',
              }}
            />

            {/* Binder Ring Accents */}
            <div
              style={{
                position: 'absolute',
                left: '24px',
                top: '40px',
                bottom: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#1c1917',
                  }}
                />
              ))}
            </div>

            {/* Header Content */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: '110px',
                borderBottom: '3px solid #e7e5e4',
                paddingBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#1c1917',
                    color: '#faf7f2',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 900,
                  }}
                >
                  B
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#1c1917' }}>
                    BisikLagu
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#b45309' }}>
                    Pesan & Melodi Rahasia
                  </span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#fef3c7',
                  color: '#78350f',
                  border: '2px solid #f59e0b',
                  padding: '8px 20px',
                  borderRadius: '30px',
                  fontSize: '18px',
                  fontWeight: 800,
                }}
              >
                🎵 @{username}
              </div>
            </div>

            {/* Body Content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                paddingLeft: '110px',
                marginTop: '20px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#faf7f2',
                  border: '2px solid #e7e5e4',
                  borderRadius: '12px',
                  padding: '24px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                  Kirim Pesan Rahasia untuk:
                </span>
                <span style={{ fontSize: '36px', fontWeight: 900, color: '#1c1917' }}>
                  {name}
                </span>
                <span style={{ fontSize: '22px', fontWeight: 600, color: '#57534e', marginTop: '4px' }}>
                  "{bio}"
                </span>
              </div>
            </div>

            {/* Footer Content */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: '110px',
                borderTop: '3px solid #e7e5e4',
                paddingTop: '16px',
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#78716c' }}>
                Kirim pesan & lagu rahasiamu tanpa ketahuan pengirimnya
              </span>
              <div
                style={{
                  backgroundColor: '#1c1917',
                  color: '#faf7f2',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  fontSize: '20px',
                  fontWeight: 800,
                }}
              >
                bisiklagu.com/u/{username}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OG image`, { status: 500 });
  }
}
