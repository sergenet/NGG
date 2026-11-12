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

### 12 November 2026 re-read (after the 284-URL release)
- Header still reads **Indexed 81 / Not indexed 256** of 337 known pages, "last update 11/9/26" — but the exclusion lists already contain product URLs created in today's release, so the tables are fresher than the header date.
- Reconciled against the live sitemap by `node scripts/search-console-coverage.mjs`, which reads the committed snapshot in `data/search-console/2026-11-12/` (the sitemap as fetched that day plus the URL list behind each exclusion reason): Google knows **123 of the 284** sitemap URLs — **81 indexed, 42 known and refused**. The other **161 have never been crawled or discovered**; that is almost entirely the new imported stock.
- That script is the reproducible half of this section: re-capturing a snapshot after the 19 Nov re-read and pointing the script at it produces numbers that can be compared with these, which the dashboard totals alone cannot.
- The 42 refused sitemap URLs are the template-shaped pages, not products: **10 of 14 `/gifts/` hubs**, **5 of 14 `/shop/` categories**, **4 of 5 `/home-office/` articles**, both `/gift-guides/` pages, `/contact/`, `/kitchen/best-kitchen-gadgets-2026-updated/`, and **17 of 236** product pages (only 17 products are known at all).
- Every one of those verdicts predates today's rewrites: `/gifts/video-call-gifts/` was last crawled **27 Sep**, `/gifts/small-home-office/` **30 Sep**, both rewritten today. Google has judged the old copy, so these numbers cannot yet show whether the rewrite worked.
- Crawl budget is going to legacy URLs rather than new pages: 79 "Page with redirect" (no-slash variants), 31 "Alternate page with proper canonical tag" (29 of them `?brand=` filter URLs plus `/privacy/` and `/affiliate-disclosure/`), both self-canonicalising 200s today. `/shop/all/` no longer emits `?brand=` links, so those will drain on recrawl.
- The 404 bucket is already resolved on the server: those URLs answer **410** (removed products) or **301** (retired articles) now. The single `noindex` page is the old `/smart-home` without a slash.
- Not read in this pass: the two 403s and the one "Google chose a different canonical" URL.

### Indexing requested, 12 November 2026
Nine URLs queued through URL Inspection → **Request indexing** on the account `sergenet@yahoo.com`. Each one answered `check_circle | Indexing requested | URL was added to a priority crawl queue`, which is the only confirmation GSC gives — the button label does not change consistently afterwards, so the dialog is the evidence, not the button.

| URL | Was in GSC as | Result |
| --- | --- | --- |
| `/gifts/video-call-gifts/` | Crawled – not indexed (27 Sep) | requested; button became "Request again" |
| `/gifts/small-home-office/` | Crawled – not indexed (30 Sep) | confirmed |
| `/gift-guides/` | Crawled – not indexed (21 Aug) | confirmed |
| `/contact/` | Crawled – not indexed (13 Jul) | confirmed |
| `/shop/kitchen/` | Crawled – not indexed (24 Sep) | confirmed (submitted twice; the first live test outlasted the check) |
| `/shop/home-office/` | Crawled – not indexed (23 Sep) | confirmed |
| `/shop/travel-tech/` | Crawled – not indexed (24 Sep) | confirmed |
| `/shop/home-decor/` | Discovered – not indexed | confirmed |
| `/shop/novelty-tech/` | Discovered – not indexed | confirmed |

Why exactly these: a request is only worth spending on a page whose content changed, and these nine are the pages rewritten since Google's last crawl of them. The other eight excluded `/gifts/` hubs (`coworkers`, `remote-workers`, `new-homeowners`, `ergonomic-desk-worker-gifts`, `home-cooks-under-50`, `home-cooks-by-cooking-style`, `small-kitchen-gifts`, `travelers`) were **not** rewritten, so no request was filed for them — spending the queue on unchanged copy would prove nothing. `travelers` has never been crawled at all; it will surface on its own once the sitemap is re-read.

The remaining 17 refused product pages, the four `/home-office/` articles and `/kitchen/best-kitchen-gadgets-2026-updated/` were not requested: the articles predate the current template and nothing has changed on them.

Each request also runs a live test first, which is why the dialog takes 10–40 s. GSC has a daily request quota; no refusal appeared during this batch of nine, so the ceiling was not hit.

