'use client';

import React, { useState } from 'react';
import { SecretMessage, StoryTheme } from '@/types';
import StoryCard from './StoryCard';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

interface StoryExporterModalProps {
  message: SecretMessage;
  recipientName: string;
  onClose: () => void;
}

const THEMES: { id: StoryTheme; label: string; icon: string; tag: string }[] = [
  { id: 'question_box', label: 'Question Box', icon: '💬', tag: 'Stiker Rahasia' },
  { id: 'paper_binder', label: 'Buku Binder', icon: '📒', tag: 'Classic Paper' },
  { id: 'pastel_love', label: 'Soft Pastel', icon: '🌸', tag: 'Romantis & Manis' },
  { id: 'retro_vinyl', label: 'Retro Vinyl', icon: '📻', tag: 'Vintage Cool' },
  { id: 'sunset', label: 'Sunset Glow', icon: '🌇', tag: 'Warm Aesthetic' },
  { id: 'neon_dark', label: 'OLED Cyber', icon: '🟢', tag: 'Futuristic Neon' },
  { id: 'glassmorphism', label: 'Dark Glass', icon: '💎', tag: 'Modern Cool' },
  { id: 'spotify', label: 'Spotify Lyric', icon: '🎵', tag: 'Minimalist' },
  { id: 'cyberpunk', label: 'Electric Pop', icon: '✨', tag: 'Lucu & Vibrant' },
];

