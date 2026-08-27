'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset loader when route finished changing
  useEffect(() => {
    setIsLoading(false);
    setProgress(100);
    const timer = setTimeout(() => {
      setProgress(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept click on anchor tags to trigger immediate smooth loader before next page loads
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      // If valid internal navigation link
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('#') &&
        target.target !== '_blank' &&
        href !== pathname
      ) {
        setIsLoading(true);
        setProgress(30);

        // Incremental progress feel
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              clearInterval(interval);
              return 85;
            }
            return prev + 15;
          });
        }, 150);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [pathname]);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-stone-800">
        <div
          className="h-full bg-amber-400 transition-all duration-300 ease-out shadow-[0_0_10px_#f59e0b]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Subtle Page Overlay Spinner when loading */}
      {isLoading && (
        <div className="fixed inset-0 z-[9998] bg-stone-950/60 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200">
          <div className="bg-[#fffefb] border-2 border-stone-800 p-5 rounded-md shadow-2xl flex items-center gap-3 text-stone-900 animate-fade-in">
            <div className="w-6 h-6 rounded-full border-3 border-amber-400 border-t-stone-900 animate-spin" />
            <span className="text-xs font-bold text-stone-900 tracking-wide">
              Memuat Halaman...
            </span>
          </div>
        </div>
      )}
    </>
  );
}
