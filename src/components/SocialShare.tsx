'use client';

import React from 'react';
import { Share2 } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  media?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ url, title, media }) => {
  const shareLinks = [
    {
      name: 'Pinterest',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.718-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.168 1.777 2.168 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.358-.631-2.75-1.378l-.748 2.853c-.271 1.034-1.002 2.324-1.492 3.121 1.125.347 2.314.535 3.548.535 6.62 0 11.988-5.367 11.988-11.987C24.005 5.367 18.639 0 12.017 0z"/>
        </svg>
      ),
      href: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media || '')}&description=${encodeURIComponent(title)}`,
      color: 'bg-[#E60023] hover:bg-[#ad001a]',
    },
    {
      name: 'X',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'bg-black hover:bg-slate-800',
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-[#1877F2] hover:bg-[#0d65d9]',
    }
  ];

  return (
    <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
        <Share2 className="w-5 h-5 text-blue-600" />
        <span>Share & Save</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl text-white transition-all transform hover:scale-105 ${link.color}`}
            title={`Share on ${link.name}`}
          >
            {link.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
