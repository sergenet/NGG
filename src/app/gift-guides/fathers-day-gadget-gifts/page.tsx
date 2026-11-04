import type { Metadata } from 'next';
import Link from 'next/link';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import ProductImageDisplay from '@/components/ProductImageDisplay';
import { Check, ArrowLeft, Award, Eye } from 'lucide-react';
import { formatPriceBracket } from '@/lib/utils';

export const metadata: Metadata = {
  title: "The Dark Workspace Setup Guide",
  description:
    "Curated picks for a minimalist, high-focus desk setup. Explore the best dark-themed workspace accessories and gifts.",
  alternates: {
    canonical: '/gift-guides/fathers-day-gadget-gifts',
  },
};

const darkOfficeSlugs: string[] = [
];

export default function FathersDayGadgetGiftsPage() {
  const products = productsData as Product[];
  const workspaceProducts = darkOfficeSlugs
    .map(slug => products.find(p => p.slug === slug))
    .filter((p): p is Product => !!p);

  const traverseonProduct = products.find(p => p.slug === 'traverseon-precision-micro-baitcasting-reel');
  const graboProduct = products.find(p => p.slug === 'grabo-pro-lifter-20-electric-vacuum-lifter');

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 font-sans relative">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[800px] right-1/4 w-[400px] h-[400px] bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb / Navigation Back */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </Link>
        </div>

        {/* Hero Section - Sleek Dark Aesthetic */}
        <section className="rounded-[2.5rem] bg-slate-900/60 border border-slate-800 p-8 md:p-12 shadow-2xl mb-12 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              ✨ Setup Curations
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              The Dark Workspace Setup Guide
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed font-medium">
              Curated gear for a clean, minimalist, high-focus desk setup. These graphite and matte-black accessories combine useful features with a cohesive look.
            </p>
          </div>
        </section>

        {/* Curated Products Section */}
        <div className="space-y-10">
          {workspaceProducts.length > 0 && (
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6 flex items-center gap-2">
              <Award className="w-7 h-7 text-indigo-500" />
              Essential Dark-Themed Upgrades
            </h2>
          )}

          {workspaceProducts.map((product, index) => {
            const primaryVendor = product.vendors.find(v => v.isPrimary) || product.vendors[0];
            const imageSrc = product.images[0] || '🎁';
            const displayCategory = product.tags.category;

            return (
              <div 
                key={product.slug}
                className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-slate-800 grid grid-cols-1 md:grid-cols-12 backdrop-blur-md"
              >
                {/* Product Image Section */}
                <div className="md:col-span-5 bg-slate-950 p-6 flex items-center justify-center relative min-h-[260px] md:min-h-auto">
                  <div className="relative w-full h-full min-h-[220px] max-h-[280px] flex items-center justify-center">
                    <ProductImageDisplay
                      src={imageSrc} 
                      alt={product.title}
                      fill
                      className="object-contain p-4 filter brightness-95 dark:brightness-100"
                      sizes="(max-width: 768px) 100vw, 35vw"
                    />
                  </div>
                  {index === 0 && (
                    <span className="absolute top-4 left-4 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      Top Recommendation
                    </span>
                  )}
                </div>

                {/* Product Details Section */}
                <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                        {displayCategory}
                      </span>
                      <div className="text-xs font-black text-amber-300">Curated workspace pick</div>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-3 hover:text-indigo-400 transition-colors">
                      <Link href={`/product/${product.slug}`}>{product.title}</Link>
                    </h3>

                    <p className="text-sm md:text-base text-slate-400 mb-5 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Pros List */}
                    {product.pros && product.pros.length > 0 && (
                      <div className="mb-6">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">Key Advantages:</span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {product.pros.slice(0, 4).map((pro, pIdx) => (
                            <li key={pIdx} className="flex items-start text-xs font-medium text-slate-400">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mr-1.5 mt-0.5" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Primary CTA Callout */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-slate-800/80 pt-6">
                    <div className="w-full sm:flex-1">
                      <PrimaryCTA 
                        href={primaryVendor.url} 
                        storeName={primaryVendor.name} 
                      />
                    </div>
                    <Link 
                      href={`/product/${product.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-indigo-400 py-2.5 transition-colors w-full sm:w-auto"
                    >
                      <Eye className="w-4 h-4" />
                      Buying notes
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Traverseon Outdoor Spotlight (Off-duty pick) */}
        {traverseonProduct && (
          <section className="mt-16 rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border border-slate-800 p-8 md:p-12 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider">
                  🎣 Off-Duty Weekend Pick
                </span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  Traverseon Precision Micro Baitcasting Reel
                </h2>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
                  An off-duty option for anglers: a compact micro-casting reel with carbon drag and brass gears. Confirm specifications and suitability with the manufacturer before purchasing.
                </p>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs md:text-sm font-semibold max-w-2xl leading-relaxed text-slate-300">Catalog pricing is a snapshot. Check the direct retailer for current promotions, shipping, and returns.</div>
              </div>
              
              <div className="lg:col-span-4 flex flex-col justify-center items-center bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <div className="relative w-40 h-40 bg-slate-950 rounded-2xl p-2 mb-4">
                  <ProductImageDisplay
                    src={traverseonProduct.images[0]} 
                    alt={traverseonProduct.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="w-full text-center">
                  <div className="mb-4">
                    <span className="text-xs text-indigo-300 block mb-1">Typical price band</span>
                    <span className="text-2xl font-black text-white">{formatPriceBracket(traverseonProduct.tags.priceBracket)}</span>
                  </div>
                  <PrimaryCTA 
                    href={traverseonProduct.vendors[0].url} 
                    storeName="Traverseon" 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* GRABO Heavy-Duty DIY & Homeowner Spotlight */}
        {graboProduct && (
          <section className="mt-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 p-8 md:p-12 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                  🛠️ Serious DIY & Homeowner Pick
                </span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  <Link href={`/product/${graboProduct.slug}`} className="hover:text-emerald-400 transition-colors">
                    {graboProduct.title}
                  </Link>
                </h2>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
                  {graboProduct.description}
                </p>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs md:text-sm font-semibold max-w-2xl leading-relaxed text-slate-300">
                  Features an automatic digital vacuum sensor and up to 375 lbs rated holding capacity across smooth, rough, and porous materials.
                </div>
              </div>
              
              <div className="lg:col-span-4 flex flex-col justify-center items-center bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <div className="relative w-40 h-40 bg-slate-950 rounded-2xl p-2 mb-4">
                  <ProductImageDisplay
                    src={graboProduct.images[0]} 
                    alt={graboProduct.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="w-full text-center">
                  <div className="mb-4">
                    <span className="text-xs text-emerald-300 block mb-1">Typical price band</span>
                    <span className="text-2xl font-black text-white">{formatPriceBracket(graboProduct.tags.priceBracket)}</span>
                  </div>
                  <PrimaryCTA 
                    href={graboProduct.vendors[0].url} 
                    storeName="GRABO Factory Shop" 
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer / Browse Categories */}
        <section className="mt-16 border-t border-slate-900 pt-10 text-center">
          <h3 className="text-lg font-bold text-slate-300 mb-6">
            Looking for something different? Explore other categories:
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link 
              href="/shop/home-office"
              className="px-5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-full text-sm font-bold text-slate-300 hover:border-indigo-400 hover:text-indigo-400 transition-all shadow-sm"
            >
              💼 Home Office Upgrades
            </Link>
            <Link 
              href="/shop/smart-home"
              className="px-5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-full text-sm font-bold text-slate-300 hover:border-indigo-400 hover:text-indigo-400 transition-all shadow-sm"
            >
              🏠 Smart Home Tech
            </Link>
            <Link 
              href="/shop/kitchen"
              className="px-5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-full text-sm font-bold text-slate-300 hover:border-indigo-400 hover:text-indigo-400 transition-all shadow-sm"
            >
              🍳 Kitchen Gadgets
            </Link>
            <Link 
              href="/shop/all"
              className="px-5 py-2.5 bg-slate-100 text-slate-950 rounded-full text-sm font-bold hover:bg-slate-200 transition-all shadow-sm"
            >
              🌐 Browse All Products
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
