import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1c1917] text-[#faf7f2]">
      <div className="bg-[#fffefb] border-2 border-stone-800 p-8 rounded-md shadow-2xl text-stone-900 flex flex-col items-center space-y-4 max-w-xs w-full text-center">
        {/* Animated Music Vinyl / Spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-amber-300 border-t-stone-900 animate-spin" />
          <span className="absolute text-xl">🎵</span>
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-base text-stone-900 tracking-tight">
            Memuat Halaman...
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            BisikLagu sedang menyiapkan konten
          </p>
        </div>
      </div>
    </div>
  );
}
