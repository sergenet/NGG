# Traffic: what is automated, what is not, and what to do weekly

## The honest part first

No script creates visitors. A site gets traffic from two things only:

1. **Pages that exist and are indexed**, ranking for something people search.
2. **Links and mentions elsewhere** that send people or pass authority.

Code can do the first part's plumbing — generate pages, submit them, keep them crawlable. It cannot do the second, and anything claiming otherwise (paid bot visits, auto-spun backlinks, "traffic bots") is either fraud against the ad networks or a fast way to get the domain devalued. Nothing like that is wired into this repo and nothing should be.

A new domain with no backlinks and no brand searches typically sees its first indexed pages in 2–8 weeks, its first long-tail organic clicks once those pages rank, and needs 3–6 months of consistent publishing to call the result "traffic". The work below shortens discovery; it does not shorten ranking.

## What now runs automatically

| Mechanism | What it does | Limit |
|---|---|---|
| `/sitemap.xml` (288 URLs) | Lists every page and its real `lastmod` | Google decides when to fetch it |
| **IndexNow** (`npm run indexnow`, also run by `deploy-zip.py`) | Pushes every sitemap URL to Bing, Yandex, Seznam and Naver within seconds of a deploy | **Google ignores IndexNow entirely** |
| `/rss.xml` (248 items) | A feed of products and guides with images, consumable by Pinterest and readers | Not a substitute for the sitemap |
| Internal links | Guides link to products, products link to categories, category pages link to shops | — |
| Product schema | `Product` + offer price so rich results are eligible | Eligibility is not ranking |
| Newsletter | A subscriber list is the only audience the site owns outright | Needs sends to matter |

The IndexNow key file lives at `public/6cabd90c47af379d82688b2af0b2209f.txt`. It must stay deployed, or submissions are rejected.

## What a person has to do

The fastest channels for gift content, in order of realistic return, are not search engines:

1. **Pinterest** — the site already publishes `/rss.xml` with product images. Pin 5 items a week from it, one board per gift category, each pin pointing at the product page. Gift searches on Pinterest convert far faster than on Google.
2. **Reddit and Facebook groups** — answer a real gift question, link the relevant guide only when it answers it. One useful comment beats ten dropped links.
3. **One newsletter a month** — the same five picks as the pins, to the list that already exists.
4. **One outreach email a week** — a gift-roundup or "best of" post that lacks a good camping/kitchen/desk pick. This is where backlinks come from, and backlinks are what make the rest rank.

## What to measure, and where

- **Search Console** → Pages: how many of the 288 are indexed, and the "Crawled – currently not indexed" count. That number is the verdict on content quality, not on this code.
- **GA4** → realtime and Acquisition: is anything arriving at all, and from where.
- **`traffic-data/weekly-kpis.csv`** → one row per week, then `npm run report:traffic` renders `weekly-report.md`. If the CSV stays empty, the control room has nothing true to show.

## Why the catalog is 240 and not 2,000

The catalog grew from 42 to 240 real products imported from the product feeds of merchants this site is approved with (Traverseon, DealGenius). Each imported record carries the merchant's own description, its real variants, price, image, and an Awin deep link that was followed to a live product page.

Three deliberate brakes:

- **Category quotas** (55 outdoor, 55 kitchen, 30 travel, 20 each for home office, decor, pet) so the site stays a gift catalog instead of a camping store.
- **Duplicate cluster caps** so six near-identical car heaters do not become six near-identical pages — the exact pattern Google already refuses to index on this domain.
- **No invented editorial.** Imported products get no `pros`/`cons`/`editorial` text. Those blocks are judgement about a product someone looked at.

That means the imports are real and purchasable, but they are catalog depth, not content. If Search Console shows imported pages landing in "Crawled – currently not indexed", the fix is editorial notes on the pages that get impressions — not more imports.

## Next levers, in order

1. Write editorial notes for the 20 imported products that accumulate the most impressions (Search Console → Pages, sorted by impressions).
2. Publish one guide per category that the imports made possible ("gifts for a car camper", "best kitchen scale under $50") and link it from the matching shop page.
3. Enable a real Pinterest posting routine from `/rss.xml`, tracked with UTM-tagged pins so GA4 attributes the sessions.
4. Only then consider paid: a $100 Pinterest or Reddit test is measurable; a $100 SEO retainer is not.
