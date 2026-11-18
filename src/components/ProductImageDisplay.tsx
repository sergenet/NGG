'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';

type ProductImageDisplayProps = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  emojiFallback?: string;
};

function isEmojiSource(value: string) {
  return !value.startsWith('http') && !value.startsWith('/');
}

function isAmazonHostedImage(value: string) {
  try {
    return new URL(value).hostname.toLowerCase().endsWith('media-amazon.com');
  } catch {
    return false;
  }
}

function optimizeShopifyUrl(url: string, width = 640): string {
  try {
    if (url.includes('cdn.shopify.com')) {
      const parsed = new URL(url);
      if (parsed.hostname.toLowerCase().endsWith('cdn.shopify.com')) {
        parsed.searchParams.set('width', String(width));
        parsed.searchParams.set('format', 'webp');
        return parsed.toString();
      }
    }
  } catch {
    // fallback if not a full url
  }
  return url;
}

export default function ProductImageDisplay({
  src,
  alt,
  fill = false,
  className,
  sizes,
  priority = false,
  emojiFallback = '🎁',
}: ProductImageDisplayProps) {
  const [broken, setBroken] = useState(false);

  const isEmoji = useMemo(() => isEmojiSource(src) || isAmazonHostedImage(src), [src]);
  const displaySrc = useMemo(() => optimizeShopifyUrl(src, 640), [src]);

  if (isEmoji || broken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <span className="text-8xl drop-shadow-md">{isEmojiSource(src) ? src : emojiFallback}</span>
      </div>
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setBroken(true)}
    />
  );
}
