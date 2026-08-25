'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/schema';
import { PrimaryCTA } from './ui/PrimaryCTA';
import { VendorGrid } from './VendorGrid';
import ProductImageDisplay from './ProductImageDisplay';
import { ArrowRight } from 'lucide-react';
import { formatPriceBracket, isActiveRetailerUrl, pickBestPriceVendor, pickPrimaryVendor, withAffiliateTracking } from '@/lib/utils';

interface DealCardProps {
  product: Product;
  showVendorGrid?: boolean;
}

export function DealCard({ product }: DealCardProps) {
  const bestVendor = pickBestPriceVendor(product.vendors);
  const primaryVendor = pickPrimaryVendor(product.vendors) || bestVendor;

  return (
    <div className="flex flex-col bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden group h-full">
      {/* Image Area */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square w-full bg-slate-100 dark:bg-slate-900 overflow-hidden block border-b border-slate-100 dark:border-slate-800">
        {(() => {
          const imageSrc = product.images?.[0] || '🎁';

          return (
            <ProductImageDisplay
              src={imageSrc}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          );
        })()}
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-slate-800 dark:text-slate-200">
          {product.tags.category}
        </div>
      </Link>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-5 lg:p-6">
        <div className="flex-1">
          {product.brand && (
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 block">
              {product.brand}
            </span>
          )}
          <Link href={`/product/${product.slug}`} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-3 line-clamp-2">
              {product.title}
            </h2>
          </Link>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
            {product.description}
          </p>
        </div>

        {/* Action Area */}
        <div className="mt-auto space-y-4">
          {(() => {
            const validVendors = product.vendors.filter((v) => {
              const url = (v.url || '').trim();
              return isActiveRetailerUrl(url);
            });

            if (validVendors.length <= 1) {
              return (
                <div className="space-y-4">
                  {/* Price Header */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">Typical price band</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatPriceBracket(product.tags.priceBracket)}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {primaryVendor ? 'Verify at retailer' : 'Retailer links updating'}
                    </span>
                  </div>

                  {/* Dual CTA Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {primaryVendor && (
                      <PrimaryCTA 
                        href={withAffiliateTracking(primaryVendor.url, 'deal-card-direct-cta')} 
                        storeName={primaryVendor.name}
                        productSlug={product.slug}
                        className="py-3 px-3 text-sm font-black rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-600 dark:to-orange-600 dark:hover:from-amber-700 dark:hover:to-orange-700 border-none shadow-[0_4px_14px_0_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.18)]"
                      />
                    )}
                    <Link
                      href={`/product/${product.slug}`}
                      className="flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 font-bold py-3 px-3 rounded-xl transition-all duration-200 text-sm"
                    >
                      Buying notes <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <VendorGrid vendors={product.vendors} productSlug={product.slug} />
                <div className="pt-2">
                  {primaryVendor && (
                    <PrimaryCTA 
                      href={withAffiliateTracking(primaryVendor.url, 'deal-card-primary-cta')} 
                      storeName={primaryVendor.name}
                      productSlug={product.slug}
                    />
                  )}
                  <Link
                    href={`/product/${product.slug}`}
                    className="mt-3 flex items-center justify-center w-full py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Read buying notes <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
