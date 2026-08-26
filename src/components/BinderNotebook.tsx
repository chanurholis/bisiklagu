'use client';

import React from 'react';
import Link from 'next/link';

interface BinderNotebookProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function BinderNotebook({
  children,
  title,
  subtitle,
}: BinderNotebookProps) {
  return (
    <div className="w-full max-w-2xl mx-auto sm:px-4 sm:py-6">
      {/* Outer Shell: Full width on mobile, rounded card on desktop */}
      <div className="bg-[#292524] p-2 sm:p-5 border-0 sm:border-2 border-stone-700 shadow-2xl rounded-none sm:rounded-lg min-h-screen sm:min-h-0 flex flex-col justify-between">
        
        {/* Main Inner Paper Sheet */}
        <div className="paper-texture border-0 sm:border-2 border-stone-800 p-4 sm:p-7 text-stone-900 rounded-none sm:rounded-md relative flex-1 flex flex-col">
          
          {/* Header Navigation Bar */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 border-b-2 border-stone-800">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 bg-stone-900 text-stone-100 flex items-center justify-center font-black text-base rounded-sm shadow-sm">
                B
              </span>
              <span className="font-body text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                BisikLagu
              </span>
            </Link>

            <div className="flex items-center">
              <Link
                href="/create"
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs sm:text-sm font-bold rounded-sm transition-colors shadow-xs"
              >
                Buat Link
              </Link>
            </div>
          </div>

          {/* Page Title & Subtitle Section */}
          {(title || subtitle) && (
            <div className="mb-4 sm:mb-5 pb-3 border-b border-dashed border-stone-400">
              {title && (
                <h1 className="font-body text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
