'use client';

import React, { useEffect, useState, use } from 'react';
import { User } from '@/types';
import SongPicker from '@/components/SongPicker';
import BinderNotebook from '@/components/BinderNotebook';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function SendSecretMessagePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [messageText, setMessageText] = useState('');
  const [senderAlias, setSenderAlias] = useState('Pengagum Rahasia');
  const [hintSender, setHintSender] = useState('');
  const [selectedSong, setSelectedSong] = useState<{
    song_title: string;
    song_artist: string;
    song_album_cover: string;
    song_preview_url: string;
    selected_lyrics?: string;
  } | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [username]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      alert('Tuliskan pesan rahasia kamu terlebih dahulu!');
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          sender_alias: senderAlias || 'Pengagum Rahasia',
          message_text: messageText,
          song_title: selectedSong?.song_title,
          song_artist: selectedSong?.song_artist,
          song_album_cover: selectedSong?.song_album_cover,
          song_preview_url: selectedSong?.song_preview_url,
          selected_lyrics: selectedSong?.selected_lyrics,
          theme_style: 'paper_binder',
          hint_sender: hintSender,
        }),
      });

      if (res.ok) {
        setIsSent(true);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } else {
        alert('Gagal mengirim pesan. Silakan coba lagi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex flex-col items-center justify-center p-4">
        <p className="text-xs font-bold text-stone-400">Memuat profil...</p>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen py-16 flex flex-col items-center justify-center p-4">
        <BinderNotebook title="Pengguna Tidak Ditemukan" subtitle="Username belum terdaftar">
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-stone-600">
              Username <span className="font-bold text-stone-900">@{username}</span> belum terdaftar.
            </p>
            <Link
              href="/"
              className="inline-block py-2 px-4 bg-stone-900 text-stone-100 font-bold text-xs rounded-sm"
            >
              Buat Link Baru
            </Link>
          </div>
        </BinderNotebook>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-6 sm:py-10 px-2 sm:px-4 text-stone-900">
      <BinderNotebook
        title={`Pesan untuk ${user.name}`}
        subtitle={`"${user.bio_prompt}"`}
      >
        {isSent ? (
          <div className="bg-[#fffefb] border border-stone-400 p-5 rounded-sm text-center space-y-3 animate-fade-in my-2">
            <h2 className="font-handwriting text-2xl font-bold text-stone-900">Pesan Rahasia Terkirim</h2>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              Pesan dan lagu rahasiamu sudah tersimpan di inbox <span className="font-bold text-stone-900">{user.name}</span>.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setIsSent(false);
                  setMessageText('');
                  setSelectedSong(null);
                }}
                className="py-2 px-4 bg-stone-200 hover:bg-stone-300 text-stone-900 border border-stone-400 rounded-sm"
              >
                Kirim Pesan Lainnya
              </button>
              <Link
                href={`/u/${username}/inbox`}
                className="py-2 px-4 bg-amber-900 hover:bg-amber-800 text-amber-100 rounded-sm"
              >
                Lihat Inbox @{username}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-4 pt-1">
            {/* Message Text Input */}
            <div className="bg-[#fffefb] border border-stone-400 p-3.5 rounded-sm space-y-2">
              <label className="text-xs font-bold text-stone-900 block">
                1. Tulis Pesan Anonim
              </label>
              <textarea
                rows={4}
                required
                placeholder={`Tuliskan pesan rahasia untuk ${user.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-[#faf7f2] border border-stone-300 rounded-sm p-2.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none font-medium"
              />

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Nama Pengirim (Anonim):
                </label>
                <input
                  type="text"
                  placeholder="Pengagum Rahasia, Teman Kelas..."
                  value={senderAlias}
                  onChange={(e) => setSenderAlias(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-stone-300 rounded-sm py-1.5 px-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-medium"
                />
              </div>
            </div>

            {/* Song Picker */}
            <SongPicker
              onSelectSong={(song) => setSelectedSong(song)}
              selectedSongData={selectedSong}
            />

            {/* Hint Input */}
            <div className="bg-[#fffefb] border border-stone-400 p-3.5 rounded-sm space-y-1">
              <label className="text-xs font-bold text-stone-900 block">
                3. Petunjuk Pengirim (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Inisial A, Teman jurusan sebelah..."
                value={hintSender}
                onChange={(e) => setHintSender(e.target.value)}
                className="w-full bg-[#faf7f2] border border-stone-300 rounded-sm py-1.5 px-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-sm rounded-sm transition-colors disabled:opacity-50"
            >
              {isSending ? 'Mengirim Pesan...' : 'Kirim Pesan & Lagu Rahasia'}
            </button>
          </form>
        )}

        <div className="pt-3 text-center border-t border-stone-300">
          <Link
            href="/"
            className="text-xs text-stone-600 hover:text-stone-900 font-bold underline"
          >
            Ingin punya link BisikLagu sendiri? Buat di sini
          </Link>
        </div>
      </BinderNotebook>
    </main>
  );
}
