import { supabase, isSupabaseConfigured } from './supabase';
import { getDb } from './db';
import { User, SecretMessage } from '@/types';
import bcrypt from 'bcryptjs';

// ==========================================
// PIN ENCRYPTION & SECURITY OPERATIONS
// ==========================================

export function hashPin(pin: string): string {
  return bcrypt.hashSync(pin, 10);
}

export async function verifyAndUpgradeUserPin(user: User, inputPin: string): Promise<boolean> {
  if (!user || !user.pin) return false;

  const isBcrypt = user.pin.startsWith('$2a$') || user.pin.startsWith('$2b$');

  if (isBcrypt) {
    return bcrypt.compareSync(inputPin, user.pin);
  }

  // Legacy plain-text check & auto-upgrade to bcrypt
  if (user.pin === inputPin) {
    const hashed = hashPin(inputPin);
    await updateUserPin(user.username, hashed);
    return true;
  }

  return false;
}

export async function updateUserPin(username: string, hashedPin: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('users')
      .update({ pin: hashedPin })
      .eq('username', username);

    if (error) {
      console.error('Supabase updateUserPin error:', error);
      return false;
    }
    return true;
  }

  try {
    const db = getDb();
    db.prepare('UPDATE users SET pin = ? WHERE username = ?').run(hashedPin, username);
    return true;
  } catch (err) {
    console.error('SQLite updateUserPin error:', err);
    return false;
  }
}

// ==========================================
// USER DATABASE OPERATIONS
// ==========================================

export async function getUserByUsername(username: string): Promise<User | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Supabase getUserByUsername error:', error);
      return null;
    }
    return data as User | null;
  }

  // SQLite Fallback
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    return (user as User) || null;
  } catch (err) {
    console.error('SQLite getUserByUsername error:', err);
    return null;
  }
}

export async function getAllUsernames(limit = 100): Promise<{ username: string; created_at?: string }[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('username, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase getAllUsernames error:', error);
      return [];
    }
    return data || [];
  }

  try {
    const db = getDb();
    const rows = db
      .prepare('SELECT username, created_at FROM users ORDER BY created_at DESC LIMIT ?')
      .all(limit);
    return (rows as { username: string; created_at?: string }[]) || [];
  } catch (err) {
    console.error('SQLite getAllUsernames error:', err);
    return [];
  }
}

export async function createUser(user: {
  id: string;
  username: string;
  name: string;
  pin: string;
  bio_prompt?: string;
  theme?: string;
  avatar?: string;
}): Promise<User | null> {
  const hashedPin = hashPin(user.pin);

  const newUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    pin: hashedPin,
    bio_prompt: user.bio_prompt || 'Kirimkan pesan rahasia & lagu favoritmu!',
    theme: user.theme || 'paper_binder',
    avatar: user.avatar || '🎵',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      console.error('Supabase createUser error:', error);
      throw new Error(error.message);
    }
    return data as User;
  }

  // SQLite Fallback
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO users (id, username, name, pin, bio_prompt, theme, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    newUser.id,
    newUser.username,
    newUser.name,
    newUser.pin,
    newUser.bio_prompt,
    newUser.theme,
    newUser.avatar
  );

  return newUser as User;
}

// ==========================================
// MESSAGE DATABASE OPERATIONS
// ==========================================

export async function getRecentPublicMessages(limit = 6): Promise<SecretMessage[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase getRecentPublicMessages error:', error);
      return [];
    }
    return (data as SecretMessage[]) || [];
  }

  // SQLite Fallback
  try {
    const db = getDb();
    const msgs = db
      .prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT ?')
      .all(limit);
    return (msgs as SecretMessage[]) || [];
  } catch (err) {
    console.error('SQLite getRecentPublicMessages error:', err);
    return [];
  }
}

export async function getMessagesByUsername(username: string): Promise<SecretMessage[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getMessagesByUsername error:', error);
      return [];
    }
    return (data as SecretMessage[]) || [];
  }

  // SQLite Fallback
  try {
    const db = getDb();
    const msgs = db
      .prepare('SELECT * FROM messages WHERE username = ? ORDER BY created_at DESC')
      .all(username);
    return (msgs as SecretMessage[]) || [];
  } catch (err) {
    console.error('SQLite getMessagesByUsername error:', err);
    return [];
  }
}

