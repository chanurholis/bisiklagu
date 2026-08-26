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
    <div className="w-full max-w-xl mx-auto px-2 py-4">
      {/* Outer Paper Folder Shell - Sharp Rectangular Design, No Gradients */}
      <div className="bg-[#292524] p-3 sm:p-5 border-2 border-stone-700 shadow-xl rounded-md">
        
        {/* Main Inner Paper Sheet */}
        <div className="bg-[#faf7f2] border-2 border-stone-800 p-4 sm:p-7 text-stone-900 rounded-sm relative">
          
          {/* Header Navigation Bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-stone-800">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-7 h-7 bg-stone-900 text-stone-100 flex items-center justify-center font-black text-sm rounded-sm">
                B
              </span>
              <span className="font-handwriting text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                BisikLagu
              </span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-bold">
              <Link
                href="/u/demo"
                className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-900 border border-stone-800 rounded-sm transition-colors"
              >
                Coba Demo
              </Link>
              <Link
                href="/u/demo/inbox"
                className="px-2.5 py-1 bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-950 rounded-sm transition-colors"
              >
                Inbox
              </Link>
            </div>
          </div>

          {/* Page Title & Subtitle Section */}
          {(title || subtitle) && (
            <div className="mb-5 pb-3 border-b border-dashed border-stone-400">
              {title && (
                <h1 className="font-handwriting text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
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
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
