'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/lib/schema';
import { GiftFinder, FilterState } from '@/components/GiftFinder';
import { DealCard } from '@/components/DealCard';
import { trackEvent } from '@/lib/analytics';

type PriceBracket = { label: string; value: string };
type GiftFinderClientProps = { categories: string[]; priceBrackets: PriceBracket[]; initialCategory: string | null };

export function GiftFinderClient({ categories, priceBrackets, initialCategory }: GiftFinderClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({ category: initialCategory, priceBracket: null });

  const handleFilterChange = (next: FilterState) => {
    setFilters(next);
    trackEvent('gift_finder_filter', {
      category: next.category ?? 'all',
      price_bracket: next.priceBracket ?? 'all',
    });
    if (next.category !== initialCategory) router.push(next.category ? `/shop/${next.category.toLowerCase().replace(/\s+/g, '-')}/` : '/shop/all/');
    window.dispatchEvent(new CustomEvent<FilterState>('filterChange', { detail: next }));
  };

  return <GiftFinder categories={categories} priceBrackets={priceBrackets} currentFilters={filters} onFilterChange={handleFilterChange} className="sticky top-24" />;
}

export function ProductGrid({ initialProducts, allProducts, category }: { initialProducts: Product[]; allProducts: Product[]; category: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brand = searchParams.get('brand');
  const recipient = searchParams.get('recipient');
  const requestedPrice = searchParams.get('price');
  const [activeFilters, setActiveFilters] = useState<FilterState>({ category: category === 'all' ? null : initialProducts[0]?.tags.category ?? null, priceBracket: requestedPrice });

  useEffect(() => {
    const handleFilter = (event: Event) => setActiveFilters((event as CustomEvent<FilterState>).detail);
    window.addEventListener('filterChange', handleFilter);
    return () => window.removeEventListener('filterChange', handleFilter);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = activeFilters.category ? allProducts.filter((product) => product.tags.category === activeFilters.category) : initialProducts;
    if (brand) result = result.filter((product) => product.brand?.toLowerCase() === brand.toLowerCase());
    if (recipient) result = result.filter((product) => product.tags.recipient.some((value) => value.toLowerCase() === recipient.toLowerCase()));
    if (activeFilters.priceBracket) result = result.filter((product) => product.tags.priceBracket === activeFilters.priceBracket);
    return result;
  }, [activeFilters, allProducts, brand, initialProducts, recipient]);

  useEffect(() => {
    if (!brand && !recipient && !requestedPrice) return;
    trackEvent('catalog_filter_view', {
      category,
      brand: brand ?? 'all',
      recipient: recipient ?? 'all',
      price_bracket: requestedPrice ?? 'all',
      result_count: filteredProducts.length,
    });
  }, [brand, category, filteredProducts.length, recipient, requestedPrice]);

  const clearBrand = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('brand');
    router.push(`/shop/${category}/${params.size ? `?${params}` : ''}`);
  };

  return <div>
    {(brand || recipient) && <div className="mb-6 flex flex-wrap items-center gap-2"><span className="text-sm text-slate-500">Showing:</span>{brand && <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">{brand}<button onClick={clearBrand} aria-label={`Clear ${brand} filter`}>&times;</button></span>}{recipient && <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">For {recipient}</span>}</div>}
    {filteredProducts.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center"><h3 className="text-xl font-bold">No matching products</h3><p className="mt-2 text-slate-500">Try another category or price range.</p></div> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product) => <DealCard key={product.id} product={product} />)}</div>}
  </div>;
}
