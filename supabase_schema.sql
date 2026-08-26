-- ===================================================
-- BISIKLAGU SUPABASE DATABASE SCHEMA SETUP
-- Copy & Paste script ini di Supabase SQL Editor
-- ===================================================

-- 1. Tabel Users (Profil Pemilik Link)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  bio_prompt TEXT DEFAULT 'Kirimkan pesan rahasia & lagu favoritmu!',
  theme TEXT DEFAULT 'paper_binder',
  avatar TEXT DEFAULT '🎵',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Messages (Pesan & Lagu Rahasia)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  sender_alias TEXT DEFAULT 'Pengagum Rahasia',
  message_text TEXT NOT NULL,
  song_title TEXT,
  song_artist TEXT,
  song_album_cover TEXT,
  song_preview_url TEXT,
  selected_lyrics TEXT,
  theme_style TEXT DEFAULT 'paper_binder',
  hint_sender TEXT,
  reply_text TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrasi aman jika tabel messages sudah ada sebelumnya:
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_text TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;

-- 3. Index untuk performa pencarian pesan berdasarkan username
CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username);

-- 4. Enable Row Level Security & Public Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to users" ON users;
CREATE POLICY "Allow public access to users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to messages" ON messages;
CREATE POLICY "Allow public access to messages" ON messages FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed Data Pengguna Demo
INSERT INTO users (id, username, name, pin, bio_prompt, theme, avatar)
VALUES ('user_demo_123', 'demo', 'Alex', '1234', 'Kirimkan lagu & pesan rahasia untukku! 🎧', 'paper_binder', '🎧')
ON CONFLICT (username) DO NOTHING;

INSERT INTO messages (id, username, sender_alias, message_text, song_title, song_artist, song_album_cover, song_preview_url, selected_lyrics, theme_style, hint_sender, reply_text, replied_at, is_read)
VALUES (
  'msg_demo_1',
  'demo',
  'Pengagum Rahasiamu 💌',
  'Setiap dengar lagu ini, aku selalu teringat senyum kamu pas kemarin. Semoga hari-harimu selalu indah ya! ✨',
  'Untungnya, Hidup Harus Terus Berjalan',
  'Bernadya',
  'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/bf/25/70/bf257007-8e69-ae94-1a3b-ff70f5e13589/cover.jpg/600x600bb.jpg',
  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo221/v4/44/2c/3e/442c3e21-08fa-ef83-9b81-a9e99cdd84df/mzaf_6774984242636544976.plus.aac.p.m4a',
  'Lagu ini mewakili Perasaanku ke kamu, yang tersimpan rapat tapi tulus.',
  'paper_binder',
  'Inisial A - Teman satu kelas',
  'Makasih banyak ya! Lagunya bagus banget, jujur tersentuh pas dengernya 🥹❤️',
  CURRENT_TIMESTAMP,
  0
) ON CONFLICT (id) DO NOTHING;