## 8. Catalogue integrity (12 November 2026)
- The catalogue is **42 products**, all with a purchasable retailer link. `scripts/validate-catalog.mjs` now fails a build that contains a product without one.
- Nine products were removed because no storefront could be verified: HUANUO and ErGear monitor mounts (HUANUO no longer sells mounts; ergear.com redirects to HUANUO), the UGREEN MagSafe stand, the Nexbie pet portrait (not a Nexbie product), Dima Eyewear blue-light glasses, the Aerolatte frother (official page has no purchase path), the two Amazon-only items (Associates account closed), and a generic levitating lamp.
- Seven vendor rows were replaced with the brand's own store, each loaded in a browser and confirmed to show the product with a price and a working cart: Vari, VIVO, Ergotron, Herman Miller, NOMATIC, Fullstar, BKWAT.
- The BKWAT Awin link was dead in a way that no HTTP check caught: it resolved to `awin1.com/closedMerchant.html`, meaning merchant 77730 is closed. Any future dead-affiliate sweep should assert the final URL is not on awin1.com.
- Ergotron's product page sits behind a Cloudflare challenge that blocks automated verification; it was confirmed as a real page, but the link has never been loaded end to end by a script.
- Removed products return **410 Gone** (the `.htaccess` rule handles missing product dirs), not 404.

## 9. Follow-up due around 19 November 2026
Re-read Search Console and compare against this baseline: **81 indexed of 284 sitemap URLs** on 12 Nov, with 123 URLs known to Google and 161 never crawled. Worth checking:
1. Whether the never-crawled count (161) has started to fall, and whether "Discovered – currently not indexed" grows rather than shrinks — the latter means Google is queuing 236 product pages faster than it crawls them.
2. Whether the rewritten `/gifts/` hubs, the five `/shop/` categories, `/gift-guides/` and `/contact/` moved out of "Crawled – currently not indexed" **after** their recrawl (compare the Last crawled column against 12 Nov; earlier verdicts describe pre-rewrite copy).
3. Whether the 42 refused sitemap URLs fall. If the count stays flat while the new product pages also go unindexed, the lever is editorial on the hubs, not more imports.
4. How many of the 236 product pages are indexed; 17 were known and refused on 12 Nov and the remaining 219 had not been crawled at all.
5. Whether the nine URLs in the 12 Nov indexing-request table moved out of "Crawled/Discovered – currently not indexed", or at least show a Last crawled date after 12 Nov. A fresh crawl with the same verdict is the signal that the rewrite itself is the problem, not the crawl schedule.

## 10. Content depth and link integrity (12 November 2026)
- `/gifts/small-home-office/` and `/gifts/video-call-gifts/` were down to a single card each after the delistings, and the small-office page still said "Six upgrades to compare". Both list three verified products now and the heading counts the cards.
- All **42** product pages carry two per-product editorial notes; 17 had them before. Nothing added asserts a spec that is not already recorded on the product.
- Measured across the export: product pages mean **833 words** (min 714, max 895), mean pairwise 5-word-shingle similarity **0.30**, worst pair **0.55**. The unique-share percentage in §6 was computed with a different extraction, so it is not comparable to a run of `scripts/measure-content-depth.mjs`.
- Re-measured on **12 Nov after the import**, over 236 product pages: mean **739 words** (min 653, max 926), mean pair similarity **0.41**, worst pair **0.89** (`farpoint-rechargeable-led-work-glasses-handy-light-modes` vs `farpoint-rechargeable-wireless-ceiling-light-400-lumens`), unique share **2%**. The 42 hand-written pages measured 0.30/0.55; the imported stock drags the pair average up, and 0.89 means two Farpoint listings are effectively one page with different names. The unique-share figure is not comparable across catalogue sizes — more pages means more words are shared with something — so treat mean and worst-pair similarity as the signals.
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

## 13. Near-duplicate product pages (12 November 2026)
- Measured first, then fixed. The template was synthesising content: three generic "pros" ("Published features address the intended use", "Available specifications support comparison", "Can be compared with alternatives before purchase") and three generic "cons" appeared on every imported product, plus a filler "Best fit" ("Shoppers who want a dependable X upgrade") and "Main tradeoff" ("It is worth weighing convenience, price, and long-term value"). That is fabricated analysis printed identically on 194 pages, and it was the largest single block of shared text.
- The generated blocks were **removed, not reworded**. "Research snapshot", "Best fit" and "Main tradeoff" now render only from recorded data (`pros`, `cons`, `whoShouldBuy`), so 41 hand-picked products keep theirs and imported products without notes no longer pretend to have any.
- **19 products in the 14 worst pairs got real notes**, two each: the two Farpoint listings, the four car heaters/defrosters, the flashlight gloves, three tailgate tent/canopy variants, the two Christmas light sets, the car fridge, the two double seats, the cooler box, the car mattress, the camper fridge, the spotting scope and the tactical vest. Every note is anchored to a figure or a claim already in the listing, and where the listing gives nothing — runtime, IP rating, packed weight, bar pressure, load rating — the note says so rather than inventing one.
- Before/after on the same metric (`node scripts/measure-content-depth.mjs`):
  - whole page: mean pair similarity **0.41 → 0.38**, worst pair **0.89 → 0.86**, mean words **739 → 663**
  - main content: mean **0.27**, worst pair **0.83**, mean words **507**
  - pairs at or above 0.84 on main content: **14 → 0**
