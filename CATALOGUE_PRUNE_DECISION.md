# Should the catalogue be pruned?

> **This document records two decisions, and the second supersedes the first.**
>
> **12 November, morning — do not prune yet.** The catalogue was not the cause of the site's
> search problem, so removing pages would have changed no number. Reasoning below.
>
> **12 November, later — prune to the 42 hand-picked products.** AdSense refused the site for
> Low value content the same day, which makes the 194 imported pages a fault rather than merely
> inert. The first decision was right about search and incomplete about value. The reconciled
> decision is in **“Reconciled with the AdSense verdict”** at the end of this file; read that
> one for the current position, and this one for why it is not a reversal of evidence.

**First decision, 12 November 2026: not yet, and not for the reason it was proposed.**

Pruning was on the table because 236 product pages looked like a liability: near-duplicate
text, 100 of them written only yesterday, and an index that refused most of them. The
Search Console data says the diagnosis is inverted. Those pages are not dragging the site
down; they are the only part of it that nobody has ever found. The site does not have a
catalogue-quality problem. It has no demand at all.

## The evidence

Search Console, Page indexing report, last updated 9 November 2026:

| | |
|---|---|
| Indexed | **81** |
| Not indexed | **256** |
| Total URLs known to Google | 337 |

The 256 break down as:

| Reason | Pages |
|---|---|
| Crawled – currently not indexed | **114** |
| Page with redirect | 79 |
| Alternate page with proper canonical tag | 31 |
| Discovered – currently not indexed | 19 |
| Not found (404) | 9 |
| Blocked due to access forbidden (403) | 2 |
| Excluded by `noindex` | 1 |
| Duplicate, Google chose a different canonical | 1 |

Search performance, 11 August – 10 November 2026 (three months):

| | |
|---|---|
| Clicks | **0** |
| Impressions | 21 (summary tile) |
| Average CTR | 0% |
| Average position | 11.8 |
| Pages with any impression | 33 |

The summary tile and the pages table disagree — the table lists 33 pages with 10, 10, 7, 6, 6 …
impressions each, which sums to more than 21. I have not reconciled that; Google's own
reporting is the only source either way. What is not ambiguous is **zero clicks**, and that
the numbers are this small in every cut of the data.

## What those 33 pages actually are

That is the finding that changes the decision. Of the eleven *product* pages with any
impression in three months, **ten return 410 Gone**:

| URL | Status | Impressions |
|---|---|---|
| `/product/elgato-prompter/` | 410 | 3 |
| `/product/govee-ai-sync-box-2/` | 410 | 2 |
| `/product/wyze-bulb-color/` | 410 | 2 |
| `/product/irobot-roomba-combo-j7/` | 410 | 2 |
| `/product/thermopro-twin-tempspike-plus/` | 410 | 2 |
| `/product/samsung-t7-shield-1tb/` | 410 | 1 |
| `/product/smootherpro-bolt-action-brass-pen/` | 410 | 1 |
| `/product/sonos-era-100/` | 410 | 1 |
| `/product/ninja-professional-blender-bl610/` | 410 | 1 |
| `/product/philips-hue-bridge-starter-kit/` | 410 | 1 |
| `/product/nemo-grabo-v2-electric-vacuum-lifter/` | **200** | 1 |

Ten of eleven are pages that were deliberately delisted (§8 of the handoff). **Every one of
the 236 current products except `nemo-grabo-v2` has produced zero impressions in three
months.** The product pages did not lose traffic when the catalogue changed; they never had
any that Google attributed to a URL that still exists.

The non-product pages with impressions are the same story. The top five are `/about/` (10),
`/home-office/` (10, now a 301 to `/shop/home-office/`), `/audio/` (7), `/shop/pet-tech/` (6)
and `/kitchen/best-blenders/` (6, now a 301). One of them, `/audio/`, is a **stale section
that is not in the build**: `out/audio` does not exist, the live page still serves an old
"Premium Audio & Headphone Reviews 2026" title, and it is excluded from pruning because
`audio` sits in `PROTECTED` in `tools/prune-stale.py` alongside `control-room` and `api`.
It is a content section being treated as an application.

## Why pruning does not follow from this

The usual argument for pruning is that thin pages compete with good ones for crawl budget and
dilute a site's quality signals. That argument needs a site that has something to protect.
This one has 81 indexed pages, 0 clicks, and no page ranking for any query it targets.

- **Crawl budget is not binding.** 337 known URLs is a small site. Google crawled 114 of
  them and chose not to index them; that is a verdict on those pages, not a queue problem.
