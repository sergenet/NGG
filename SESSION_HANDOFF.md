# Session Handoff & Project Context: New Gifts & Gadgets

**Date:** October 19, 2026  
**Source Conversation ID:** `2c88490d-b4af-4cf9-9b5d-59c5c2d37a94`  
**Site URL:** https://newgiftsandgadgets.com  
**Project Path:** `C:\newgiftsandgadgets.com` (junction to `C:\Projects\NewGiftsAndGadgets-Website\newgiftsandgadgets.com`)

**Build & deploy:** `npm run build` (validation + static export + sitemap/RSS), then `python deploy-zip.py`, which zips `out/`, uploads one bundle, unpacks it server-side with a temporary PHP script, prunes pages the build no longer produces, and finishes with the live smoke check.

**Pre-commit gate:** enable once per clone with `git config core.hooksPath .githooks`. The hook runs `npm run check` on every commit, and when the change touches the export (`src/`, `public/`, `next.config.ts`, `package.json`, `scripts/`) it also builds and runs `npm run smoke:local` — 30+ checks against the built site, so a lost page or broken canonical is caught before it reaches a deploy.

---

## 1. Recent Approvals & Affiliate Monetization
- **Awin Affiliate Network:**
  - **Publisher ID:** `2913559`
  - **Merchant Approval:** **DealGenius** (Approved Oct 19, 2026)
  - **Dashboard:** https://ui.awin.com/awin/affiliate/2913559/merchant-directory/index/tab/active/page/1#
  - **Focus Categories:** Home & Kitchen gadgets, clever electronics, clearance bargains, viral problem-solvers, pet supplies, gift sets.
  - **Usage Strategy:** Generate Awin product tracking links for DealGenius flash sales and integrate into product review articles, deal roundups, and social media post links.

---

## 2. Social Media Assets & Zeely Ads
Stored in dedicated directory: `C:\newgiftsandgadgets\Assets\zeely-ads` (and backed up in `C:\YouTube Videos`):
1. **Video Reel 1:** `newgiftsandgadgets-viral-picks-reel.mp4` (8.70 MB)
   - *Hook:* "Stop wasting hours doing everyday tasks the hard way when these smart tools exist."
   - *Focus:* Curated problem-solving home & kitchen gadgets that save time.
2. **Creative Image 1:** `newgiftsandgadgets-ottovac-creative.png` (5.70 MB)
   - *Focus:* OTTOVAC automatic electric vacuum suction lifter tile & glass grip tool.

---

## 3. Social Publishing Schedule & Multi-Platform Copy
The automated 4-day alternating schedule is configured in `C:\YouTube Videos\social_publishing_schedule.json`:
- **Round 1 (Today / Day 1):** Image Post (`newgiftsandgadgets-ottovac-creative.png`)
- **Round 2 (Day 5 - Oct 23):** Video Reel 1 (`newgiftsandgadgets-viral-picks-reel.mp4`)
- **Round 3 (Day 9 - Oct 27):** Image / Feature Post
- **Round 4 (Day 13 - Oct 31):** Video / Second Feature

### Pre-formatted Platform Copy:
- **YouTube Shorts:**
  - *Title:* OTTOVAC Electric Vacuum Suction Lifter | New Gifts & Gadgets #Shorts
  - *Tags:* #gadgets #coolgadgets #smarttools #amazonfinds #lifehacks #newgiftsandgadgets
- **Instagram:**
  - Full caption, emojis, call-to-action to link in bio, and 15 targeted hashtags.
- **TikTok:**
  - Short punchy hook with #fyp and trending tech tags.
- **Pinterest:**
  - Board: "Cool Gadgets & Gift Ideas", pin title, link to https://newgiftsandgadgets.com.
- **Facebook:**
  - High-engagement text with link preview.

*Tool to view & 1-click copy captions:* `C:\YouTube Videos\open_social_dashboard.bat` (or HTML: `C:\YouTube Videos\social_publisher_dashboard.html`).

---

## 4. Immediate Priorities
1. Log in to Awin to generate DealGenius tracking links for popular gadget deals.
2. Publish Round 1 image post across social channels using the dashboard copy.
3. Feature DealGenius clearance and gadget picks in the site's article queue or deal banners.

