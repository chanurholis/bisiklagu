'use client';

import React, { useState, useEffect } from 'react';
import { SongTrack } from '@/types';
import { Search, Music, Play, Pause, Check, Quote, RefreshCw, X, Paperclip } from 'lucide-react';
import { decodeHTMLEntities } from '@/lib/security';

interface SongPickerProps {
  onSelectSong: (song: {
    song_title: string;
    song_artist: string;
    song_album_cover: string;
    song_preview_url: string;
    selected_lyrics?: string;
  } | null) => void;
  selectedSongData?: {
    song_title?: string;
    song_artist?: string;
    song_album_cover?: string;
    song_preview_url?: string;
    selected_lyrics?: string;
  } | null;
}

export default function SongPicker({ onSelectSong, selectedSongData }: SongPickerProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SongTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SongTrack | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  // Lyrics states
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsList, setLyricsList] = useState<string[]>([]);
  const [selectedLyricLine, setSelectedLyricLine] = useState<string>('');
  const [customLyric, setCustomLyric] = useState<string>('');

  const popularSuggestions = [
    { trackName: 'Untungnya, Hidup Harus Terus Berjalan', artistName: 'Bernadya' },
    { trackName: 'Satu Bulan', artistName: 'Bernadya' },
    { trackName: 'Bunga Maaf', artistName: 'Perunggu' },
    { trackName: 'Mantan Terindah', artistName: 'Kahitna' },
    { trackName: 'Nanti Kita Seperti Ini', artistName: 'Batas Senja' },
    { trackName: 'Die With A Smile', artistName: 'Bruno Mars & Lady Gaga' },
  ];

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Failed to search songs', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch(query);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleChooseTrack = async (track: SongTrack) => {
    setSelectedTrack(track);
    setSelectedLyricLine('');
    setCustomLyric('');

    setIsLoadingLyrics(true);
    try {
      const res = await fetch(
        `/api/songs/lyrics?track=${encodeURIComponent(track.trackName)}&artist=${encodeURIComponent(
          track.artistName
        )}`
      );
      const data = await res.json();
      const rawLyrics: string[] = data.lyrics || [];
      setLyricsList(rawLyrics.map((l) => decodeHTMLEntities(l)));
    } catch (e) {
      setLyricsList([]);
    } finally {
      setIsLoadingLyrics(false);
    }

    onSelectSong({
      song_title: track.trackName,
      song_artist: track.artistName,
      song_album_cover: track.artworkUrl600 || track.artworkUrl100,
      song_preview_url: track.previewUrl,
      selected_lyrics: '',
    });
  };

  const togglePlayPreview = (track: SongTrack, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingTrackId === track.trackId) {
      if (audioObj) {
        audioObj.pause();
        setPlayingTrackId(null);
      }
      return;
    }

    if (audioObj) audioObj.pause();

    if (track.previewUrl) {
      const newAudio = new Audio(track.previewUrl);
      newAudio.play().catch(() => {});
      newAudio.onended = () => setPlayingTrackId(null);
      setAudioObj(newAudio);
      setPlayingTrackId(track.trackId);
    }
  };

  const handleSelectLyricLine = (line: string) => {
    const cleanLine = decodeHTMLEntities(line);
    const finalLyric = selectedLyricLine === cleanLine ? '' : cleanLine;
    setSelectedLyricLine(finalLyric);
    if (selectedTrack) {
      onSelectSong({
        song_title: selectedTrack.trackName,
        song_artist: selectedTrack.artistName,
        song_album_cover: selectedTrack.artworkUrl600 || selectedTrack.artworkUrl100,
        song_preview_url: selectedTrack.previewUrl,
        selected_lyrics: finalLyric || customLyric,
      });
    }
  };

  const handleCustomLyricChange = (val: string) => {
    const cleanVal = decodeHTMLEntities(val);
    setCustomLyric(cleanVal);
    setSelectedLyricLine('');
    if (selectedTrack) {
      onSelectSong({
        song_title: selectedTrack.trackName,
        song_artist: selectedTrack.artistName,
        song_album_cover: selectedTrack.artworkUrl600 || selectedTrack.artworkUrl100,
        song_preview_url: selectedTrack.previewUrl,
        selected_lyrics: cleanVal,
      });
    }
  };

  const handleClearSelectedTrack = () => {
    if (audioObj) audioObj.pause();
    setSelectedTrack(null);
    setPlayingTrackId(null);
    setLyricsList([]);
    setSelectedLyricLine('');
    setCustomLyric('');
    onSelectSong(null);
  };

  return (
    <div className="w-full bg-[#fefcf8] border-2 border-stone-300 rounded-2xl p-3 sm:p-4 shadow-sm text-stone-900">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
          <Music className="w-4 h-4 text-amber-700" /> 2. Sisipkan Lagu Rahasia & Lirik
        </label>
        {selectedTrack && (
          <button
            type="button"
            onClick={handleClearSelectedTrack}
            className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-bold"
          >
            <X className="w-3.5 h-3.5" /> Ganti Lagu
          </button>
        )}
      </div>

      {!selectedTrack ? (
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari judul lagu atau nama penyanyi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#fffefb] border border-stone-300 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 shadow-inner"
            />
            {isSearching && (
              <RefreshCw className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-700 animate-spin" />
            )}
          </div>

          {/* Recommendations */}
          {!query && (
            <div>
              <p className="text-[11px] text-stone-500 mb-1.5 font-bold">Lagu Rekomendasi:</p>
              <div className="flex flex-wrap gap-1.5">
                {popularSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(`${item.trackName} ${item.artistName}`);
                      handleSearch(`${item.trackName} ${item.artistName}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-[11px] text-amber-950 font-bold border border-amber-300/80 transition-colors"
                  >
                    🎵 {item.trackName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results List */}
          {results.length > 0 && (
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 mt-2">
              {results.map((track) => (
                <div
                  key={track.trackId}
                  onClick={() => handleChooseTrack(track)}
                  className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 cursor-pointer transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={track.artworkUrl100}
                      alt={track.trackName}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{track.trackName}</h4>
                      <p className="text-[10px] text-stone-500 truncate font-medium">{track.artistName}</p>
                    </div>
                  </div>

                  {track.previewUrl && (
                    <button
                      type="button"
                      onClick={(e) => togglePlayPreview(track, e)}
                      className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                    >
                      {playingTrackId === track.trackId ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Selected Track View & Lyrics Picker */
        <div className="space-y-3.5 animate-fade-in">
          {/* Selected Song Banner */}
          <div className="flex items-center gap-3 p-3 bg-amber-100/90 border border-amber-300 rounded-xl shadow-xs">
            <img
              src={selectedTrack.artworkUrl600 || selectedTrack.artworkUrl100}
              alt={selectedTrack.trackName}
              className="w-12 h-12 rounded-lg object-cover shadow border border-amber-200"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                Lagu Rahasia Dipilih
              </span>
              <h4 className="text-xs sm:text-sm font-black text-stone-900 truncate">{selectedTrack.trackName}</h4>
              <p className="text-[11px] text-stone-600 font-medium truncate">{selectedTrack.artistName}</p>
            </div>

            {selectedTrack.previewUrl && (
              <button
                type="button"
                onClick={(e) => togglePlayPreview(selectedTrack, e)}
                className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shadow hover:scale-105 transition-transform"
              >
                {playingTrackId === selectedTrack.trackId ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-[1px]" />
                )}
              </button>
            )}
          </div>

          {/* Lyrics Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-amber-700" /> Pilih Lirik Favorit yang Mewakili Perasaanmu:
            </label>

            {isLoadingLyrics ? (
              <div className="p-3 text-center text-xs text-stone-500 flex items-center justify-center gap-2 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" /> Memuat lirik lagu...
              </div>
            ) : lyricsList.length > 0 ? (
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1 bg-white p-2 rounded-xl border border-stone-200">
                {lyricsList.map((line, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectLyricLine(line)}
                    className={`p-2 rounded-lg text-xs cursor-pointer transition-all flex items-start gap-2 ${
                      selectedLyricLine === line
                        ? 'bg-amber-200 text-amber-950 border border-amber-400 font-bold'
                        : 'text-stone-700 hover:bg-amber-50 hover:text-stone-900'
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                        selectedLyricLine === line ? 'text-amber-900 opacity-100' : 'opacity-0'
                      }`}
                    />
                    <span className="leading-snug">"{line}"</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-stone-500 italic">
                Lirik otomatis tidak tersedia. Tuliskan lirik pilihanmu secara manual di bawah.
              </p>
            )}

            {/* Custom Lyric input */}
            <div className="mt-1">
              <input
                type="text"
                placeholder="Atau tuliskan kutipan lirik sendiri..."
                value={customLyric}
                onChange={(e) => handleCustomLyricChange(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
