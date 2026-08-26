import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let instance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!instance) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'bisiklagu.db');
    instance = new Database(dbPath, { timeout: 10000 });

    instance.pragma('journal_mode = WAL');

    instance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        pin TEXT NOT NULL,
        bio_prompt TEXT DEFAULT 'Kirim pesan rahasia & lagu favoritmu! 🎵🤫',
        theme TEXT DEFAULT 'paper_binder',
        avatar TEXT DEFAULT '🎧',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        sender_alias TEXT DEFAULT 'Seseorang yang menyukaimu 🤫',
        message_text TEXT NOT NULL,
        song_title TEXT,
        song_artist TEXT,
        song_album_cover TEXT,
        song_preview_url TEXT,
        selected_lyrics TEXT,
        theme_style TEXT DEFAULT 'paper_binder',
        hint_sender TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(username) REFERENCES users(username)
      );

      CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username);
    `);

    // Ensure default demo user exists (Alex)
    const existingDemoUser = instance.prepare('SELECT * FROM users WHERE username = ?').get('demo');
    if (!existingDemoUser) {
      const insertDemo = instance.prepare(`
        INSERT INTO users (id, username, name, pin, bio_prompt, theme, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertDemo.run(
        'user_demo_123',
        'demo',
        'Alex',
        '1234',
        'Kirimkan lagu & pesan rahasia untukku! 🎧',
        'paper_binder',
        '🎧'
      );

      const insertMsg = instance.prepare(`
        INSERT INTO messages (id, username, sender_alias, message_text, song_title, song_artist, song_album_cover, song_preview_url, selected_lyrics, theme_style, hint_sender, is_read)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertMsg.run(
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
        'Inisial A - Teman satu sekolah',
        0
      );
      insertMsg.run(
        'msg_demo_2',
        'demo',
        'Secret Admirer 🌙',
        'Cobain dengerin lirik lagu ini deh, serius pas banget sama kamu!',
        'Mantan Terindah',
        'Kahitna',
        'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/37/6f/ef/376fef38-be13-aa86-f187-84bc783c5095/cover.jpg/600x600bb.jpg',
        'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo115/v4/a4/09/a2/a409a25b-2425-4c07-b088-3ef795aa7e84/mzaf_16488319692484646097.plus.aac.p.m4a',
        'Mau dikatakan apa lagi, kita tak lagi sejalan...',
        'cyberpunk',
        'Orang yang dulu pernah dekat',
        0
      );
    }
  }
  return instance;
}

export default getDb;
