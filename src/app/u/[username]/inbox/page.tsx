'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import BinderNotebook from '@/components/BinderNotebook';
import StoryExporterModal from '@/components/StoryExporterModal';
import { User, SecretMessage } from '@/types';
import Link from 'next/link';

interface InboxPageProps {
  params: Promise<{ username: string }>;
}

export default function InboxPage({ params }: InboxPageProps) {
  const { username } = use(params);
  const router = useRouter();
  const [domain, setDomain] = useState('bisiklagu.com');
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<SecretMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMessageForStory, setSelectedMessageForStory] = useState<SecretMessage | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Public reply state
  const [replyingMsgId, setReplyingMsgId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Active Session token if logged in
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Inbox Catatan @${username} - BisikLagu`;
    if (typeof window !== 'undefined') {
      setDomain(window.location.host);

      // Check session
      const sessionRaw = localStorage.getItem('bisiklagu_session');
      if (sessionRaw) {
        try {
          const parsed = JSON.parse(sessionRaw);
          if (parsed?.username?.toLowerCase() === username.toLowerCase() && parsed?.token) {
            setSessionToken(parsed.token);
            fetchInboxWithToken(parsed.token);
            return;
          }
        } catch (e) {}
      }

      // Check fallback PIN
      const savedPin = localStorage.getItem(`bisiklagu_pin_${username}`);
      if (savedPin) {
        fetchInboxWithPin(savedPin);
        return;
      }

      // No active session or PIN -> redirect to login instead of displaying locked screen
      router.push('/login');
    }
  }, [username]);

  // Fast token fetch (No bcrypt overhead)
  const fetchInboxWithToken = async (token: string) => {
    setLoading(true);
    try {
      // Fetch user profile info
      const uRes = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      // Fetch inbox messages using Authorization token
      const msgRes = await fetch(`/api/messages?username=${encodeURIComponent(username)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!msgRes.ok) {
        throw new Error('Sesi telah kadaluarsa');
      }

      const msgData = await msgRes.json();
      setMessages(msgData.messages || []);
    } catch (err) {
      // Token invalid or expired, check saved PIN fallback or redirect to login
      const savedPin = localStorage.getItem(`bisiklagu_pin_${username}`);
      if (savedPin) {
        fetchInboxWithPin(savedPin);
      } else {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Full PIN Authentication & Token Generation
  const fetchInboxWithPin = async (pinCode: string) => {
    setLoading(true);
    try {
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin: pinCode }),
      });

      if (!loginRes.ok) {
        router.push('/login');
        return;
      }

      const loginData = await loginRes.json();
      setUser(loginData.user);
      setSessionToken(loginData.token);

      // Save logged in user session with token
      const sessionObj = {
        username: loginData.user.username,
        name: loginData.user.name,
        token: loginData.token,
        pin: pinCode,
        avatar: loginData.user.avatar || '🎵',
      };
      localStorage.setItem('bisiklagu_session', JSON.stringify(sessionObj));
      localStorage.setItem(`bisiklagu_pin_${username}`, pinCode);
      window.dispatchEvent(new Event('bisiklagu_auth_change'));

      const msgRes = await fetch(`/api/messages?username=${encodeURIComponent(username)}`, {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      const msgData = await msgRes.json();

      setMessages(msgData.messages || []);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
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

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      const savedPin = typeof window !== 'undefined' ? localStorage.getItem(`bisiklagu_pin_${username}`) || '' : '';
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`/api/messages/${msgId}?username=${encodeURIComponent(username)}&pin=${encodeURIComponent(savedPin)}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      } else {
        const errData = await res.json();
        alert(errData.error || 'Gagal menghapus pesan');
      }
    } catch (err) {
      alert('Gagal menghapus pesan');
    }
  };

  const handleSaveReply = async (msgId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      const savedPin = typeof window !== 'undefined' ? localStorage.getItem(`bisiklagu_pin_${username}`) || '' : '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`/api/messages/${msgId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          username,
          pin: savedPin,
          token: sessionToken,
          reply_text: replyText.trim(),
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, reply_text: resData.reply_text || replyText.trim(), replied_at: new Date().toISOString() }
              : m
          )
        );
        setReplyingMsgId(null);
        setReplyText('');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Gagal menyimpan balasan');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.protocol}//${domain}/u/${username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#1c1917] text-stone-900 flex flex-col justify-center">
      <BinderNotebook
        title={`Inbox Catatan Rahasia`}
        subtitle={`Pesan & lagu rahasia yang dikirimkan secara anonim untuk @${username}`}
      >
        {loading ? (
          /* Loading State Spinner */
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-stone-900 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-600">Memuat Inbox Rahasia...</p>
          </div>
        ) : (
          /* Unlocked Inbox Messages Feed */
          /* Unlocked State - Inbox Messages Feed */
          <div className="space-y-5">
            {/* Quick Share Link Banner */}
            <div className="bg-[#e5dec9] border border-stone-400 p-3.5 sm:p-4 rounded-sm flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-stone-900 shadow-xs">
              <span className="truncate">
                Link Pengirim: <span className="underline">{domain}/u/{username}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-1.5 px-3.5 bg-stone-900 text-stone-100 font-bold text-xs sm:text-sm rounded-sm flex-shrink-0"
              >
                {copiedLink ? 'Tersalin!' : 'Salin Link'}
              </button>
            </div>

            {/* Messages List */}
            {messages.length === 0 ? (
              <div className="bg-[#fffefb] border border-stone-400 p-8 rounded-sm text-center space-y-3 my-2">
                <h3 className="font-bold text-lg text-stone-900">Belum Ada Pesan</h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-xs mx-auto">
                  Sebarkan link Anda di media sosial agar teman Anda dapat mengirimi lagu & pesan rahasia.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-[#fffefb] border border-stone-400 p-4 sm:p-5 rounded-sm space-y-3 relative hover:border-stone-800 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">
                          Dari: {msg.sender_alias}
                        </span>
                        <span className="text-[11px] sm:text-xs text-stone-500 font-medium">
                          • {new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-stone-400 hover:text-rose-700 text-xs sm:text-sm font-bold"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="bg-[#faf7f2] p-3 sm:p-3.5 rounded-sm border border-stone-300">
                      <p className="text-sm sm:text-base font-semibold text-stone-900 leading-relaxed">
                        {msg.message_text}
                      </p>
                    </div>

                    {msg.song_title && (
                      <div className="bg-[#e5dec9] p-3.5 rounded-sm border border-stone-400 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={msg.song_album_cover || '/placeholder-music.png'}
                              alt={msg.song_title}
                              className="w-11 h-11 rounded-sm object-cover border border-stone-400 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-amber-900 uppercase block">
                                Lagu Rahasia
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                                {msg.song_title}
                              </h4>
                              <p className="text-xs text-stone-600 truncate font-medium">{msg.song_artist}</p>
                            </div>
                          </div>

                          {msg.song_preview_url && (
                            <button
                              type="button"
                              onClick={(e) => handleTogglePlayAudio(msg, e)}
                              className="w-8 h-8 rounded-sm bg-stone-900 text-stone-100 text-xs sm:text-sm font-bold flex items-center justify-center flex-shrink-0"
                            >
                              {playingMsgId === msg.id ? '⏸' : '▶'}
                            </button>
                          )}
                        </div>

                        {msg.selected_lyrics && (
                          <div className="bg-[#faf7f2]/80 p-2.5 rounded-sm border-l-2 border-stone-800 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider block text-stone-700 mb-0.5">
                              Lirik:
                            </span>
                            <p className="text-xs sm:text-sm font-medium italic text-stone-900 leading-normal">
                              "{msg.selected_lyrics}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.hint_sender && (
                      <div className="text-xs sm:text-sm text-stone-700 bg-stone-100 p-2.5 rounded-sm border border-stone-300 font-medium">
                        Petunjuk: <span className="font-bold">{msg.hint_sender}</span>
                      </div>
                    )}

                    {msg.reply_text && (
                      <div className="bg-[#fef08a] border border-amber-400 p-3 sm:p-3.5 rounded-sm space-y-1 mt-2">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase">
                          <span>Balasan dari {user?.name || username}:</span>
                          {msg.replied_at && (
                            <span className="font-normal opacity-75 text-[11px]">
                              {new Date(msg.replied_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-stone-950 leading-relaxed">
                          {msg.reply_text}
                        </p>
                      </div>
                    )}

                    {/* Inline Reply Form */}
                    {replyingMsgId === msg.id && (
                      <div className="bg-amber-50 border border-amber-300 p-3 rounded-sm space-y-2 mt-2">
                        <label className="text-xs font-bold text-stone-900 block">
                          Tulis Balasan Publik:
                        </label>
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Ketik balasan Anda untuk ditampilkan di profil publik..."
                          className="w-full text-xs sm:text-sm p-2 border border-stone-400 rounded-sm focus:outline-none focus:border-stone-900"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingMsgId(null);
                              setReplyText('');
                            }}
                            className="py-1 px-3 bg-stone-200 text-stone-800 text-xs font-bold rounded-sm hover:bg-stone-300"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            disabled={submittingReply || !replyText.trim()}
                            onClick={() => handleSaveReply(msg.id)}
                            className="py-1 px-3 bg-amber-900 text-amber-100 text-xs font-bold rounded-sm hover:bg-amber-800 disabled:opacity-50"
                          >
                            {submittingReply ? 'Menyimpan...' : 'Kirim Balasan'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-stone-200 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (replyingMsgId === msg.id) {
                            setReplyingMsgId(null);
                          } else {
                            setReplyingMsgId(msg.id);
                            setReplyText(msg.reply_text || '');
                          }
                        }}
                        className="py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-sm transition-colors border border-amber-300 flex items-center gap-1.5"
                      >
                        <span>💬 {msg.reply_text ? 'Edit Balasan' : 'Balas Publik'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMessageForStory(msg)}
                        className="py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-sm transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <span>Bagikan Kartu</span>
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
