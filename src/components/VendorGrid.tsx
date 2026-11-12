'use client';

import React from 'react';
import { VendorOffer } from '@/lib/schema';
import { ExternalLink, Tag } from 'lucide-react';
import { isActiveRetailerUrl, withAffiliateTracking } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';


interface VendorGridProps {
  vendors: VendorOffer[];
  productSlug?: string;
}

export function VendorGrid({ vendors, productSlug }: VendorGridProps) {
  const validVendors = vendors.filter((vendor) => {
    return isActiveRetailerUrl((vendor.url || '').trim());
  });

  // Sort vendors so primary is first, then by price
  const sortedVendors = [...validVendors].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.price - b.price;
  });

  if (sortedVendors.length === 0) {
    return null;
  }

  const getVendorLabel = (vendor: VendorOffer) => {
    const name = vendor.name.toLowerCase();
    if (vendor.isPrimary) return { text: "Best Overall", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" };
    if (name.includes('amazon')) return { text: "Best for Prime", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" };
    if (name.includes('best buy')) return { text: "Best for Pickup", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" };
    if (name.includes('walmart')) return { text: "Price Match", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" };
    if (name.includes('b&h') || name.includes('photo')) return { text: "No Tax outside NY/NJ", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
    if (name.includes('official') || name.includes('direct')) return { text: "Direct from Brand", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" };
    return null;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em]">Select Your Retailer</h3>
        <span className="text-[10px] text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Secure Link</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {sortedVendors.map((vendor, index) => {
          const label = getVendorLabel(vendor);
          
          return (
            <a
              key={index}
              href={withAffiliateTracking(vendor.url, `vendor-grid-${index + 1}`)}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              onClick={() => {
                trackEvent('affiliate_click', {
                  placement: `vendor-grid-${index + 1}`,
                  vendor: vendor.name,
                  product_slug: productSlug,
                  price: vendor.price,
                });

              }}
              className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                vendor.isPrimary 
                  ? 'bg-blue-50/30 border-blue-200 hover:border-blue-400 dark:bg-blue-900/10 dark:border-blue-500/30 dark:hover:bg-blue-900/20 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {vendor.name}
                </span>
                {label && (
                  <span className={`inline-flex w-fit px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${label.color}`}>
                    {label.text}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`block font-black text-sm leading-none ${vendor.isPrimary ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    Check current price
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">View Deal</span>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  vendor.isPrimary ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30'
                }`}>
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
      <div className="flex items-start text-xs text-slate-600 mt-2">
        <Tag className="w-3.5 h-3.5 mr-1.5 shrink-0 mt-0.5" />
        <p>Confirm the current price, availability, shipping, and return terms on the retailer’s site.</p>
      </div>
    </div>
  );
}
