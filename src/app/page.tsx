'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BinderNotebook from '@/components/BinderNotebook';
import confetti from 'canvas-confetti';

export default function Home() {
  const router = useRouter();

  const [domain, setDomain] = useState('bisiklagu.com');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [bioPrompt, setBioPrompt] = useState('Kirimkan pesan rahasia & lagu favoritmu!');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdUser, setCreatedUser] = useState<any | null>(null);

  useEffect(() => {
    document.title = "BisikLagu - Bisikan Pesan & Melodi Rahasia";
    if (typeof window !== 'undefined') {
      setDomain(window.location.host);
    }
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !pin) {
      setErrorMsg('Mohon lengkapi Nama, Username, dan PIN!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          pin,
          bio_prompt: bioPrompt,
          theme: 'paper_binder',
          avatar: '🎵',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal membuat profil. Silakan pilih username lain.');
        setLoading(false);
        return;
      }

      setCreatedUser(data.user);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-6 sm:py-10 px-2 sm:px-4 text-stone-900">
      <BinderNotebook
        title="BisikLagu"
        subtitle="Kirim dan terima pesan rahasia lengkap dengan lagu favorit secara anonim."
      >
        {/* Simple Step Guide for First-time Visitors */}
        <div className="bg-[#e5dec9] p-3 border border-stone-400 rounded-sm text-xs space-y-1">
          <span className="font-bold text-stone-900 block uppercase tracking-wider text-[11px]">
            Cara Kerja:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-800 font-medium">
            <div>1. Buat link pesan unikmu</div>
            <div>2. Bagikan link ke temanmu</div>
            <div>3. Buka pesan & lagu di inbox</div>
          </div>
        </div>

        {!createdUser ? (
          <form onSubmit={handleCreateProfile} className="space-y-4 pt-1">
            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-stone-900 block mb-1">
                  Nama Anda
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Alex Pradipta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#fffefb] border border-stone-400 rounded-sm py-2 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-medium"
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-bold text-stone-900 block mb-1">
                  Username Link Rahasia
                </label>
                <div className="relative flex items-center">
                  <span className="bg-stone-200 border border-r-0 border-stone-400 py-2 px-3 text-xs font-bold text-stone-700 rounded-l-sm">
                    {domain}/u/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="alex_music"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-[#fffefb] border border-stone-400 rounded-r-sm py-2 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-bold"
                  />
                </div>
              </div>

              {/* PIN */}
              <div>
                <label className="text-xs font-bold text-stone-900 block mb-1">
                  PIN Keamanan Inbox (4-8 Angka)
                </label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  placeholder="1234"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-[#fffefb] border border-stone-400 rounded-sm py-2 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-bold tracking-widest"
                />
              </div>

              {/* Prompt Message */}
              <div>
                <label className="text-xs font-bold text-stone-900 block mb-1">
                  Pesan Pembuka di Halaman Anda
                </label>
                <input
                  type="text"
                  value={bioPrompt}
                  onChange={(e) => setBioPrompt(e.target.value)}
                  placeholder="Kirimkan pesan rahasia & lagu favoritmu!"
                  className="w-full bg-[#fffefb] border border-stone-400 rounded-sm py-2 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-medium"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-100 border border-rose-400 rounded-sm text-xs text-rose-800 font-bold text-center">
                {errorMsg}
              </div>
            )}

            {/* Create Link Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-sm rounded-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Membuat Link...' : 'Buat Link BisikLagu'}
            </button>
          </form>
        ) : (
          /* Created Success Screen */
          <div className="bg-[#fffefb] border border-stone-400 p-5 rounded-sm space-y-4 text-center animate-fade-in">
            <h2 className="font-handwriting text-2xl font-bold text-stone-900">
              Link Berhasil Dibuat
            </h2>
            <p className="text-xs text-stone-600">
              Bagikan link di bawah ini agar orang lain bisa mengirimi Anda pesan & lagu rahasia.
            </p>

            <div className="bg-[#e5dec9] border border-stone-400 p-3 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs font-bold text-stone-900 break-all">
                {typeof window !== 'undefined' ? `${window.location.protocol}//${domain}/u/${createdUser.username}` : `https://${domain}/u/${createdUser.username}`}
              </span>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.protocol}//${domain}/u/${createdUser.username}`);
                  alert('Link berhasil disalin!');
                }}
                className="w-full sm:w-auto py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-sm flex-shrink-0"
              >
                Salin Link
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1 text-xs font-bold">
              <Link
                href={`/u/${createdUser.username}`}
                className="py-2 px-4 bg-stone-200 hover:bg-stone-300 text-stone-900 border border-stone-400 rounded-sm"
              >
                Tampilan Halaman Pengirim
              </Link>
              <Link
                href={`/u/${createdUser.username}/inbox`}
                className="py-2 px-4 bg-amber-900 hover:bg-amber-800 text-amber-100 rounded-sm"
              >
                Buka Inbox Saya
              </Link>
            </div>
          </div>
        )}

      </BinderNotebook>
    </main>
  );
}
