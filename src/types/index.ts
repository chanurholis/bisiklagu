export interface User {
  id: string;
  username: string;
  name: string;
  pin: string;
  bio_prompt: string;
  theme: string;
  avatar: string;
  created_at: string;
}

export interface SecretMessage {
  id: string;
  username: string;
  sender_alias: string;
  message_text: string;
  song_title?: string;
  song_artist?: string;
  song_album_cover?: string;
  song_preview_url?: string;
  selected_lyrics?: string;
  theme_style: string;
  hint_sender?: string;
  reply_text?: string;
  replied_at?: string;
  is_read: number;
  created_at: string;
}

export interface SongTrack {
  trackId: number | string;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100: string;
  artworkUrl600?: string;
  previewUrl: string;
  lyricsSnippet?: string;
}

export type StoryTheme = 
  | 'paper_binder'
  | 'spotify' 
  | 'cyberpunk' 
  | 'glassmorphism' 
  | 'sunset' 
  | 'retro_vinyl' 
  | 'pastel_love'
  | 'neon_dark';