export async function createMessage(msg: {
  id: string;
  username: string;
  sender_alias?: string;
  message_text: string;
  song_title?: string;
  song_artist?: string;
  song_album_cover?: string;
  song_preview_url?: string;
  selected_lyrics?: string;
  theme_style?: string;
  hint_sender?: string;
}): Promise<SecretMessage> {
  const newMsg = {
    id: msg.id,
    username: msg.username,
    sender_alias: msg.sender_alias || 'Pengagum Rahasia',
    message_text: msg.message_text,
    song_title: msg.song_title || null,
    song_artist: msg.song_artist || null,
    song_album_cover: msg.song_album_cover || null,
    song_preview_url: msg.song_preview_url || null,
    selected_lyrics: msg.selected_lyrics || null,
    theme_style: msg.theme_style || 'paper_binder',
    hint_sender: msg.hint_sender || null,
    is_read: 0,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('messages')
      .insert([newMsg])
      .select()
      .single();

    if (error) {
      console.error('Supabase createMessage error:', error);
      throw new Error(error.message);
    }
    return data as SecretMessage;
  }

  // SQLite Fallback
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO messages (id, username, sender_alias, message_text, song_title, song_artist, song_album_cover, song_preview_url, selected_lyrics, theme_style, hint_sender, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    newMsg.id,
    newMsg.username,
    newMsg.sender_alias,
    newMsg.message_text,
    newMsg.song_title,
    newMsg.song_artist,
    newMsg.song_album_cover,
    newMsg.song_preview_url,
    newMsg.selected_lyrics,
    newMsg.theme_style,
    newMsg.hint_sender,
    0
  );

  return newMsg as unknown as SecretMessage;
}

// ==========================================
// UNREAD NOTIFICATIONS & READ STATUS
// ==========================================

export async function getUnreadMessageCount(username: string): Promise<number> {
  if (isSupabaseConfigured && supabase) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('username', username)
      .eq('is_read', 0);

    if (error) {
      console.error('Supabase getUnreadMessageCount error:', error);
      return 0;
    }
    return count || 0;
  }

  try {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM messages WHERE username = ? AND is_read = 0').get(username) as any;
    return row?.count || 0;
  } catch (err) {
    console.error('SQLite getUnreadMessageCount error:', err);
    return 0;
  }
}

export async function markMessagesAsRead(username: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: 1 })
      .eq('username', username)
      .eq('is_read', 0);

    if (error) {
      console.error('Supabase markMessagesAsRead error:', error);
      return false;
    }
    return true;
  }

  try {
    const db = getDb();
    db.prepare('UPDATE messages SET is_read = 1 WHERE username = ? AND is_read = 0').run(username);
    return true;
  } catch (err) {
    console.error('SQLite markMessagesAsRead error:', err);
    return false;
  }
}

export async function deleteMessageById(id: string, username: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .eq('username', username);

    if (error) {
      console.error('Supabase deleteMessageById error:', error);
      return false;
    }
    return true;
  }

  // SQLite Fallback
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM messages WHERE id = ? AND username = ?').run(id, username);
    return result.changes > 0;
  } catch (err) {
    console.error('SQLite deleteMessageById error:', err);
    return false;
  }
}

export async function replyToMessage(id: string, username: string, replyText: string): Promise<boolean> {
  const repliedAt = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('messages')
      .update({ reply_text: replyText, replied_at: repliedAt })
      .eq('id', id)
      .eq('username', username);

    if (error) {
      console.error('Supabase replyToMessage error:', error);
      return false;
    }
    return true;
  }

  // SQLite Fallback
  try {
    const db = getDb();
    const result = db
      .prepare('UPDATE messages SET reply_text = ?, replied_at = ? WHERE id = ? AND username = ?')
      .run(replyText, repliedAt, id, username);
    return result.changes > 0;
  } catch (err) {
    console.error('SQLite replyToMessage error:', err);
    return false;
  }
}
