'use client';

import React, { useEffect, useState, use } from 'react';
import { User, SecretMessage } from '@/types';
import SongPicker from '@/components/SongPicker';
import BinderNotebook from '@/components/BinderNotebook';
import StoryExporterModal from '@/components/StoryExporterModal';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function SendSecretMessagePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<SecretMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
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

  // Audio playback state
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  // Check if visitor is the owner of this page
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionRaw = localStorage.getItem('bisiklagu_session');
      if (sessionRaw) {
        try {
          const parsed = JSON.parse(sessionRaw);
          if (parsed?.username?.toLowerCase() === username.toLowerCase()) {
            setIsOwner(true);
          }
        } catch (e) {}
      }
    }
    fetchData();
  }, [username]);

  const fetchData = async () => {
    try {
      const userRes = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
      if (!userRes.ok) {
        setNotFound(true);
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      if (userData.user?.name) {
        document.title = `${userData.user.name} (@${username}) • Catatan & Lagu Rahasia - BisikLagu`;
      } else {
        document.title = `Profil @${username} - BisikLagu`;
      }

      const msgRes = await fetch(`/api/messages?username=${encodeURIComponent(username)}&public=true`);
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

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
        fetchData();
      } else {
        alert('Gagal mengirim pesan. Silakan coba lagi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSending(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1917] flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-stone-400">Memuat profil & pesan...</p>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen bg-[#1c1917] flex flex-col items-center justify-center p-4">
        <BinderNotebook title="Pengguna Tidak Ditemukan" subtitle="Username belum terdaftar">
          <div className="text-center py-6 space-y-4">
            <p className="text-sm text-stone-600">
              Username <span className="font-bold text-stone-900">@{username}</span> belum terdaftar.
            </p>
            <Link
              href="/"
              className="inline-block py-2.5 px-5 bg-stone-900 text-stone-100 font-bold text-sm rounded-sm"
            >
              Buat Link Baru
            </Link>
          </div>
        </BinderNotebook>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#1c1917] text-stone-900 flex flex-col justify-center">
      <BinderNotebook
        title={`Profil ${user.name}`}
        subtitle={`"${user.bio_prompt}"`}
      >
        {/* Owner Quick Inbox Nav Banner */}
        {isOwner && (
          <div className="bg-amber-100 border border-amber-400 p-3 sm:p-4 rounded-sm flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-amber-950 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span>📥</span>
              <span className="truncate">Anda pemilik halaman ini. Buka inbox untuk membalas & membagikan kartu.</span>
            </div>
            <Link
              href={`/u/${username}/inbox`}
              className="py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-bold rounded-sm flex-shrink-0 transition-colors"
            >
              Buka Inbox
            </Link>
          </div>
        )}

        {/* Toggle Form Header Bar */}
        <div className="bg-[#e5dec9] border border-stone-400 p-3 sm:p-3.5 rounded-sm flex items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="font-bold text-stone-900">
            {messages.length} Pesan Diterima
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setIsSent(false);
            }}
            className="py-2 px-3.5 bg-stone-900 text-stone-100 hover:bg-stone-800 font-bold text-xs sm:text-sm rounded-sm transition-colors shadow-sm"
          >
            {showForm ? 'Tutup Form' : '+ Kirim Pesan & Lagu'}
          </button>
        </div>

        {/* Message Creation Form */}
        {showForm && (
          <div className="bg-[#fffefb] border-2 border-stone-800 p-4 sm:p-5 rounded-sm space-y-4 my-3 animate-fade-in">
            {isSent ? (
              <div className="text-center py-4 space-y-3">
                <h3 className="font-handwriting text-3xl font-bold text-stone-900">
                  Pesan Rahasia Terkirim!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">
                  Pesan dan lagu rahasiamu sudah terkirim ke {user.name}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setMessageText('');
                    setSelectedSong(null);
                  }}
                  className="py-2.5 px-4 bg-stone-200 hover:bg-stone-300 text-stone-900 font-bold text-xs sm:text-sm rounded-sm border border-stone-400"
                >
                  Kirim Pesan Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <h3 className="font-bold text-base sm:text-lg text-stone-900 border-b border-stone-300 pb-2">
                  Tulis Pesan untuk {user.name}
                </h3>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-stone-900 block">
                    Pesan
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={`Tuliskan pesan rahasia untuk ${user.name}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full bg-[#faf7f2] border border-stone-300 rounded-sm p-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none font-medium"
                  />

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Nama Pengirim (Opsional):
                    </label>
                    <input
                      type="text"
                      placeholder="Pengagum Rahasia..."
                      value={senderAlias}
                      onChange={(e) => setSenderAlias(e.target.value)}
                      className="w-full bg-[#faf7f2] border border-stone-300 rounded-sm py-2 px-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                <SongPicker
                  onSelectSong={(song) => setSelectedSong(song)}
                  selectedSongData={selectedSong}
                />

                <div>
                  <label className="text-xs sm:text-sm font-bold text-stone-900 block mb-1">
                    Petunjuk Pengirim (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Teman satu kelas..."
                    value={hintSender}
                    onChange={(e) => setHintSender(e.target.value)}
                    className="w-full bg-[#faf7f2] border border-stone-300 rounded-sm py-2 px-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-sm sm:text-base rounded-sm transition-colors disabled:opacity-50 shadow-md"
                >
                  {isSending ? 'Mengirim...' : 'Kirim Pesan Rahasia'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Public Messages Section */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-base sm:text-lg text-stone-900 flex items-center justify-between border-b border-stone-300 pb-2">
            <span>Pesan Rahasia Terkirim</span>
            <span className="text-xs text-stone-500 font-medium">Terbaru</span>
          </h3>

          {messages.length === 0 ? (
            <div className="bg-[#fffefb] border border-stone-400 p-6 sm:p-8 rounded-sm text-center space-y-2">
              <h4 className="font-bold text-lg text-stone-900">Belum Ada Pesan</h4>
              <p className="text-xs sm:text-sm text-stone-600">
                Jadilah orang pertama yang mengirimi <span className="font-bold">{user.name}</span> pesan & lagu rahasia!
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-2 py-2.5 px-4 bg-stone-900 text-stone-100 font-bold text-xs sm:text-sm rounded-sm inline-block shadow-sm"
              >
                Kirim Pesan Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-[#fffefb] border border-stone-400 p-4 sm:p-5 rounded-sm space-y-3 relative hover:border-stone-700 transition-colors shadow-sm"
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">
                        Dari: {msg.sender_alias}
                      </span>
                      <span className="text-[11px] sm:text-xs text-stone-500 font-medium">
                        • {new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Secret Message Content */}
                  <div className="bg-[#faf7f2] p-3 sm:p-3.5 rounded-sm border border-stone-300">
                    <p className="text-sm sm:text-base font-semibold text-stone-900 leading-relaxed">
                      "{msg.message_text}"
                    </p>
                  </div>

                  {/* Song Audio & Lyric snippet */}
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

                  {/* Sender Hint */}
                  {msg.hint_sender && (
                    <div className="text-xs sm:text-sm text-stone-700 bg-stone-100 p-2.5 rounded-sm border border-stone-300 font-medium">
                      Petunjuk: <span className="font-bold">{msg.hint_sender}</span>
                    </div>
                  )}

                  {/* Recipient's Reply Section */}
                  {msg.reply_text && (
                    <div className="bg-[#fef08a] border border-amber-400 p-3 sm:p-3.5 rounded-sm space-y-1 mt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase">
                        <span>Balasan dari {user.name}:</span>
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
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 text-center border-t border-stone-300">
          <Link
            href="/"
            className="text-xs sm:text-sm text-stone-600 hover:text-stone-900 font-bold underline"
          >
            Ingin punya link BisikLagu sendiri? Buat di sini
          </Link>
        </div>
      </BinderNotebook>
    </main>
  );
}
