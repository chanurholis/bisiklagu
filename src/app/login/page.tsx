'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BinderNotebook from '@/components/BinderNotebook';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.title = 'Masuk / Login - BisikLagu';
    // Check if user is already logged in
    const sessionRaw = localStorage.getItem('bisiklagu_session');
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        if (session?.username) {
          router.push(`/u/${session.username}/inbox`);
        }
      } catch (e) {}
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !pin) {
      setErrorMsg('Mohon isi Username dan PIN / Password!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Username atau PIN salah!');
        setLoading(false);
        return;
      }

      // Save user session securely in client localStorage
      const userSession = {
        username: data.user.username,
        name: data.user.name,
        pin: pin, // local client pin for inbox access
        avatar: data.user.avatar || '🎵',
      };

      localStorage.setItem('bisiklagu_session', JSON.stringify(userSession));
      localStorage.setItem(`bisiklagu_pin_${data.user.username}`, pin);

      // Dispatch custom event so navbar immediately updates login state
      window.dispatchEvent(new Event('bisiklagu_auth_change'));

      router.push(`/u/${data.user.username}/inbox`);
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1c1917] text-stone-900 flex flex-col justify-center py-6 sm:py-10">
      <BinderNotebook
        title="Masuk ke Inbox Saya"
        subtitle="Masukkan Username & PIN Keamanan untuk membuka pesan & lagu rahasiamu."
      >
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5 py-2">
          {/* Username Input */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-stone-900 block mb-1.5">
              Username Rahasia
            </label>
            <input
              type="text"
              required
              placeholder="Username kamu"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
              className="w-full bg-[#fffefb] border border-stone-400 rounded-sm py-2.5 sm:py-3 px-3.5 text-sm sm:text-base text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* PIN Input */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-stone-900 block mb-1.5">
              PIN / Password Keamanan
            </label>
            <input
              type="password"
              required
              maxLength={8}
              placeholder="PIN kamu"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-[#fffefb] border border-stone-400 rounded-sm py-2.5 sm:py-3 px-3.5 text-sm sm:text-base text-stone-900 font-bold tracking-widest placeholder-stone-400 focus:outline-none focus:border-stone-900"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-400 rounded-sm text-xs sm:text-sm text-rose-800 font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-amber-900 hover:bg-amber-800 text-amber-100 font-bold text-sm sm:text-base rounded-sm transition-colors disabled:opacity-50 shadow-md"
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Inbox'}
          </button>

          <div className="text-center pt-2 text-xs sm:text-sm font-medium text-stone-600">
            Belum punya link rahasia?{' '}
            <Link href="/create" className="font-bold text-stone-900 underline hover:text-amber-900">
              Buat Link Sekarang
            </Link>
          </div>
        </form>
      </BinderNotebook>
    </main>
  );
}
