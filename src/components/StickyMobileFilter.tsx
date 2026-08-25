'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface StickyMobileFilterProps {
  categories: string[];
}

export function StickyMobileFilter({ categories }: StickyMobileFilterProps) {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Normalize categories list to include "All" at the front
  const allCategories = ['All', ...categories];

  // Helper to extract the active category slug from current pathname
  const getActiveSlug = () => {
    if (pathname === '/shop/all' || pathname === '/shop') return 'all';
    const match = pathname.match(/\/shop\/([a-z0-9-]+)/);
    return match ? match[1] : 'all';
  };

  const activeSlug = getActiveSlug();

  // Scroll active item into view on mount or change
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [pathname]);

  return (
    <div className="sticky top-16 z-30 md:hidden w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto px-4 no-scrollbar -mx-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allCategories.map((cat) => {
          const slug = cat.toLowerCase().replace(/\s+/g, '-');
          const href = `/shop/${slug}`;
          const isActive = activeSlug === slug;

          return (
            <Link
              key={cat}
              href={href}
              data-active={isActive}
              className={cn(
                "inline-flex items-center shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border",
                isActive
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              {cat === 'Outdoor Adventure' ? 'Outdoor & Adventure' : cat === 'Pet Tech' ? 'Pet Tech & Smart Pet Gear' : cat === 'Travel Tech' ? 'Travel & Digital Nomad Tech' : cat === 'Desk Toys Novelty Gifts' ? 'Desk Toys & Novelty Gifts' : cat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
