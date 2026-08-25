'use client';

import React from 'react';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import { cn, isActiveRetailerUrl } from '@/lib/utils';
import { withAffiliateTracking } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';


interface PrimaryCTAProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  storeName?: string;
  productSlug?: string;
  className?: string;
}

export function PrimaryCTA({ href, storeName = 'Amazon', productSlug, className, ...props }: PrimaryCTAProps) {
  if (!isActiveRetailerUrl(href)) return null;
  const trackedHref = withAffiliateTracking(href, 'primary-cta');

  const handleClick = () => {
    trackEvent('affiliate_click', {
      placement: 'primary_cta',
      vendor: storeName,
      product_slug: productSlug,
      destination: trackedHref,
    });

  };

  return (
    <a
      href={trackedHref}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      onClick={handleClick}
      {...props}
      className={cn(
        "group flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5",
        className
      )}
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      <span className="flex-1 text-center">
        Check price on {storeName}
      </span>
      <ExternalLink className="w-5 h-5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
