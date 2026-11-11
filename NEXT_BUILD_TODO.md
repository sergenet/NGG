# Next Build Tasks & Enhancements

## Shipped (November 2026)
- [x] **Home Button** — a Home link sits in the page-bottom nav on every page (`src/components/PageBottomNav.tsx`), next to Back.
- [x] **Scroll-to-Top ("Up" Arrow) Button** — a floating arrow appears after 320px of scroll, respects `prefers-reduced-motion`, and hides once the bottom nav is on screen so it never covers the footer.

## Fixed in the November 2026 audit
- [x] **ESLint blocker** — `react-hooks/set-state-in-effect` in the admin launchpad failed `npm run check` (exit 1) while `next build` still passed, because Next 16 no longer runs ESLint during the build.
- [x] **Organization schema logo** — the JSON-LD pointed at `/assets/images/ngg-logo.png`, which did not exist (public/assets/images was empty).
- [x] **`.env.example`** — the GA key was declared twice (the trailing placeholder silently won), `NGG_FTP_PASS` was missing although `deploy-zip.py` requires it, and `.gitignore`'s `.env*` rule meant the template was never tracked.
- [x] **Analytics resilience** — `localStorage` reads in the first-party beacon and affiliate-click tracking could throw in hardened/private browsing and take the click with them.
- [x] **Newsletter signups** — the CSP did not allow `www.recaptcha.net`, so the EmailOctopus form showed "couldn't load reCAPTCHA" and no subscription could complete.
- [x] **Asset caching** — `/_next/static/*` carried no `Cache-Control`; the `mod_expires` block is inactive on the LiteSpeed host, so the header is now set explicitly and scoped to hashed assets only.
- [x] **Prefetch 404s** — links prefetched RSC page payloads the static export never emits; `SiteLink` now defaults `prefetch` off site-wide.

## Open
- [ ] **Confirm a real subscription end to end** — reCAPTCHA now loads, but a full EmailOctopus round trip with a test address has not been verified.
- [ ] **Retire the 4-digit PIN on `/admin/`** — a client-side hash of 10,000 possible values is not access control. Nothing sensitive sits behind it (the cards link to dashboards that require their own login), so this is cosmetic hardening, not a leak.