export default function StoryExporterModal({
  message,
  recipientName,
  onClose,
}: StoryExporterModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>(
    (message.theme_style as StoryTheme) || 'paper_binder'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isVideoExporting, setIsVideoExporting] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const updatedMessage = {
    ...message,
    theme_style: selectedTheme,
  };

  // 1. Fail-Proof High-Definition (HD) Image Export & Mobile Download
  const handleDownloadPNGClient = async () => {
    const cardEl = document.getElementById('story-card-content');
    if (!cardEl) return;

    try {
      setIsExporting(true);

      // Render HD 3x Resolution PNG Data URL
      const dataUrl = await toPng(cardEl, {
        cacheBust: true,
        pixelRatio: 3,
        quality: 1.0,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `bisiklagu-kartu-${selectedTheme}-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Priority A: Mobile Web Share API for Mobile Safari & Brave (Opens iOS Native Action Sheet / Save to Photos)
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Kartu Pesan Rahasia - BisikLagu',
            text: `Kartu rahasia dari BisikLagu untuk @${recipientName}`,
          });
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') return; // User cancelled share sheet
        }
      }

      // Priority B: Direct Blob Download (Desktop & Supporting Browsers)
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Priority C: Set preview image modal so mobile browser users can long-press to save to photos
      setPreviewImageUrl(dataUrl);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error('Client export error, trying server fallback:', err);
      // Fallback: Server-side High-Res Export
      try {
        const res = await fetch('/api/export/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message_text: message.message_text,
            song_title: message.song_title,
            song_artist: message.song_artist,
            song_album_cover: message.song_album_cover,
            selected_lyrics: message.selected_lyrics,
            sender_alias: message.sender_alias,
            recipient_name: recipientName,
            hint_sender: message.hint_sender,
            username: message.username,
          }),
        });

        if (!res.ok) throw new Error('Server export failed');
        const blob = await res.blob();
        const serverUrl = URL.createObjectURL(blob);
        setPreviewImageUrl(serverUrl);

        const a = document.createElement('a');
        a.href = serverUrl;
        a.download = `bisiklagu-kartu-hd-${Date.now()}.png`;
        a.click();
      } catch (srvErr) {
        alert('Gagal mengunduh gambar. Silakan coba tahan lama pada layar.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Full 30-Second Video Export with Audio Track
  const handleDownloadVideo = async () => {
    const cardEl = document.getElementById('story-card-content');
    if (!cardEl) return;

    setIsVideoExporting(true);
    setVideoProgress(5);

    try {
      const dataUrl = await toPng(cardEl, { pixelRatio: 2, quality: 0.95 });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => (img.onload = res));
      setVideoProgress(15);

      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context error');

      let audioCtx: AudioContext | null = null;
      let audioEl: HTMLAudioElement | null = null;
      let dest: MediaStreamAudioDestinationNode | null = null;
      let recordDuration = 30; // FULL 30 SECONDS

      if (message.song_preview_url) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioEl = new Audio(message.song_preview_url);
        audioEl.crossOrigin = 'anonymous';

        await new Promise((resolve) => {
          audioEl!.onloadedmetadata = () => {
            if (audioEl!.duration && isFinite(audioEl!.duration) && audioEl!.duration > 0) {
              recordDuration = Math.min(30, Math.ceil(audioEl!.duration));
            }
            resolve(true);
          };
          setTimeout(() => resolve(true), 1500);
        });

        const source = audioCtx.createMediaElementSource(audioEl);
        dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
      }

      const canvasStream = canvas.captureStream(30);
      const combinedTracks = [...canvasStream.getVideoTracks()];
      if (dest) {
        combinedTracks.push(...dest.stream.getAudioTracks());
      }

      const combinedStream = new MediaStream(combinedTracks);
      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')
        ? 'video/mp4;codecs=avc1,mp4a.40.2'
        : MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      let elapsedTime = 0;
      const intervalMs = 250;

      mediaRecorder.start();
      if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {});
      }

      const timer = setInterval(() => {
        elapsedTime += intervalMs / 1000;
        const progressPct = Math.min(99, Math.round((elapsedTime / recordDuration) * 100));
        setVideoProgress(progressPct);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Visualizer wave effect at bottom of video
        const now = Date.now() * 0.008;
        ctx.fillStyle = selectedTheme === 'pastel_love' ? '#f43f5e' : selectedTheme === 'retro_vinyl' ? '#d97706' : '#22c55e';
        for (let i = 0; i < 10; i++) {
          const barHeight = Math.abs(Math.sin(now + i * 0.5)) * 30 + 10;
          ctx.fillRect(180 + i * 36, canvas.height - 100, 18, -barHeight);
        }

        if (elapsedTime >= recordDuration) {
          clearInterval(timer);
          mediaRecorder.stop();
          if (audioEl) audioEl.pause();
        }
      }, intervalMs);

      mediaRecorder.onstop = () => {
        setVideoProgress(100);
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `bisiklagu-video-${selectedTheme}-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setIsVideoExporting(false);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      };
    } catch (err) {
      console.error('Video export error:', err);
      alert('Gagal mengekspor video. Mengunduh gambar sebagai gantinya...');
      setIsVideoExporting(false);
      handleDownloadPNGClient();
    }
  };

  // 3. Share via Web Share API
  const handleShareWeb = async () => {
    const cardEl = document.getElementById('story-card-content');
    if (!cardEl) return;

    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardEl, { pixelRatio: 3, quality: 0.95 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'bisiklagu-kartu.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'BisikLagu - Pesan & Melodi Rahasia',
          text: 'Pesan & lagu rahasia dari BisikLagu',
        });
      } else {
        handleDownloadPNGClient();
      }
    } catch (err) {
      handleDownloadPNGClient();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative bg-[#292524] border-2 border-stone-700 rounded-sm p-4 sm:p-6 max-w-2xl w-full flex flex-col md:flex-row gap-6 shadow-xl my-auto text-stone-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-sm bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center font-bold text-xs"
        >
          ✕
        </button>

        {/* Card Live Preview */}
        <div className="flex-1 flex flex-col items-center justify-center py-2">
          <div className="transform scale-[0.8] sm:scale-100 origin-center transition-transform my-0 sm:my-auto">
            <StoryCard message={updatedMessage} recipientName={recipientName} />
          </div>
        </div>

        {/* Controls & Theme Selector */}
        <div className="flex-1 flex flex-col justify-between gap-4 py-1">
          <div>
            <h3 className="font-handwriting text-2xl font-bold text-stone-100">
              Bagikan Kartu
            </h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Pilih gaya tampilan kartu untuk diunduh atau dibagikan.
            </p>

            {/* Theme Selector Grid */}
            <div className="mt-3">
              <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1.5">
                Pilih Gaya:
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setSelectedTheme(th.id)}
                    className={`flex items-center gap-2 p-2 rounded-sm border text-xs font-bold transition-all text-left ${
                      selectedTheme === th.id
                        ? 'border-amber-400 bg-amber-950/80 text-amber-200'
                        : 'border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    <span className="text-base">{th.icon}</span>
                    <div className="min-w-0">
                      <span className="block truncate leading-tight">{th.label}</span>
                      <span className="text-[9px] text-stone-400 block font-normal truncate">{th.tag}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 text-xs font-bold">
            {/* Download Video with Sound (30s) */}
            {message.song_preview_url && (
              <button
                type="button"
                onClick={handleDownloadVideo}
                disabled={isVideoExporting || isExporting}
                className="w-full py-2.5 px-4 rounded-sm bg-amber-700 hover:bg-amber-600 text-amber-100 font-bold transition-colors disabled:opacity-50"
              >
                {isVideoExporting ? `Membuat Video (${videoProgress}%)...` : 'Simpan Video (MP4 + Musik)'}
              </button>
            )}

            {/* Client-Side Image Download */}
            <button
              type="button"
              onClick={handleDownloadPNGClient}
              disabled={isExporting || isVideoExporting}
              className="w-full py-2.5 px-4 rounded-sm bg-stone-100 hover:bg-white text-stone-900 font-bold transition-colors disabled:opacity-50"
            >
              Simpan Gambar (PNG)
            </button>

            {/* Direct Web Share */}
            <button
              type="button"
              onClick={handleShareWeb}
              disabled={isExporting || isVideoExporting}
              className="w-full py-2 px-4 rounded-sm bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 transition-colors"
            >
              Bagikan
            </button>
          </div>
        </div>
      </div>

      {/* Image Download Preview Modal for Mobile Browsers */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-4 right-4 text-stone-400 hover:text-white font-bold text-xl p-2 bg-stone-800 rounded-full"
          >
            ✕
          </button>

          <div className="max-w-xs space-y-3 my-auto">
            <h4 className="text-sm font-bold text-amber-300">Kartu HD Berhasil Dibuat!</h4>
            <p className="text-xs text-stone-300">
              Tekan & tahan gambar di bawah ini untuk menyimpan ke Galeri / Foto HP Anda:
            </p>

            <img
              src={previewImageUrl}
              alt="Kartu HD BisikLagu"
              className="max-h-[60vh] mx-auto rounded-md shadow-2xl border-2 border-stone-600 object-contain"
            />

            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="py-2 px-6 bg-stone-100 hover:bg-white text-stone-900 font-extrabold text-xs rounded-sm shadow-md transition-colors"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