---

## 5. Next Build Queue
See `NEXT_BUILD_TODO.md` for the current list. The two navigation controls previously queued here shipped in November 2026: the Home button lives in the page-bottom nav, and the floating scroll-to-top arrow appears after 320px of scroll.

---

## 6. Shipped in the November 2026 audit
- Admin launchpad effect no longer trips `react-hooks/set-state-in-effect`, so `npm run check` passes again.
- Organization schema logo added at `public/assets/images/ngg-logo.png` (the referenced file had never existed).
- `.env.example` repaired (single GA key, `NGG_FTP_PASS` documented) and re-tracked in git.
- Consent-gated tracking survives browsers where `localStorage` throws; `sendBeacon` failures no longer break a click.
- CSP now allows `www.recaptcha.net`, which unblocks the newsletter form's reCAPTCHA.
- Hashed `/_next/static/*` assets return a one-year immutable `Cache-Control`.
- Links no longer prefetch the RSC payloads the static export cannot serve.
- Newsletter consent box is marked required, so an unticked Subscribe button explains itself instead of doing nothing.
- `npm run check:newsletter` drives real Chrome over the live form: 10 checks that a submit is blocked without consent and allowed with it. `--submit` completes a genuine signup and creates a pending subscriber.
- The five excluded `/shop/` categories, the gift-guides hub and the contact page now carry their own depth: 539–591, 548 and 372 words against 285–305, 156 and 39 before.
- Product pages render each product's recorded shortlist notes and its own retailer price spread. Unique share moved 43% → 50% and pair similarity 0.40 → 0.34 (max 0.82 → 0.72) on the same measure, so the template is better but still carries most of the wording.

---

## 7. Search Console state (11 November 2026)
- `/sitemap.xml` resubmitted; last read 11 Nov with **99** discovered pages (was 155 on 1 Nov, before the catalogue prune).
- `/rss.xml` and `/sitemap.rss` removed from the sitemaps list; only the XML sitemap is submitted now.
- Agent can read the property through the signed-in browser session (Chrome tab), not through an API integration — no service account is configured.
- Of the 99 sitemap URLs, 55 were indexed at the 6 Nov snapshot. The 44 excluded all answer 200 with self-canonicals and no noindex: 39 product pages, plus `/shop/kitchen/`, `/shop/home-office/`, `/shop/travel-tech/`, `/shop/home-decor/`, `/shop/novelty-tech/`, `/gift-guides/`, `/gift-guides/fathers-day-gadget-gifts/`, `/contact/`.
- Root cause is template duplication, not thin copy: median 450 words on excluded pages against 440 on indexed ones, but only ~35% of the wording on a `/shop/` page and ~43% on a product page is unique to it. Rewriting the template is the lever; rewriting single pages is not.
- Buckets naming retired URLs (`/product/govee-ai-sync-box-2/` now 410, the Roomba comparison now 301) are stale and will clear as Google recrawls.

## 8. Catalogue integrity (12 November 2026)
- The catalogue is **42 products**, all with a purchasable retailer link. `scripts/validate-catalog.mjs` now fails a build that contains a product without one.
- Nine products were removed because no storefront could be verified: HUANUO and ErGear monitor mounts (HUANUO no longer sells mounts; ergear.com redirects to HUANUO), the UGREEN MagSafe stand, the Nexbie pet portrait (not a Nexbie product), Dima Eyewear blue-light glasses, the Aerolatte frother (official page has no purchase path), the two Amazon-only items (Associates account closed), and a generic levitating lamp.
- Seven vendor rows were replaced with the brand's own store, each loaded in a browser and confirmed to show the product with a price and a working cart: Vari, VIVO, Ergotron, Herman Miller, NOMATIC, Fullstar, BKWAT.
- The BKWAT Awin link was dead in a way that no HTTP check caught: it resolved to `awin1.com/closedMerchant.html`, meaning merchant 77730 is closed. Any future dead-affiliate sweep should assert the final URL is not on awin1.com.
- Ergotron's product page sits behind a Cloudflare challenge that blocks automated verification; it was confirmed as a real page, but the link has never been loaded end to end by a script.
- Removed products return **410 Gone** (the `.htaccess` rule handles missing product dirs), not 404.