- The script now reports both views. The whole-page number is inflated by identical nav, footer and cross-sell blocks, which is why the main-content view is the one to watch: it is what a reader compares. Neither replaces the other — the whole-page figure is what a crawler sees.
- Still unresolved by design: 18 pairs remain at or above 0.80 on content, all template phrasing around a short merchant description. Beating that needs per-product notes on the remaining imported pages, or fewer, deeper pages — not another template edit.

### Second tranche of notes (12 November 2026)
- Threshold for this pass: every product appearing in a pair at or above **0.78** (content-area similarity) got two notes. That was **30 products**, taking the catalogue to **91 of 236** with notes.
- Covered: the cordless polisher, the side/rear awning, the 1000D vest, the camo hunting pack, the LED collar/leash, the 900D harness, the 120W charger, the foam SUV mattress, the $474 tailgate tent, the poop scoop, the paw cleaner, the hood and trunk light strips, the dog wheelchair, the soft crate, the telescopic hose, the rolling pet carrier, the car barrier, the star projector, the solar motion light, the battery case, the desk organiser, the spider prop, the headlamp, the 2000W stove, the seat levelling pad, the snack cups, the smart scale, the 16-in-1 chopper and the play sink.
- After: **no pair at or above 0.78 remains**. Worst content pair is **0.78** (`34-oz-side-opening-salad-mason-jar-for-meal-prep` vs `sharp-pebble-gladius-leather-strop-sharpener-double-sided`, both still un-noted — two unrelated kitchen products at the same price), worst whole-page pair **0.82**, means **0.37** whole page / **0.26** content, mean content words **522**.
- The tail is honest arithmetic, not a surprise: **45 products without notes still sit in 42 pairs at or above 0.75**. Clearing the whole catalogue this way is roughly three more tranches of this size. The alternative recorded in §13 still stands — prune the catalogue to the pages that can carry real copy rather than note all 145 remaining.
- Notes stay anchored to what the listing says. Where a listing is thin (the DealGenius items quote no app, battery, dimensions or material), the note names the missing specification instead of filling it in.
- **Deployed 12 November 2026** from commit `2e8e954`: 2,613 files extracted, live smoke check **48/48**, zero stale pages pruned, IndexNow 284 URLs in three HTTP 200 batches. Verified beyond the smoke check on the live host: the polisher, star projector and play sink render their new notes and each leads with a different argument; a 40-page slug-sorted sample returned **0 status failures and 0 occurrences of the eight generated-filler strings**; `/product/100-ft-tropical-tablecloth-roll-disposable-and-waterproof/` renders **no** Research snapshot and no synthesised pros, which is the intended shape for an un-noted page; `vivo-dual-monitor-desk-mount` still shows its real Best fit and pro/con list, so the removal did not over-reach; sitemap still **284 URLs**.
- The catalogue figures in this section are from the local export of the same build that was uploaded; the live sweep above sampled 40 pages, not all 236.

### Third tranche of notes (12 November 2026)
- Threshold again stated before writing: every un-noted product appearing in a pair at or above **0.75** content-area similarity. That was **45 products** (42 pairs), taking the catalogue to **136 of 236** with notes.
- The pair list was recomputed twice because two quick scripts disagreed (45 vs 53 implicated); the discrepancy was in the throwaway scripts, not the site. The figure above comes from one clean pass over `out/product` with no rounding before the threshold comparison. Worth doing rather than trusting the first number: 8 extra products would have been rewritten for no measured reason.
- Covered: the salad mason jar and leather strop (the named worst pair), the camping hammock, tactical vest, cooler table, 48 qt and 19 qt fridge/freezers, pool lounger, 6100 BTU AC, camping toilet and water container, both car heaters, the folding BBQ, survival shovel, bubble maker, loom set, the water bottles (DRANQ and HidrateSpark), the scale duo, monitor shelf, cable box, mic holder, under-bed bins, four storage/organiser sets, and the kitchen smallwares (drawer dividers, fermenter lids, grain and freezer containers, squeeze bottles, both Tovla Jr kits, the grill basket, spoon rest, salt and pepper set, oil and vinegar dispensers, SmartChef utensils, Wolfgang Puck blender, wine sign).
- After: **no pair at or above 0.75 remains anywhere in the catalogue**. Whole page mean **0.37 → 0.34**, worst **0.82 → 0.80**; main content mean **0.26 → 0.24**, worst **0.78 → 0.75**; mean content words **522 → 549**.
- New worst pair is `4-piece-stainless-steel-measuring-cups-set` vs `6-piece-silicone-cooking-utensils-set-with-natural-wood-handles` at **0.745**, both still un-noted — the next two pages worth writing if this continues.
- **100 products still have no notes**, and all of them sit below 0.75 against every other page. 257 pairs remain in the 0.70–0.75 band, so the next threshold down (0.70) is the whole remaining catalogue, not a tranche. That is the decision point recorded in §13: notes for 100 more pages, or fewer and deeper pages.
