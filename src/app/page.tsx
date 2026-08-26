'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BinderNotebook from '@/components/BinderNotebook';
import { SecretMessage } from '@/types';

export default function Home() {
  const [recentMessages, setRecentMessages] = useState<SecretMessage[]>([]);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  const fallbackSampleMessages: SecretMessage[] = [
    {
      id: 'sample_1',
      username: 'Penerima Anonim',
      sender_alias: 'Pengagum Rahasia',
      message_text: 'Jujur aku selalu suka senyum kamu kalau pas lagi dengerin lagu ini di kelas.',
      song_title: 'Satu Bulan',
      song_artist: 'Bernadya',
      song_album_cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/4a/12/37/4a1237c1-0c58-967b-1f7d-0e42ec16ebfa/cover.jpg/600x600bb.jpg',
      song_preview_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo112/v4/21/58/05/21580556-9a2e-ff62-43bb-510065a7702f/mzaf_16390886576882264971.plus.aac.p.m4a',
      selected_lyrics: 'Belum siap kau berpindah...',
      theme_style: 'paper_binder',
      is_read: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 'sample_2',
      username: 'Penerima Anonim',
      sender_alias: 'Seseorang dari Masa Lalu',
      message_text: 'Kira-kira kamu masih inget lagu kenangan kita waktu hujan di kafe waktu itu gak ya?',
      song_title: 'Untungnya, Hidup Harus Terus Berjalan',
      song_artist: 'Bernadya',
      song_album_cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6b/bc/25/6bbc250f-2b73-0186-2187-b67ea9a9aa8f/cover.jpg/600x600bb.jpg',
      song_preview_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo221/v4/05/21/98/052198c6-59b9-d227-2c96-180dbdb79b88/mzaf_6565187768565150860.plus.aac.p.m4a',
      selected_lyrics: 'Untungnya bumi tetap berputar...',
      theme_style: 'paper_binder',
      is_read: 0,
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    document.title = 'BisikLagu - Bisikan Pesan & Melodi Rahasia';
    fetchRecentMessages();
  }, []);

  const fetchRecentMessages = async () => {
    try {
      const res = await fetch('/api/messages?recent=true');
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setRecentMessages(data.messages);
        } else {
          setRecentMessages(fallbackSampleMessages);
        }
      } else {
        setRecentMessages(fallbackSampleMessages);
      }
    } catch (e) {
      setRecentMessages(fallbackSampleMessages);
    }
  };

  const handleTogglePlayAudio = (msg: SecretMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!msg.song_preview_url) return;

    if (playingMsgId === msg.id) {
      if (audioObj) {
        audioObj.pause();
        setPlayingMsgId(null);
      }
      return;
    }

    if (audioObj) audioObj.pause();

    const newAudio = new Audio(msg.song_preview_url);
    newAudio.play().catch(() => {});
    newAudio.onended = () => setPlayingMsgId(null);
    setAudioObj(newAudio);
    setPlayingMsgId(msg.id);
  };

  return (
    <main className="min-h-screen bg-[#1c1917] text-stone-900 flex flex-col justify-center py-6 sm:py-10">
      <BinderNotebook
        title="BisikLagu"
        subtitle="Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim."
      >
        {/* Main Hero Banner with CTA */}
        <div className="bg-[#fffefb] border border-stone-400 p-5 sm:p-6 rounded-sm text-center space-y-4 shadow-sm my-1">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-1 rounded-sm border border-amber-400 inline-block">
              🎵 Rahasia & Melodi Musik
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
              Ingin Tahu Pesan & Lagu Rahasia yang Ditujukan Untukmu?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-lg mx-auto leading-relaxed">
              Dapatkan link pribadi milikmu secara gratis dan pasang di Bio Instagram, WhatsApp, atau TikTok milikmu.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/create"
              className="inline-block w-full sm:w-auto py-3.5 px-7 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-sm sm:text-base rounded-sm transition-all shadow-md hover:scale-[1.02]"
            >
              ✨ Buat Link Rahasiamu Sekarang
            </Link>
          </div>
        </div>

        {/* Simple Step Guide */}
        <div className="bg-[#e5dec9] p-3.5 sm:p-4 border border-stone-400 rounded-sm text-xs sm:text-sm space-y-2">
          <span className="font-bold text-stone-900 block uppercase tracking-wider text-xs">
            Cara Kerja:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-stone-800 font-medium leading-relaxed">
            <div className="bg-[#faf7f2]/60 p-2 border border-stone-300 rounded-sm">
              <span className="font-bold">1.</span> Buat link pesan unikmu
            </div>
            <div className="bg-[#faf7f2]/60 p-2 border border-stone-300 rounded-sm">
              <span className="font-bold">2.</span> Bagikan link ke temanmu
            </div>
            <div className="bg-[#faf7f2]/60 p-2 border border-stone-300 rounded-sm">
              <span className="font-bold">3.</span> Buka pesan & lagu di inbox
            </div>
          </div>
        </div>

        {/* CTA Showcase: Bisikan Pesan Rahasia Terbaru (Tujuan Diberahasiakan) */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-300 pb-2">
            <div className="space-y-0.5">
              <h3 className="font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
                🔥 Bisikan Terbaru <span className="text-xs bg-amber-200 text-amber-950 px-2 py-0.5 rounded-sm border border-amber-400 uppercase tracking-wider font-extrabold">Anonim</span>
              </h3>
              <p className="text-xs text-stone-600 font-medium">
                Pesan & melodi rahasia yang baru saja dikirim pengagum rahasia.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-[#fffefb] border border-stone-400 p-4 rounded-sm space-y-2.5 shadow-xs transition-all hover:border-stone-800"
              >
                {/* Header info */}
                <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2">
                  <span className="font-bold text-amber-900">
                    Pesan Rahasia
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Dari: {msg.sender_alias || 'Pengagum Rahasia'}
                  </span>
                </div>

                {/* Content */}
                <div className="bg-[#faf7f2] p-3 rounded-sm border border-stone-300">
                  <p className="text-xs sm:text-sm font-semibold text-stone-900 leading-relaxed">
                    "{msg.message_text}"
                  </p>
                </div>

                {/* Song Card */}
                {msg.song_title && (
                  <div className="bg-[#e5dec9] p-3 rounded-sm border border-stone-400 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={msg.song_album_cover || '/placeholder-music.png'}
                        alt={msg.song_title}
                        className="w-10 h-10 rounded-sm object-cover border border-stone-400 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-amber-900 uppercase block">
                          Lagu Rahasia
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {msg.song_title}
                        </h4>
                        <p className="text-[11px] text-stone-600 truncate font-medium">{msg.song_artist}</p>
                      </div>
                    </div>

                    {msg.song_preview_url && (
                      <button
                        type="button"
                        onClick={(e) => handleTogglePlayAudio(msg, e)}
                        className="w-7 h-7 rounded-sm bg-stone-900 text-stone-100 text-xs font-bold flex items-center justify-center flex-shrink-0"
                      >
                        {playingMsgId === msg.id ? '⏸' : '▶'}
                      </button>
                    )}
                  </div>
                )}

                {/* Lyric snippet */}
                {msg.selected_lyrics && (
                  <div className="bg-[#faf7f2]/90 p-2.5 rounded-sm border-l-2 border-stone-800 text-xs font-medium italic text-stone-900">
                    "{msg.selected_lyrics}"
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Prompt CTA to create link */}
          <div className="bg-stone-900 text-stone-100 p-5 rounded-sm text-center space-y-3 border border-stone-800 shadow-md">
            <h4 className="font-bold text-sm sm:text-base text-amber-300">
              Mulai terima pesan rahasia & rekomendasi lagu milikmu sekarang!
            </h4>
            <p className="text-xs text-stone-300">
              Proses pembuatan link hanya memakan waktu 5 detik gratis.
            </p>
            <Link
              href="/create"
              className="inline-block py-2.5 px-6 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm rounded-sm transition-colors"
            >
              ✨ Buat Link Rahasiamu Sekarang
            </Link>
          </div>
        </div>
      </BinderNotebook>
    </main>
  );
}