## 9. Follow-up due around 19 November 2026
Re-read Search Console and compare against this baseline: 55 of 99 sitemap URLs indexed at the 6 Nov snapshot; sitemap resubmitted 12 Nov carrying **90** URLs after the prune. Worth checking:
1. Whether `/sitemap.xml` reports 90 discovered pages (if it still says 99, the submission did not trigger a re-read).
2. Whether the five rewritten `/shop/` categories, `/gift-guides/` and `/contact/` moved out of "Crawled – currently not indexed".
3. Whether the nine removed product URLs drop out of the 404/410 buckets.
4. The count of indexed product pages against the 42 that now carry editorial notes (all of them, as of 12 Nov).

## 10. Content depth and link integrity (12 November 2026)
- `/gifts/small-home-office/` and `/gifts/video-call-gifts/` were down to a single card each after the delistings, and the small-office page still said "Six upgrades to compare". Both list three verified products now and the heading counts the cards.
- All **42** product pages carry two per-product editorial notes; 17 had them before. Nothing added asserts a spec that is not already recorded on the product.
- Measured across the export: product pages mean **833 words** (min 714, max 895), mean pairwise 5-word-shingle similarity **0.30**, worst pair **0.55**. The unique-share percentage in §6 was computed with a different extraction, so it is not comparable to a number produced by `tmp/measure.mjs`.
- `npm run check:links` (`scripts/check-affiliate-links.mjs`) follows every redirect in the catalogue and fails on a closed-merchant landing, a 404/410, an unreachable host, or a chain that never leaves `awin1.com`. It had to exist in this shape because the closed BKWAT merchant answered **200**.
- First full run against the live catalogue: **13 ok, 0 dead, 29 unverified**. The 29 are Shopify storefronts answering 429 to scripted requests even after two retries with backoff; a 429 hides the product page but not the Awin redirect, so closed merchants are still caught. Verified failure mode: the old merchant 77730 URL fails with "landed on a closed-merchant page" and exit 1.
- The check is **not** in `npm run check` or the pre-commit hook: it needs the network and takes minutes across every storefront. Run it before a release or after editing vendor rows.

## 11. Catalog expansion (12 November 2026)
- The catalogue went from **42 to 240 products** using `npm run import:catalog` (`scripts/import-merchant-catalog.mjs`), which reads the public product feed of merchants already approved on Awin and writes records with the merchant's own description, real variants, price, image, and an Awin deep link.
- Sources: Traverseon (404 feed products, merchant 124816) and DealGenius (1,000, merchant 122504). Poster Master (121870) was **not** imported: only 2 of its 250 products carry a description, so the rest would be image-and-title pages. Tribesigns and SKILHUNT block scripted access entirely.
- Deliberate brakes: category quotas (55 Outdoor, 55 Kitchen, 30 Travel, 20 each Home Office / Decor / Pet), a near-duplicate cap (Jaccard > 0.55 against earlier imports), and no invented editorial — imported products have no `editorial`, `pros` or `cons`.
- Net: Outdoor 64, Kitchen 61, Travel 31, Home Office 29, Pet 21, Home Decor 21, plus the hand-picked remainder. Sitemap 90 → **288 URLs**; `/rss.xml` 248 items.
- Three imported links were followed in a real browser and landed on the exact product page with a visible price through `source=aw`: the spotting scope, the DealGenius milk blender, and the dog car barrier.

## 12. Discovery system (12 November 2026)
- `npm run indexnow` pushes every sitemap URL to IndexNow engines; `deploy-zip.py` runs it automatically after a passing smoke check. **Google ignores IndexNow**, so this changes nothing there.
- Key file: `public/6cabd90c47af379d82688b2af0b2209f.txt`. If it stops being deployed, submissions are rejected.
- `TRAFFIC_PLAN.md` records the honest position: no code creates visitors, what the automation does and does not cover, the weekly human routine, and the decision rule for imported pages that fail to index (editorial on pages with impressions, not more imports).
