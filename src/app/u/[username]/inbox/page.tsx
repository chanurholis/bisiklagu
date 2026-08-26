'use client';

import React, { useEffect, useState, use } from 'react';
import { SecretMessage, User } from '@/types';
import StoryExporterModal from '@/components/StoryExporterModal';
import BinderNotebook from '@/components/BinderNotebook';
import Link from 'next/link';

export default function InboxPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [domain, setDomain] = useState('bisiklagu.com');
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<SecretMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedMessageForStory, setSelectedMessageForStory] = useState<SecretMessage | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.host);
    }
    const savedPin = localStorage.getItem(`bisiklagu_pin_${username}`);
    if (savedPin) {
      setPinInput(savedPin);
      fetchInbox(savedPin);
    }
  }, [username]);

  const fetchInbox = async (pinCode: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin: pinCode }),
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json();
        setErrorMsg(errData.error || 'PIN Salah! Akses ditolak.');
        setIsUnlocked(false);
        setLoading(false);
        return;
      }

      const loginData = await loginRes.json();
      setUser(loginData.user);

      const msgRes = await fetch(`/api/messages?username=${encodeURIComponent(username)}&pin=${encodeURIComponent(pinCode)}`);
      const msgData = await msgRes.json();

      setMessages(msgData.messages || []);
      setIsUnlocked(true);
      localStorage.setItem(`bisiklagu_pin_${username}`, pinCode);
    } catch (err) {
      setErrorMsg('Gagal memuat pesan');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInbox(pinInput);
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

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      const res = await fetch(`/api/messages/${msgId}?username=${encodeURIComponent(username)}&pin=${encodeURIComponent(pinInput)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      }
    } catch (err) {
      alert('Gagal menghapus pesan');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.protocol}//${domain}/u/${username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <main className="min-h-screen py-6 sm:py-10 px-2 sm:px-4 text-stone-900">
      <BinderNotebook
        title={isUnlocked ? `Inbox ${user?.name || username}` : `Buka Inbox @${username}`}
        subtitle={isUnlocked ? `${messages.length} Pesan Diterima` : "Masukkan PIN Keamanan"}
      >
        {!isUnlocked ? (
          <div className="bg-[#fffefb] border border-stone-400 p-5 rounded-sm text-center space-y-3 my-2">
            <h2 className="font-handwriting text-2xl font-bold text-stone-900">PIN Keamanan</h2>
            <p className="text-xs text-stone-600">
              Masukkan PIN untuk membuka pesan milik <span className="font-bold text-stone-900">@{username}</span>
            </p>

            <form onSubmit={handleUnlock} className="space-y-3 max-w-xs mx-auto">
              <input
                type="password"
                required
                maxLength={8}
                placeholder="Masukkan PIN..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-base font-bold bg-[#faf7f2] border border-stone-400 rounded-sm py-2 px-3 text-stone-900 focus:outline-none focus:border-stone-900"
              />

              {errorMsg && (
                <p className="text-xs text-rose-700 font-bold">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-sm transition-colors"
              >
                {loading ? 'Memverifikasi...' : 'Buka Inbox'}
              </button>
            </form>

            <div className="pt-2 border-t border-stone-200">
              <Link href={`/u/${username}`} className="text-xs text-stone-600 font-bold underline">
                Kembali ke Halaman Pengirim
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Top Link Banner */}
            <div className="bg-[#e5dec9] border border-stone-400 p-2.5 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="font-bold text-stone-900">
                Link Pengirim: <span className="underline">{domain}/u/{username}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-1 px-3 bg-stone-900 text-stone-100 font-bold text-xs rounded-sm flex-shrink-0"
              >
                {copiedLink ? 'Tersalin!' : 'Salin Link'}
              </button>
            </div>

            {/* Messages List */}
            {messages.length === 0 ? (
              <div className="bg-[#fffefb] border border-stone-400 p-8 rounded-sm text-center space-y-3 my-2">
                <h3 className="font-handwriting text-2xl font-bold text-stone-900">Belum Ada Pesan</h3>
                <p className="text-xs text-stone-600 max-w-xs mx-auto">
                  Sebarkan link Anda di media sosial agar teman Anda dapat mengirimi lagu & pesan rahasia.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-[#fffefb] border border-stone-400 p-4 rounded-sm space-y-3 relative hover:border-stone-800 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">
                          Dari: {msg.sender_alias}
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">
                          • {new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-stone-400 hover:text-rose-700 text-xs font-bold"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="bg-[#faf7f2] p-3 rounded-sm border border-stone-300">
                      <p className="text-xs sm:text-sm font-semibold text-stone-900 leading-relaxed">
                        "{msg.message_text}"
                      </p>
                    </div>

                    {msg.song_title && (
                      <div className="bg-[#e5dec9] p-3 rounded-sm border border-stone-400 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={msg.song_album_cover || '/placeholder-music.png'}
                              alt={msg.song_title}
                              className="w-10 h-10 rounded-sm object-cover border border-stone-400"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-amber-900 uppercase block">
                                Lagu Rahasia
                              </span>
                              <h4 className="text-xs font-bold text-stone-900 truncate">
                                {msg.song_title}
                              </h4>
                              <p className="text-[10px] text-stone-600 truncate font-medium">{msg.song_artist}</p>
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

                        {msg.selected_lyrics && (
                          <div className="text-[11px] italic text-stone-900 font-medium pl-2 border-l-2 border-stone-900 pt-0.5">
                            "{msg.selected_lyrics}"
                          </div>
                        )}
                      </div>
                    )}

                    {msg.hint_sender && (
                      <div className="text-[11px] text-stone-700 bg-stone-100 p-2 rounded-sm border border-stone-300 font-medium">
                        Petunjuk: <span className="font-bold">{msg.hint_sender}</span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedMessageForStory(msg)}
                        className="py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-sm transition-colors"
                      >
                        Export Kartu / Video 9:16
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </BinderNotebook>

      {selectedMessageForStory && (
        <StoryExporterModal
          message={selectedMessageForStory}
          recipientName={user?.name || username}
          onClose={() => setSelectedMessageForStory(null)}
        />
      )}
    </main>
  );
}
