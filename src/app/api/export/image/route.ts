import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message_text,
      song_title,
      song_artist,
      song_album_cover,
      selected_lyrics,
      sender_alias,
      recipient_name,
      hint_sender,
      username,
    } = body;

    // Create 1080x1920 High Resolution Canvas for IG Story
    const width = 1080;
    const height = 1920;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Background - Warm Binder Kraft/Paper Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#fbf8f3');
    bgGradient.addColorStop(0.5, '#f7f2e7');
    bgGradient.addColorStop(1, '#ebdcc9');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Leather Binder Outer Border
    ctx.lineWidth = 24;
    ctx.strokeStyle = '#3d3028';
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Red Notebook Margin Line
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.moveTo(140, 0);
    ctx.lineTo(140, height);
    ctx.stroke();

    // Binder Rings on Left Margin
    const ringPositions = [200, 500, 800, 1100, 1400, 1700];
    ringPositions.forEach((y) => {
      // Ring Hole
      ctx.fillStyle = '#2d2520';
      ctx.beginPath();
      ctx.arc(70, y, 22, 0, Math.PI * 2);
      ctx.fill();

      // Metallic Ring
      const ringGrad = ctx.createLinearGradient(10, y, 100, y);
      ringGrad.addColorStop(0, '#9ca3af');
      ringGrad.addColorStop(0.5, '#f3f4f6');
      ringGrad.addColorStop(1, '#4b5563');
      ctx.fillStyle = ringGrad;
      ctx.fillRect(20, y - 10, 70, 20);
    });

    // 3. Header Text - BisikLagu
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('BISIKLAGU • CATATAN RAHASIA', 180, 120);

    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(`Pesan Rahasia untuk ${recipient_name || 'Kamu'}`, 180, 180);

    // 4. Sticky Post-It Note (Main Message Box)
    const boxX = 180;
    const boxY = 240;
    const boxW = 820;
    const boxH = 420;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(boxX + 12, boxY + 12, boxW, boxH);

    // Sticky Note Yellow Fill
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fde047';
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Tape Accent
    ctx.fillStyle = 'rgba(253, 230, 138, 0.9)';
    ctx.fillRect(boxX + boxW / 2 - 120, boxY - 20, 240, 44);

    // Sender Tag
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`Dari: ${sender_alias || 'Pengagum Rahasia'}`, boxX + 40, boxY + 70);

    // Message Text (Word Wrap)
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 40px sans-serif';
    
    const words = (message_text || '').split(' ');
    let line = '';
    let currY = boxY + 140;
    const maxWidth = boxW - 80;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(`"${line.trim()}"`, boxX + 40, currY);
        line = words[n] + ' ';
        currY += 56;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      ctx.fillText(`"${line.trim()}"`, boxX + 40, currY);
    }

    // 5. Lyrics Quote Box (If present)
    let nextY = 700;
    if (selected_lyrics) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(boxX, nextY, boxW, 260);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(boxX, nextY, boxW, 260);

      // Left Accent Strip
      ctx.fillStyle = '#d97706';
      ctx.fillRect(boxX, nextY, 16, 260);

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('KUTIPAN LIRIK PILIHAN:', boxX + 40, nextY + 60);

      ctx.fillStyle = '#334155';
      ctx.font = 'italic 34px sans-serif';
      ctx.fillText(`"${selected_lyrics}"`, boxX + 40, nextY + 130);

      nextY += 300;
    }

    // 6. Song Player Section (If present)
    if (song_title) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(boxX, nextY, boxW, 240);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(boxX, nextY, boxW, 240);

      // Try loading album cover image
      if (song_album_cover) {
        try {
          const img = await loadImage(song_album_cover);
          ctx.drawImage(img, boxX + 30, nextY + 30, 180, 180);
        } catch (e) {
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(boxX + 30, nextY + 30, 180, 180);
        }
      }

      const songTextX = boxX + 240;
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('LAGU RAHASIA', songTextX, nextY + 70);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText(song_title, songTextX, nextY + 125);

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(song_artist || '', songTextX, nextY + 175);

      nextY += 270;
    }

    // 7. Hint Sender
    if (hint_sender) {
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(boxX, nextY, boxW, 100);
      ctx.strokeStyle = '#fde047';
      ctx.strokeRect(boxX, nextY, boxW, 100);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(`💡 Petunjuk: ${hint_sender}`, boxX + 40, nextY + 60);
    }

    // 8. Footer Link Bar for IG Story
    ctx.fillStyle = '#451a03';
    ctx.fillRect(180, 1720, boxW, 120);

    const host = request.headers.get('host') || 'bisiklagu.com';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Kirim Pesan & Lagu Rahasiamu di Link Bio', width / 2 + 50, 1775);
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`${host}/u/${username || 'user'}`, width / 2 + 50, 1815);

    // Convert Canvas to PNG Uint8Array Buffer
    const buffer = canvas.toBuffer('image/png');
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="bisiklagu-story-${Date.now()}.png"`,
      },
    });
  } catch (error: any) {
    console.error('Server Image Export Error:', error);
    return NextResponse.json({ error: 'Failed to render image on server' }, { status: 500 });
  }
}
