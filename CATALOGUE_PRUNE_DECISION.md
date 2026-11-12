# Should the catalogue be pruned?

**Decision, 12 November 2026: not yet, and not for the reason it was proposed.**

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
2. **Fix `/audio/`.** Either rebuild it in `app/` so it is maintained and in the sitemap, or
   remove it and 301 it to `/shop/`. Leaving an unbuilt, unprotected-in-intent section serving
   200 with a 2026 title is the worst of both.
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
work is the three items above: recover the 301s, resolve the stale section, and write for
queries people actually search.

## What would falsify this

If the 19 November re-check shows the rewritten product pages entering the index and
attracting impressions, this document is wrong about demand and the catalogue is the asset,
not the liability. That is the check to run before spending anything on pruning.
