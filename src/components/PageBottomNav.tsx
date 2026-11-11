'use client';

import Link from '@/components/SiteLink';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, Home } from 'lucide-react';

/**
 * Bottom of every page: a Home button, a Back button, and a floating
 * back-to-top arrow.
 *
 * The arrow only exists once the reader has scrolled, so it never covers
 * content on a short page. On phones it sits above the sticky promo banner,
 * which is fixed to the bottom of the viewport for the first three seconds.
 */
export function PageBottomNav() {
  const [scrolled, setScrolled] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Once the bar itself is on screen the reader is already at the page end, so
  // the floating arrow has nothing left to do and would only cover the footer.
  useEffect(() => {
    const el = navRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setBarVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goBack = () => {
    // history.length is 1 for a fresh tab, where "back" would do nothing.
    if (window.history.length > 1) window.history.back();
    else window.location.assign('/');
  };

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Page navigation"
        className="border-t border-white/10 bg-[#18231d] text-white"
      >
        <div className="site-container flex flex-wrap items-center justify-center gap-3 py-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 text-sm font-bold text-white transition hover:border-[#ef8a73] hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 text-sm font-bold text-white transition hover:border-[#ef8a73] hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
        </div>
      </nav>

      {scrolled && !barVisible && (
        <button
          type="button"
          onClick={toTop}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-24 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#18231d] text-white shadow-lg shadow-black/20 transition hover:bg-[#bd4b34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd4b34] md:bottom-6"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </>
  );
}
