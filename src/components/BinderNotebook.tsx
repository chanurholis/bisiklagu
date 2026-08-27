'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface BinderNotebookProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface UserSession {
  username: string;
  name: string;
  pin: string;
  avatar?: string;
}

export default function BinderNotebook({
  children,
  title,
  subtitle,
}: BinderNotebookProps) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showMenu, setShowMenu] = useState(false);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;
    const sessionRaw = localStorage.getItem('bisiklagu_session');
    if (sessionRaw) {
      try {
        const parsed = JSON.parse(sessionRaw);
        if (parsed?.username) {
          setSession(parsed);
          fetchUnread(parsed.username, parsed.pin);
          return;
        }
      } catch (e) {}
    }
    setSession(null);
    setUnreadCount(0);
  };

  const fetchUnread = async (username: string, pin: string) => {
    try {
      const res = await fetch(`/api/notifications?username=${encodeURIComponent(username)}&pin=${encodeURIComponent(pin)}`);
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('bisiklagu_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    // Poll unread notification count every 20s if logged in
    const interval = setInterval(() => {
      if (session?.username) {
        fetchUnread(session.username, session.pin);
      }
    }, 20000);

    return () => {
      window.removeEventListener('bisiklagu_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      clearInterval(interval);
    };
  }, [session?.username]);

  const handleLogout = () => {
    localStorage.removeItem('bisiklagu_session');
    setSession(null);
    setUnreadCount(0);
    setShowMenu(false);
    window.dispatchEvent(new Event('bisiklagu_auth_change'));
    window.location.href = '/';
  };

  return (
    <div className="w-full max-w-2xl mx-auto sm:px-4 sm:py-6">
      {/* Outer Shell: Full width on mobile, rounded card on desktop */}
      <div className="bg-[#292524] p-2 sm:p-5 border-0 sm:border-2 border-stone-700 shadow-2xl rounded-none sm:rounded-lg min-h-screen sm:min-h-0 flex flex-col justify-between">
        
        {/* Main Inner Paper Sheet */}
        <div className="paper-texture border-0 sm:border-2 border-stone-800 p-4 sm:p-7 text-stone-900 rounded-none sm:rounded-md relative flex-1 flex flex-col">
          
          {/* Header Navigation Bar */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 border-b-2 border-stone-800">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 bg-stone-900 text-stone-100 flex items-center justify-center font-black text-base rounded-sm shadow-sm">
                B
              </span>
              <span className="font-body text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                BisikLagu
              </span>
            </Link>

            {/* Navigation Menu Controls */}
            <div className="flex items-center gap-2">
              {session ? (
                /* Logged In Navbar State */
                <div className="relative flex items-center gap-2">
                  {/* Notification Bell Icon */}
                  <Link
                    href={`/u/${session.username}/inbox`}
                    className="relative p-2 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-sm border border-stone-400 flex items-center justify-center transition-colors"
                    title="Inbox Pesan Rahasia"
                  >
                    <span className="text-base leading-none">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900 shadow-sm animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Profile Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-amber-100 text-xs sm:text-sm font-bold rounded-sm border border-amber-950 transition-colors shadow-xs"
                  >
                    <span>{session.avatar || '🎵'}</span>
                    <span className="max-w-[90px] sm:max-w-[120px] truncate">@{session.username}</span>
                    <span className="text-[10px] opacity-75">▼</span>
                  </button>

                  {/* Dropdown Menu Overlay */}
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#fffefb] border-2 border-stone-800 rounded-sm shadow-xl z-50 p-1 space-y-1 text-xs font-bold text-stone-900 animate-fade-in">
                      <div className="p-2 border-b border-stone-200 bg-stone-100/60 rounded-xs">
                        <p className="text-[10px] text-stone-500 font-semibold uppercase">Masuk Sebagai:</p>
                        <p className="font-extrabold text-stone-900 truncate">{session.name}</p>
                      </div>

                      <Link
                        href={`/u/${session.username}/inbox`}
                        onClick={() => setShowMenu(false)}
                        className="flex items-center justify-between p-2 hover:bg-amber-100 rounded-xs transition-colors"
                      >
                        <span>📥 Inbox Rahasia</span>
                        {unreadCount > 0 && (
                          <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        href={`/u/${session.username}`}
                        onClick={() => setShowMenu(false)}
                        className="block p-2 hover:bg-amber-100 rounded-xs transition-colors"
                      >
                        👤 Link Halaman Saya
                      </Link>

                      <Link
                        href="/create"
                        onClick={() => setShowMenu(false)}
                        className="block p-2 hover:bg-amber-100 rounded-xs transition-colors"
                      >
                        ✨ Buat Link Baru
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left p-2 text-rose-700 hover:bg-rose-50 rounded-xs transition-colors border-t border-stone-200 font-bold"
                      >
                        🚪 Keluar / Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Not Logged In Navbar State */
                <div className="flex items-center gap-2">
                  <Link
                    href="/create"
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs sm:text-sm font-bold rounded-sm transition-colors shadow-xs"
                  >
                    Buat Link
                  </Link>
                  <Link
                    href="/login"
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs sm:text-sm font-bold rounded-sm border border-stone-400 transition-colors"
                  >
                    Masuk
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Page Title & Subtitle Section */}
          {(title || subtitle) && (
            <div className="mb-4 sm:mb-5 pb-3 border-b border-dashed border-stone-400">
              {title && (
                <h1 className="font-body text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
