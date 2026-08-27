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

  // Helper theme style configs with high aesthetic depth & contrast
  const getThemeStyles = () => {
    switch (activeTheme) {
      case 'question_box': // Question Box Speech Bubble Aesthetic
        return {
          wrapper: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white border-4 border-[#ee2a7b]/90 shadow-2xl',
          bgDecoration: (
            <>
              {/* Subtle ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-pink-500/25 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-yellow-400/20 blur-3xl pointer-events-none" />
            </>
          ),
          badge: 'bg-white/90 text-rose-600 border-white/90 font-extrabold shadow-sm',
          badgeLabel: 'Question Box',
          messageBox: 'bg-white text-stone-950 border-2 border-stone-100 rounded-3xl p-5 shadow-2xl relative',
          messageTitle: 'text-rose-600 font-extrabold uppercase tracking-wider text-[11px] text-center block mb-1',
          messageFont: 'font-body text-base sm:text-lg font-bold text-stone-950 text-center leading-snug',
          lyricBox: 'bg-white/95 backdrop-blur-md border border-stone-200 text-stone-900 rounded-2xl p-3 shadow-md',
          songBox: 'bg-white/95 backdrop-blur-md border border-stone-200 hover:border-rose-400 shadow-lg rounded-2xl p-3',
          songTitle: 'text-stone-950 font-bold',
          songSub: 'text-rose-600 font-bold',
          buttonBg: 'bg-gradient-to-r from-rose-500 to-purple-600 text-white font-black shadow-md rounded-full',
          footerTag: 'bg-white text-stone-950 shadow-lg font-extrabold border border-white rounded-full px-4 py-1.5',
          decorator: '💬',
        };

      case 'pastel_love': // Romantis & Soft Pink Dream
        return {
          wrapper: 'bg-gradient-to-br from-[#fff0f3] via-[#ffe4e6] to-[#fecdd3] text-rose-950 border-4 border-rose-400/90 shadow-2xl',
          bgDecoration: (
            <>
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-rose-300/30 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-rose-400/20 blur-2xl pointer-events-none" />
              <div className="absolute top-16 right-6 text-rose-300/60 text-2xl select-none">💖</div>
              <div className="absolute bottom-24 left-6 text-rose-300/60 text-xl select-none">✨</div>
            </>
          ),
          badge: 'bg-rose-200/90 text-rose-900 border-rose-300/80 shadow-xs',
          badgeLabel: 'Romantis & Manis',
          messageBox: 'bg-white/85 backdrop-blur-md border border-rose-300/80 text-rose-950 shadow-md',
          messageTitle: 'text-rose-700 font-bold',
          messageFont: 'font-body text-base font-bold',
          lyricBox: 'bg-rose-50/90 border border-rose-300/70 text-rose-900',
          songBox: 'bg-white/90 border border-rose-300 hover:border-rose-400 shadow-sm',
          songTitle: 'text-rose-950',
          songSub: 'text-rose-700',
          buttonBg: 'bg-rose-600 text-white shadow-sm',
          footerTag: 'bg-rose-900 text-rose-100 shadow-sm',
          decorator: '💖',
        };

      case 'retro_vinyl': // Vintage Vinyl Record & Warm Brass
        return {
          wrapper: 'bg-gradient-to-br from-[#29221d] via-[#1c1815] to-[#120f0d] text-amber-100 border-4 border-amber-600/80 shadow-2xl',
          bgDecoration: (
            <>
              {/* Vinyl Disk Graphic Accent */}
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-[14px] border-[#362e28] bg-[#171310] opacity-35 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-40 rounded-full border-4 border-amber-900/40 border-dashed" />
                <div className="w-16 h-16 rounded-full bg-amber-600/40 border-2 border-amber-500" />
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-amber-700/20 blur-2xl pointer-events-none" />
            </>
          ),
          badge: 'bg-amber-950/90 text-amber-300 border-amber-700/80 shadow-xs',
          badgeLabel: 'Retro Vinyl',
          messageBox: 'bg-[#332a24]/90 backdrop-blur-md border border-amber-700/70 text-amber-100 shadow-lg',
          messageTitle: 'text-amber-400 font-bold',
          messageFont: 'font-body text-base font-bold',
          lyricBox: 'bg-[#231d18]/90 border border-amber-800/80 text-amber-200',
          songBox: 'bg-[#3a3029] border border-amber-700/80 hover:border-amber-500 shadow-md',
          songTitle: 'text-amber-100',
          songSub: 'text-amber-400',
          buttonBg: 'bg-amber-500 text-stone-950 font-black shadow-sm',
          footerTag: 'bg-amber-500 text-stone-950 shadow-sm',
          decorator: '📻',
        };

      case 'sunset': // Sunset Glow & Warm Amber
        return {
          wrapper: 'bg-gradient-to-br from-[#451a03] via-[#7c2d12] to-[#9a3412] text-orange-100 border-4 border-orange-500/90 shadow-2xl',
          bgDecoration: (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-400/25 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
              <div className="absolute top-20 left-4 text-orange-300/30 text-3xl select-none">🌅</div>
            </>
          ),
          badge: 'bg-orange-950/90 text-orange-300 border-orange-700/80 shadow-xs',
          badgeLabel: 'Sunset Glow',
          messageBox: 'bg-[#9a3412]/90 backdrop-blur-md border border-orange-500/80 text-orange-50 shadow-lg',
          messageTitle: 'text-amber-300 font-bold',
          messageFont: 'font-body text-base font-bold',
          lyricBox: 'bg-[#7c2d12]/90 border border-orange-600/80 text-orange-200',
          songBox: 'bg-[#6c230e] border border-orange-500/80 hover:border-orange-400 shadow-md',
          songTitle: 'text-orange-100',
          songSub: 'text-orange-300',
          buttonBg: 'bg-amber-400 text-stone-950 font-black shadow-sm',
          footerTag: 'bg-amber-400 text-stone-950 shadow-sm',
          decorator: '🌇',
        };

      case 'neon_dark': // Cyber OLED & Neon Emerald Aura
        return {
          wrapper: 'bg-[#09090b] text-emerald-100 border-4 border-emerald-500/90 shadow-2xl',
          bgDecoration: (
            <>
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
              {/* Equalizer lines decoration */}
              <div className="absolute top-16 right-6 flex items-end gap-1 opacity-25 pointer-events-none">
                <div className="w-1 h-5 bg-emerald-400 rounded-full animate-pulse" />
                <div className="w-1 h-8 bg-emerald-400 rounded-full animate-pulse" />
                <div className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                <div className="w-1 h-6 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            </>
          ),
          badge: 'bg-emerald-950/90 text-emerald-400 border-emerald-800/80 shadow-xs',
          badgeLabel: 'OLED Cyber',
          messageBox: 'bg-[#064e3b]/90 backdrop-blur-md border border-emerald-500/70 text-emerald-100 shadow-lg shadow-emerald-950/50',
          messageTitle: 'text-emerald-400 font-bold tracking-wide',
          messageFont: 'font-body text-base font-bold',
          lyricBox: 'bg-[#022c22]/90 border border-emerald-700/80 text-emerald-200',
          songBox: 'bg-[#065f46] border border-emerald-500/80 hover:border-emerald-400 shadow-md',
          songTitle: 'text-emerald-100',
          songSub: 'text-emerald-400',
          buttonBg: 'bg-emerald-400 text-stone-950 font-black shadow-sm',
          footerTag: 'bg-emerald-400 text-stone-950 shadow-sm',
          decorator: '⚡',
        };

      case 'glassmorphism': // Midnight Glass & Royal Sapphire Aura
        return {
          wrapper: 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#090d16] text-sky-100 border-4 border-sky-500/90 shadow-2xl',
          bgDecoration: (
            <>
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-sky-500/25 blur-3xl pointer-events-none" />
              <div className="absolute top-16 right-6 text-sky-300/40 text-2xl select-none">✨</div>
            </>
          ),
          badge: 'bg-sky-950/90 text-sky-300 border-sky-700/80 shadow-xs',
          badgeLabel: 'Dark Glass',
          messageBox: 'bg-white/10 backdrop-blur-lg border border-white/20 text-sky-100 shadow-xl',
          messageTitle: 'text-sky-300 font-bold',
          messageFont: 'font-body text-base font-bold',
          lyricBox: 'bg-sky-950/60 border border-sky-700/70 text-sky-200',
          songBox: 'bg-white/10 backdrop-blur-md border border-sky-500/50 hover:border-sky-400 shadow-md',
          songTitle: 'text-sky-100',
          songSub: 'text-sky-300',
          buttonBg: 'bg-sky-400 text-stone-950 font-black shadow-sm',
          footerTag: 'bg-sky-400 text-stone-950 shadow-sm',
          decorator: '💎',
        };

      case 'spotify': // Spotify Lyric Card Aesthetic
        return {
          wrapper: 'bg-gradient-to-b from-[#1e1e1e] via-[#121212] to-[#0a0a0a] text-white border-4 border-[#1db954] shadow-2xl',
          bgDecoration: (
            <>
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#1db954]/20 blur-3xl pointer-events-none" />
              {/* Spotify soundwave visualizer graphic */}
              <div className="absolute top-16 right-6 flex items-end gap-1 opacity-40 pointer-events-none">
                <div className="w-1 h-3 bg-[#1db954] rounded-full" />
                <div className="w-1 h-7 bg-[#1db954] rounded-full" />
                <div className="w-1 h-4 bg-[#1db954] rounded-full" />
                <div className="w-1 h-8 bg-[#1db954] rounded-full" />
                <div className="w-1 h-5 bg-[#1db954] rounded-full" />
              </div>
            </>
          ),
          badge: 'bg-[#181818] text-[#1db954] border-[#1db954]/50 shadow-xs',
          badgeLabel: 'Spotify Lyric',
          messageBox: 'bg-[#282828] border border-stone-700 text-white shadow-lg',
          messageTitle: 'text-[#1db954] font-bold tracking-wide',
          messageFont: 'font-body text-base font-bold',
          lyricBox: 'bg-[#181818] border border-stone-800 text-stone-200',
          songBox: 'bg-[#282828] border border-stone-700 hover:border-[#1db954] shadow-md',
          songTitle: 'text-white',
          songSub: 'text-[#1db954]',
          buttonBg: 'bg-[#1db954] text-black font-black shadow-sm',
          footerTag: 'bg-[#1db954] text-black shadow-sm',
          decorator: '🎵',
        };

      case 'cyberpunk': // Electric Pop & Vibrant Purple
        return {
          wrapper: 'bg-gradient-to-br from-[#3b0764] via-[#581c87] to-[#2e1065] text-yellow-100 border-4 border-yellow-400 shadow-2xl',
          bgDecoration: (
            <>
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yellow-400/25 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-fuchsia-500/25 blur-3xl pointer-events-none" />
              <div className="absolute top-16 right-6 text-yellow-300/50 text-2xl select-none">⚡</div>
            </>
          ),
          badge: 'bg-purple-950/90 text-yellow-300 border-yellow-500/80 shadow-xs',
          badgeLabel: 'Electric Pop',
          messageBox: 'bg-[#6b21a8]/90 backdrop-blur-md border border-yellow-400/80 text-yellow-100 shadow-lg',
          messageTitle: 'text-yellow-400 font-bold',
          messageFont: 'font-body text-base font-bold',
          lyricBox: 'bg-[#581c87]/90 border border-yellow-500/80 text-yellow-200',
          songBox: 'bg-[#4c1d95] border border-yellow-400 hover:border-yellow-300 shadow-md',
          songTitle: 'text-yellow-100',
          songSub: 'text-yellow-300',
          buttonBg: 'bg-yellow-400 text-purple-950 font-black shadow-sm',
          footerTag: 'bg-yellow-400 text-purple-950 shadow-sm',
          decorator: '✨',
        };

      case 'paper_binder':
      default: // Paper Binder Classic Warm Texture
        return {
          wrapper: 'paper-texture text-stone-900 border-4 border-stone-900 shadow-2xl',
          bgDecoration: null,
          badge: 'bg-amber-100/90 text-amber-950 border-amber-400/80 shadow-xs',
          badgeLabel: 'Buku Binder',
          messageBox: 'paper-texture-card border border-amber-400/90 text-stone-950 shadow-md',
          messageTitle: 'text-amber-900 font-bold',
          messageFont: 'font-body text-base font-bold',
          lyricBox: 'paper-texture-kraft border border-stone-400/80 text-stone-950',
          songBox: 'bg-white/95 border border-stone-400 hover:border-stone-800 shadow-sm',
          songTitle: 'text-stone-900',
          songSub: 'text-stone-600',
          buttonBg: 'bg-stone-900 text-stone-100 font-bold shadow-sm',
          footerTag: 'bg-stone-900 text-stone-100 shadow-sm',
          decorator: '📒',
        };
    }
  };

  const st = getThemeStyles();

  return (
    <div
      id="story-card-content"
      className={`relative w-[340px] sm:w-[360px] h-[600px] sm:h-[640px] rounded-sm overflow-hidden flex flex-col justify-between p-5 sm:p-6 select-none ${st.wrapper}`}
    >
      {/* Background Graphic Decoration */}
      {st.bgDecoration}

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
          <span className="w-7 h-7 bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-xs rounded-sm shadow-xs">
            {st.decorator}
          </span>
          <div>
            <span className="font-body text-base font-extrabold tracking-tight block leading-none">
              BisikLagu
            </span>
            <span className="text-[10px] opacity-75 font-semibold">{domain}</span>
          </div>
        </div>

        <div className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-sm ${st.badge}`}>
          {st.badgeLabel}
        </div>
      </div>

      {/* Main Secret Content */}
      <div className={`relative z-10 flex flex-col gap-3 ${activeTheme === 'question_box' ? 'mt-4 mb-auto pt-2' : 'my-auto'} ${activeTheme === 'paper_binder' ? 'pl-6' : ''}`}>
        {/* Secret Message Box (Speech Bubble for question_box theme) */}
        {activeTheme === 'question_box' ? (
          <div className="bg-white text-stone-950 border-2 border-stone-100 rounded-[26px] p-5 shadow-2xl relative">
            {/* Header Sticker Pill */}
            <div className="bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white text-[11px] font-extrabold px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 -mt-8 mx-auto w-fit border-2 border-white">
              <span>💬</span> send me anonymous secrets
            </div>

            <div className="pt-3 pb-1 text-center">
              <p className="font-body text-base sm:text-lg font-black text-stone-950 leading-snug">
                {message.message_text}
              </p>
            </div>

            {/* Seamless SVG Speech Bubble Tail */}
            <svg
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-3 text-white pointer-events-none"
              viewBox="0 0 24 12"
              fill="currentColor"
            >
              <path d="M0 0 L12 12 L24 0 Z" />
            </svg>
          </div>
        ) : (
          <div className={`p-4 rounded-sm shadow-sm relative ${st.messageBox}`}>
            <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${st.messageTitle}`}>
              Pesan untuk {recipientName}
            </div>
            <p className={`${st.messageFont} leading-snug`}>
              {message.message_text}
            </p>
          </div>
        )}

        {/* Selected Lyric Quote */}
        {message.selected_lyrics && (
          <div className={`p-3 rounded-sm ${st.lyricBox}`}>
            <span className="text-[10px] font-bold uppercase block mb-1 opacity-80 tracking-wider">
              Lirik:
            </span>
            <p className="font-body text-xs sm:text-sm font-medium italic border-l-2 border-current pl-2 py-0.5 leading-normal">
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
              className="w-12 h-12 rounded-sm object-cover border border-stone-400 flex-shrink-0 shadow-xs"
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
          <div className={`text-[11px] text-center font-bold py-1 px-3 border rounded-sm self-center shadow-xs ${st.badge}`}>
            Petunjuk: {message.hint_sender}
          </div>
        )}

        {/* Public Reply Box (if present) */}
        {message.reply_text && (
          <div className="p-3 bg-stone-900 text-stone-100 border border-amber-400 rounded-sm shadow-md space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase block tracking-wider">
              Balasan {recipientName}:
            </span>
            <p className="font-body text-xs sm:text-sm font-semibold text-amber-100 leading-normal">
              "{message.reply_text}"
            </p>
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className={`relative z-10 pt-2 flex flex-col items-center gap-1 border-t ${activeTheme === 'paper_binder' ? 'pl-6 border-stone-300' : 'border-current/20'}`}>
        {activeTheme !== 'question_box' && (
          <div className="text-[11px] font-bold opacity-80">
            Kirim pesan & lagu rahasiamu di link bio
          </div>
        )}
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
