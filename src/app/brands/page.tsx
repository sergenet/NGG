import React from 'react';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import Link from '@/components/SiteLink';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Shop Gifts & Gadgets by Brand | Curated Brand Directory',
  description: 'Browse curated gifts, smart gadgets, and lifestyle equipment from trusted, verified brand partners.',
  alternates: {
    canonical: '/brands',
  },
};

export default function BrandsPage() {
  const products: Product[] = productsData as Product[];
  
  // Aggregate brand data with counts and unique categories
  const brandMap = products.reduce((acc, product) => {
    if (product.brand) {
      if (!acc[product.brand]) {
        acc[product.brand] = {
          count: 0,
          categories: new Set<string>(),
          priceBrackets: new Set<string>(),
        };
      }
      acc[product.brand].count += 1;
      if (product.tags?.category) {
        acc[product.brand].categories.add(product.tags.category);
      }
      if (product.tags?.priceBracket) {
        acc[product.brand].priceBrackets.add(product.tags.priceBracket);
      }
    }
    return acc;
  }, {} as Record<string, { count: number; categories: Set<string>; priceBrackets: Set<string> }>);

  const brands = Object.entries(brandMap)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, data]) => ({
      name,
      count: data.count,
      categories: Array.from(data.categories),
    }));

  // Featured partner brands with verified direct partnerships
  const featuredBrandNames = [
    'PersonalHour',
    'Tornado',
    'Plunge Chill',
    'Billion Dollar Beauty',
    'GRABO',
    'SKILHUNT',
    'Vari',
    'Ergotron',
  ];

  const featuredBrands = brands.filter((b) => featuredBrandNames.includes(b.name));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-4 border border-indigo-200/60 dark:border-indigo-800/60">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Verified Brand Directory
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
            Curated Brands You Can Trust
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Every product in our catalog comes from researched, verified manufacturers. Explore direct collections by brand across home office, health &amp; wellness, smart tech, and unique lifestyle gifts.
          </p>
        </div>

        {/* Featured Partner Brands Section */}
        {featuredBrands.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">Direct Partner Showcase</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Featured Brand Partners</h2>
              </div>
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">Direct manufacturer affiliate tracking</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredBrands.map((brand) => (
                <Link 
                  key={brand.name} 
                  href={`/shop/all?brand=${encodeURIComponent(brand.name)}`}
                  className="group relative flex flex-col justify-between p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" /> Verified Partner
                    </span>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                      {brand.count} item{brand.count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                      {brand.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {brand.categories.slice(0, 2).map((cat) => (
                        <span key={cat} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400 pt-3 border-t border-slate-100 dark:border-slate-800/80 group-hover:translate-x-0.5 transition-transform">
                    <span>Browse collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Complete Brands Directory */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Comprehensive Directory</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">All {brands.length} Curated Brands</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {brands.map((brand) => (
              <Link 
                key={brand.name} 
                href={`/shop/all?brand=${encodeURIComponent(brand.name)}`}
                className="group flex flex-col justify-between p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                    {brand.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {brand.categories.slice(0, 1).map((cat) => (
                      <span key={cat} className="text-[10px] text-slate-500 font-medium truncate max-w-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="font-bold">{brand.count} product{brand.count !== 1 ? 's' : ''}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
