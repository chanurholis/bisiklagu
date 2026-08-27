import React from 'react';

export default function UserPageLoading() {
  return (
    <div className="min-h-screen bg-[#1c1917] flex flex-col items-center justify-center p-4">
      <div className="bg-[#fffefb] border-2 border-stone-800 p-8 rounded-sm shadow-2xl text-stone-900 flex flex-col items-center space-y-4 max-w-sm w-full text-center">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-amber-300 border-t-stone-900 animate-spin" />
          <span className="absolute text-lg">📜</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-base text-stone-900">
            Memuat Profil & Lagu...
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            Mengambil pesan rahasia & lirik lagu
          </p>
        </div>
      </div>
    </div>
  );
}
