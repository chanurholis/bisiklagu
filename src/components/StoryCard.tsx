'use client';

import React, { useRef, useState, useEffect } from 'react';
import { SecretMessage, StoryTheme } from '@/types';

interface StoryCardProps {
  message: SecretMessage;
  recipientName?: string;
  theme?: StoryTheme;
  interactiveAudio?: boolean;
}

export default function StoryCard({
  message,
  recipientName = 'BisikLagu',
  theme = 'paper_binder',
  interactiveAudio = true,
}: StoryCardProps) {
  const activeTheme = (message.theme_style as StoryTheme) || theme || 'paper_binder';
  const [isPlaying, setIsPlaying] = useState(false);
  const [domain, setDomain] = useState('bisiklagu.com');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.host);
    }
  }, []);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!message.song_preview_url) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // Helper theme style configs for Cool, Lucu, Romantis visual themes
  const getThemeStyles = () => {
    switch (activeTheme) {
      case 'pastel_love': // Romantis & Soft Pink
        return {
          wrapper: 'bg-[#fff1f2] text-rose-950 border-4 border-rose-400',
          badge: 'bg-rose-200 text-rose-900 border-rose-300',
          badgeLabel: 'Romantis & Manis',
          messageBox: 'bg-[#ffe4e6] border border-rose-300 text-rose-950',
          messageTitle: 'text-rose-700',
          messageFont: 'font-handwriting text-2xl font-bold',
          lyricBox: 'bg-white/80 border border-rose-200 text-rose-900',
          songBox: 'bg-white border border-rose-300 hover:border-rose-400',
          songTitle: 'text-rose-950',
          songSub: 'text-rose-700',
          buttonBg: 'bg-rose-600 text-white',
          footerTag: 'bg-rose-900 text-rose-100',
          decorator: '💖',
        };
      case 'retro_vinyl': // Cool Vintage Vinyl
        return {
          wrapper: 'bg-[#1c1917] text-amber-100 border-4 border-amber-600',
          badge: 'bg-amber-950 text-amber-300 border-amber-700',
          badgeLabel: 'Retro Vinyl',
          messageBox: 'bg-[#2e2621] border border-amber-700 text-amber-100',
          messageTitle: 'text-amber-400',
          messageFont: 'font-serif text-xl font-bold italic',
          lyricBox: 'bg-amber-950/70 border border-amber-800 text-amber-200',
          songBox: 'bg-[#26201c] border border-amber-700 hover:border-amber-500',
          songTitle: 'text-amber-100',
          songSub: 'text-amber-400',
          buttonBg: 'bg-amber-600 text-stone-950',
          footerTag: 'bg-amber-500 text-stone-950',
          decorator: '📻',
        };
      case 'sunset': // Romantis Warm Sunset
        return {
          wrapper: 'bg-[#431407] text-orange-100 border-4 border-orange-500',
          badge: 'bg-orange-950 text-orange-300 border-orange-700',
          badgeLabel: 'Sunset Glow',
          messageBox: 'bg-[#7c2d12] border border-orange-500 text-orange-50',
          messageTitle: 'text-orange-300',
          messageFont: 'font-handwriting text-2xl font-bold',
          lyricBox: 'bg-[#9a3412] border border-orange-600 text-orange-200',
          songBox: 'bg-[#571c0c] border border-orange-600 hover:border-orange-400',
          songTitle: 'text-orange-100',
          songSub: 'text-orange-300',
          buttonBg: 'bg-orange-500 text-stone-950',
          footerTag: 'bg-orange-400 text-stone-950',
          decorator: '🌇',
        };
      case 'neon_dark': // Cool OLED Cyber
        return {
          wrapper: 'bg-[#09090b] text-emerald-100 border-4 border-emerald-500',
          badge: 'bg-emerald-950 text-emerald-400 border-emerald-800',
          badgeLabel: 'OLED Cyber',
          messageBox: 'bg-[#052e16] border border-emerald-600 text-emerald-100',
          messageTitle: 'text-emerald-400',
          messageFont: 'font-mono text-lg font-bold tracking-tight',
          lyricBox: 'bg-[#14532d]/80 border border-emerald-700 text-emerald-200',
          songBox: 'bg-[#022c22] border border-emerald-600 hover:border-emerald-400',
          songTitle: 'text-emerald-100',
          songSub: 'text-emerald-400',
          buttonBg: 'bg-emerald-500 text-stone-950',
          footerTag: 'bg-emerald-400 text-stone-950',
          decorator: '⚡',
        };
      case 'glassmorphism': // Cool Dark Glass
        return {
          wrapper: 'bg-[#0f172a] text-sky-100 border-4 border-sky-500',
          badge: 'bg-sky-950 text-sky-300 border-sky-800',
          badgeLabel: 'Dark Glass',
          messageBox: 'bg-[#1e293b] border border-sky-600 text-sky-100',
          messageTitle: 'text-sky-400',
          messageFont: 'font-body text-xl font-semibold',
          lyricBox: 'bg-[#0f172a]/90 border border-sky-700 text-sky-200',
          songBox: 'bg-[#1e293b] border border-sky-600 hover:border-sky-400',
          songTitle: 'text-sky-100',
          songSub: 'text-sky-300',
          buttonBg: 'bg-sky-500 text-stone-950',
          footerTag: 'bg-sky-400 text-stone-950',
          decorator: '💎',
        };
      case 'spotify': // Minimalist Cool Spotify
        return {
          wrapper: 'bg-[#121212] text-white border-4 border-[#1db954]',
          badge: 'bg-[#181818] text-[#1db954] border-stone-800',
          badgeLabel: 'Spotify Lyric',
          messageBox: 'bg-[#282828] border border-stone-700 text-white',
          messageTitle: 'text-[#1db954]',
          messageFont: 'font-body text-xl font-extrabold',
          lyricBox: 'bg-[#181818] border border-stone-800 text-stone-300',
          songBox: 'bg-[#282828] border border-stone-700 hover:border-[#1db954]',
          songTitle: 'text-white',
          songSub: 'text-[#1db954]',
          buttonBg: 'bg-[#1db954] text-black',
          footerTag: 'bg-[#1db954] text-black',
          decorator: '🎵',
        };
      case 'cyberpunk': // Lucu & Vibrant Electric
        return {
          wrapper: 'bg-[#3b0764] text-yellow-100 border-4 border-yellow-400',
          badge: 'bg-purple-950 text-yellow-300 border-yellow-500',
          badgeLabel: 'Electric Pop',
          messageBox: 'bg-[#581c87] border border-yellow-400 text-yellow-100',
          messageTitle: 'text-yellow-400',
          messageFont: 'font-handwriting text-2xl font-black',
          lyricBox: 'bg-[#6b21a8] border border-yellow-500 text-yellow-200',
          songBox: 'bg-[#4c1d95] border border-yellow-400 hover:border-yellow-300',
          songTitle: 'text-yellow-100',
          songSub: 'text-yellow-300',
          buttonBg: 'bg-yellow-400 text-purple-950',
          footerTag: 'bg-yellow-400 text-purple-950',
          decorator: '✨',
        };
      case 'paper_binder':
      default: // Paper Binder Classic Aesthetic
        return {
          wrapper: 'bg-[#faf7f2] text-stone-900 border-4 border-stone-900',
          badge: 'bg-amber-100 text-amber-950 border-amber-300',
          badgeLabel: 'Buku Binder',
          messageBox: 'bg-[#fef08a] border border-amber-400 text-stone-950',
          messageTitle: 'text-amber-900',
          messageFont: 'font-handwriting text-2xl font-bold',
          lyricBox: 'bg-[#e5dec9] border border-stone-400 text-stone-900',
          songBox: 'bg-white border border-stone-400 hover:border-stone-800',
          songTitle: 'text-stone-900',
          songSub: 'text-stone-600',
          buttonBg: 'bg-stone-900 text-stone-100',
          footerTag: 'bg-stone-900 text-stone-100',
          decorator: '📒',
        };
    }
  };

  const st = getThemeStyles();

  return (
    <div
      id="story-card-content"
      className={`relative w-[340px] sm:w-[360px] h-[600px] sm:h-[640px] rounded-sm overflow-hidden flex flex-col justify-between p-5 sm:p-6 select-none shadow-xl ${st.wrapper}`}
    >
      {/* Decorative notebook margin for paper binder */}
      {activeTheme === 'paper_binder' && (
        <>
          <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-rose-400/60 pointer-events-none z-20" />
          <div className="absolute left-2.5 top-0 bottom-0 flex flex-col justify-around py-8 pointer-events-none z-30">
            {[1, 2, 3, 4, 5].map((r) => (
              <div key={r} className="w-3.5 h-3.5 rounded-full bg-stone-900 shadow-inner" />
            ))}
          </div>
        </>
      )}

      {/* Header Bar */}
      <div className={`relative z-10 flex items-center justify-between border-b pb-3 ${activeTheme === 'paper_binder' ? 'pl-6 border-stone-300' : 'border-current/20'}`}>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-xs rounded-sm">
            {st.decorator}
          </span>
          <div>
            <span className="font-handwriting text-xl font-bold tracking-tight block leading-none">
              BisikLagu
            </span>
            <span className="text-[10px] opacity-75 font-semibold">{domain}</span>
          </div>
        </div>

        <div className={`px-2 py-0.5 border text-[10px] font-bold rounded-sm ${st.badge}`}>
          {st.badgeLabel}
        </div>
      </div>

      {/* Main Secret Content */}
      <div className={`relative z-10 flex flex-col gap-3 my-auto ${activeTheme === 'paper_binder' ? 'pl-6' : ''}`}>
        {/* Secret Message Box */}
        <div className={`p-4 rounded-sm shadow-sm relative ${st.messageBox}`}>
          <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${st.messageTitle}`}>
            Pesan untuk {recipientName}
          </div>
          <p className={`${st.messageFont} leading-snug`}>
            "{message.message_text}"
          </p>
        </div>

        {/* Selected Lyric Quote */}
        {message.selected_lyrics && (
          <div className={`p-3 rounded-sm ${st.lyricBox}`}>
            <span className={`text-[10px] font-bold uppercase block mb-0.5 opacity-80`}>
              Kutipan Lirik Pilihan
            </span>
            <p className="font-handwriting text-base font-bold italic border-l-2 border-current pl-2">
              "{message.selected_lyrics}"
            </p>
          </div>
        )}

        {/* Song Player Card */}
        {message.song_title && (
          <div
            onClick={interactiveAudio ? toggleAudio : undefined}
            className={`p-3 rounded-sm flex items-center gap-3 cursor-pointer transition-colors shadow-sm ${st.songBox}`}
          >
            <img
              src={message.song_album_cover || '/placeholder-music.png'}
              alt={message.song_title}
              className="w-12 h-12 rounded-sm object-cover border border-stone-400 flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold uppercase block opacity-75">
                Lagu Rahasia
              </span>
              <h4 className={`text-xs sm:text-sm font-bold truncate ${st.songTitle}`}>
                {message.song_title}
              </h4>
              <p className={`text-[11px] truncate font-medium ${st.songSub}`}>{message.song_artist}</p>
            </div>

            {message.song_preview_url && (
              <button
                type="button"
                className={`w-7 h-7 rounded-sm text-xs font-bold flex items-center justify-center flex-shrink-0 ${st.buttonBg}`}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
            )}
          </div>
        )}

        {/* Sender Hint */}
        {message.hint_sender && (
          <div className={`text-[11px] text-center font-bold py-1 px-3 border rounded-sm self-center ${st.badge}`}>
            Petunjuk: {message.hint_sender}
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className={`relative z-10 pt-2 flex flex-col items-center gap-1 border-t ${activeTheme === 'paper_binder' ? 'pl-6 border-stone-300' : 'border-current/20'}`}>
        <div className="text-[11px] font-bold opacity-80">
          Kirim pesan & lagu rahasiamu di link bio
        </div>
        <div className={`px-3 py-1 text-[10px] font-bold tracking-wide rounded-sm ${st.footerTag}`}>
          {domain}/u/{message.username || 'user'}
        </div>
      </div>

      {/* Audio Element */}
      {message.song_preview_url && (
        <audio
          ref={audioRef}
          src={message.song_preview_url}
          onEnded={() => setIsPlaying(false)}
          preload="auto"
        />
      )}
    </div>
  );
}
