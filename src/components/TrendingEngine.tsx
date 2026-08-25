'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/schema';
import { formatPriceBracket } from '@/lib/utils';

interface TrendingEngineProps {
  products: Product[];
}

export function TrendingEngine({ products }: TrendingEngineProps) {
  // Sort or filter products to get "trending" ones
  // For now, we'll take the top 3
  const trending = products.slice(0, 3);

  return (
    <section className="py-20 bg-slate-900 text-white rounded-[3rem] my-20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-sm mb-4">
              <TrendingUp className="w-5 h-5" />
              <span>Featured this week</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic">Trending This Week</h2>
          </div>
          <Link href="/shop/all" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold group">
            <span>View all gadgets</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trending.map((product, idx) => {
            const imageSrc = product.images[0] || '/images/placeholder.webp';
            const isEmoji = !imageSrc.startsWith('http') && !imageSrc.startsWith('/');

            return (
              <Link 
                key={product.id} 
                href={`/product/${product.slug}`}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-500"
              >
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-black italic shadow-lg z-20 group-hover:scale-110 transition-transform">
                  #{idx + 1}
                </div>

                <div className="relative aspect-square mb-6 rounded-2xl bg-white overflow-hidden p-4">
                  {isEmoji ? (
                    <div className="w-full h-full flex items-center justify-center text-8xl drop-shadow-lg">
                      {imageSrc}
                    </div>
                  ) : (
                    <Image 
                      src={imageSrc} 
                      alt={product.title}
                      fill
                      className="object-contain p-2 group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-1">{product.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-black text-lg">{formatPriceBracket(product.tags.priceBracket)}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Details</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