- **There is no traffic to lose.** Removing 100 products with zero impressions costs nothing
  measurable. That is an argument that pruning is *cheap*, not that it is *useful*: it would
  move the same zero.
- **The pages were rewritten yesterday.** Every one now carries two product-specific notes,
  no generated filler, and 632–923 words. Judging them on the index state of 9 November is
  judging the version that no longer exists. The honest test is the one already scheduled for
  19 November.

## What to do instead, in order

1. **Fix the leak before adding anything.** Ten of the eleven product URLs Google has ever
   shown are 410. A 410 tells Google to drop the URL permanently; a 301 to the closest live
   category or successor product preserves whatever signal those URLs earned. The delisted
   products will not come back, but `/product/elgato-prompter/` could point at the best live
   teleprompter-adjacent page instead of telling Google the topic is gone. The same applies
   to the 9 URLs in the 404 bucket.
2. ~~**Fix `/audio/`.**~~ **Done, 12 November.** A file that only survives on the server cannot
   be maintained, so it was not rebuilt: `/audio`, `/audio/` and `/audio/index.html` all 301 to
   `/shop/home-entertainment/`, which answers 200 and carries current inventory. The stale file
   is still on disk but no request reaches it; the redirect decides first. `audio` stays in
   `PROTECTED` in `tools/prune-stale.py` because that set is inert for a directory the prune
   does not walk — `SECTIONS` is what gets pruned — so the entry is harmless rather than
   load-bearing.
3. **Check the 403s and the `noindex`.** Two pages are blocked by access rules and one carries
   a noindex. Those are cheap to confirm and might be an accidental rule on a real page.
4. **Stop growing on merchant feeds.** The 194 imported products are the ones Google refused
   (crawled, not indexed). Expanding to "hundreds of products" by importing more feed rows
   would add more of exactly the pages Google has already declined.
5. **Then, and only then, prune.** The rule to use is not similarity, which is now solved
   (0 pairs ≥ 0.70). It is demand: a product page that still has zero impressions and no
   searchable model number after eight weeks of being indexed is a page nobody will ever
   arrive at, and it can go without argument.

## When pruning would become the right call

Prune if either of these shows up, because each changes the diagnosis:

- **A manual action or a thin-content pattern** in Search Console. Neither exists today
  (Security & Manual Actions is clean).
- **Impressions rising while clicks stay at zero.** That means pages are eligible and losing
  the click, which is a title-and-intent problem on specific pages, not a catalogue-size
  problem.
- **The 114 crawled-not-indexed count not moving** by 19 November while the rewritten pages
  remain unindexed. That would say Google has made a site-level judgement, and a smaller,
  deeper catalogue becomes the reasonable response.

## The trade-off being accepted

Keeping 236 products means keeping ~150 pages that add nothing to search demand and cost
nothing to crawl. The cost is not bandwidth or index bloat; it is **the illusion of a
complete site**, which has already produced two bad decisions in this project: importing the
feed to reach "hundreds of products", and reading a rising page count as progress after
Control Room showed no traffic.

Pruning now would feel like action and would change no number that matters. The measurable
work is the three items above: recover the 301s (done), resolve the stale section (done), and
write for queries people actually search.

## What would falsify this

If the 19 November re-check shows the rewritten product pages entering the index and
attracting impressions, this document is wrong about demand and the catalogue is the asset,
not the liability. That is the check to run before spending anything on pruning.

---

# Reconciled with the AdSense verdict (12 November 2026)

**Decision: prune — not to 236, and not by similarity. Cut the product pages to the 42 that
were chosen by hand, and consolidate the rest into category guides.**

The earlier conclusion above is superseded, and the reason is worth stating precisely
because it was not a mistake of evidence. It was a mistake of criteria.

## What changed

Not the traffic data. Every number in the first half of this document still holds: 0 clicks,
21 impressions, 81 indexed of 337, and no current product page earning an impression except
`nemo-grabo-v2`. The argument was **cost-based** — removing pages with no traffic costs
nothing, so pruning is cheap; but it also *earns* nothing, so there is no reason to bother.

That accounting was correct while search was the only judge. It stopped being correct when
AdSense refused the site on **12 November** for **Low value content**, a policy that judges
the site's aggregate value and explicitly requires it to "provide substantial unique value".
A second judge with authority over revenue now treats the status quo as a fault. Pruning
therefore has a benefit it did not have before, and the cost side is unchanged.

## The evidence that settles the shape

Provenance, not word count. Measured from `src/lib/data/products.json`:

| | |
|---|---|
| Product pages | 236 |
| Hand-picked, with `pros` / `cons` / `whoShouldBuy` recorded | **42** |
| Imported from merchant feeds | **194** |
| Whose `brand` field is the supplier, not a manufacturer | **207** |
| `brand` = Traverseon | 108 |
| `brand` = DealGenius | 96 |
| Products with a real manufacturer brand | **29** |

The two groups do not overlap at all: **all 29 real-brand products are inside the 42
hand-picked ones, and every one of the 194 imports has a supplier name in its brand field.**
There is no real-branded import to reconsider.

The 13 hand-picked products that still carry a supplier name (the three Poster Master prints,
the baitcasting reel, the milk frother, the food scale and seven others) are hand-picked
*despite* their branding, because their retailer and listing were verified individually. Their
brand field should be corrected to the actual maker — that is a data fix, and it is not a
reason to keep the other 194.

This is what a reviewer sees. A page for a butane torch lighter, a 12V car heater, a camping
hammock and an air mattress all filed under the brand "Traverseon" is not a brand — it is a
feed. The anonymity is visible on the page, in the byline position where a reader expects a
manufacturer, before anyone counts a word.

Substance, measured separately (`ADSENSE_READINESS.md` §Test 1): 34 words of merchant
description, 112 words of site-written notes, **~146 words of substance per page**, and 230
of 236 pages under 150 words of their own notes.

## The recommended shape

| | Now | After |
|---|---|---|
| Product pages | 236 | **42** |
| Non-product pages | 48 | **48 + 6–10 new guides** |
| Product share of the sitemap | 83% | **≈43%** |
| Pages with a hand-picked record and a purchasable link | 42 (18%) | **42 (100%)** |
| Pages with a real manufacturer brand | 29 (12%) | **29 (69% of products)** |

**Keep** the 42 hand-picked products. Each has a real retailer, a real brand, recorded pros
and cons, and two notes anchored to its own listing. Those are the pages that can survive a
reviewer asking "what is this worth".

**Consolidate** the 194 imports rather than delete them. Their product *types* have real
search demand — winter car heaters, camping hammocks, air mattresses, kitchen smallwares —
but as 194 individual 146-word pages they cannot serve it. Each category becomes one
substantive guide that compares the strongest handful and states plainly what the rest are:
products in a feed, not tested units.

| Category | Imports | Guide it becomes |
|---|---|---|
| Outdoor Adventure | 55 | camping and vehicle-camping kit |
| Kitchen | 52 | kitchen smallwares |
| Travel Tech | 28 | travel and in-car power |
| Pet Tech | 20 | pet travel and grooming |
| Home Office | 20 | desk accessories |
| Home Decor | 19 | small-space decor |

**Retire** the URLs with a 301 to the guide or category that covers the product type, using
the same pattern as the 76 redirects in §16 — a retired product points at the closest live
page rather than 410ing, so nothing indexed dies and nothing transfers a thin page's weight.

## Sequencing

1. **Traffic before pruning.** The 19 November re-read decides whether the rewritten hubs
   moved. Pruning into a site with no audience changes the value judgement without changing
   the demand one, and AdSense tests both.
2. **Then the six guides, then the 301s, then the deletions** — in that order, so no URL is
   ever retired before its destination exists. Deleting first would leave 194 redirects to
   pages that do not exist.
3. **Then reapply to AdSense**, not before. The decision rule is in `ADSENSE_READINESS.md`.

## Trade-offs accepted

- **Losing 194 URLs.** They have produced no clicks in three months and 161 sitemap URLs have
  never even been crawled. What is lost is the *appearance* of a large catalogue.
- **Outdoor Adventure stops being a product section.** 55 of its 64 products are imports, and
  only 9 were hand-picked (8 of those with a real brand). The category survives as a guide, not
  as a grid.
- **Kitchen shrinks from 58 to 6.** The largest hand-picked categories are Home Office and
  Outdoor at 9 each, so the curated catalogue is genuinely small. That is the point.
- **More work per page, fewer pages.** Six guides written properly is a larger task than 194
  pages of feed copy, and it cannot be automated from a feed — which is exactly why it counts
  as unique value.
- **This may still not earn approval.** Test 3 is user interest, and a curated site with no
  traffic fails it just as a thin one does. Pruning removes one of two failures, not both.

## What would change this recommendation

- The 19 November re-read showing a *current* product page — one of the 194 — gaining
  impressions. That would say some import types do earn search demand as individual pages,
  and they should be deepened rather than consolidated.
- AdSense approving the site on its current shape, which would leave the catalogue untouched
  and make the ratio argument irrelevant.
- Evidence that the six guides cannot be written from what the listings record. They can be:
  every claim would be anchored to a listed specification, and where the listing is silent the
  guide says so, as the notes already do.
