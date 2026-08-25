import React from 'react';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Shop Gifts & Gadgets by Brand',
  description: 'Browse top gifts and gadgets by your favorite brands.',
  alternates: {
    canonical: '/brands',
  },
};

export default function BrandsPage() {
  const products: Product[] = productsData as Product[];
  
  // Extract unique brands and count products
  const brandCounts = products.reduce((acc, product) => {
    if (product.brand) {
      acc[product.brand] = (acc[product.brand] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const brands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by product count
    .map(([name, count]) => ({ name, count }));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Shop by Brand
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Discover our curated selection of high-quality products from trusted manufacturers.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <Link 
              key={brand.name} 
              href={`/shop/all?brand=${encodeURIComponent(brand.name)}`}
              className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 text-center">
                {brand.name}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {brand.count} Product{brand.count !== 1 ? 's' : ''}
              </p>
              <ArrowRight className="w-4 h-4 mt-4 text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
