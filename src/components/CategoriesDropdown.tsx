'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from '@/components/SiteLink';
import { categorySlug } from '@/lib/utils';

interface CategoriesDropdownProps {
  categories: string[];
}

export function CategoriesDropdown({ categories }: CategoriesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center py-2 focus:outline-none"
        aria-expanded={isOpen}
      >
        Categories
        <svg 
          className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div 
        className={`fixed left-4 right-4 top-[90px] md:absolute md:left-0 md:right-auto md:top-full md:w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg transition-all duration-200 z-50 overflow-hidden ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="py-1">
          <Link 
            href="/shop/new-arrivals/"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 text-sm font-bold text-amber-700 bg-amber-50/60 hover:bg-amber-100 hover:text-amber-800 transition-colors border-b border-stone-100 dark:border-slate-800"
          >
            <span className="flex items-center gap-1.5">
              <span>✨</span>
              <span>New Arrivals</span>
            </span>
            <span className="text-[10px] uppercase font-black tracking-wider bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded-full">New</span>
          </Link>
          {categories.map(cat => (
            <Link 
              key={cat} 
              href={`/shop/${categorySlug(cat)}/`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {cat === 'Outdoor Adventure' ? 'Outdoor & Adventure' : cat === 'Pet Tech' ? 'Pet Tech & Smart Pet Gear' : cat === 'Travel Tech' ? 'Travel & Digital Nomad Tech' : cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
