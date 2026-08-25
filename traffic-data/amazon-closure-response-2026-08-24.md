# Amazon Associates closure response — 2026-08-24

## Trigger

Amazon rejected and closed the Associates application associated with Store ID `sergenet05-20` because it did not produce three qualifying purchases within 180 days.

## Emergency changes completed

- Suspended 69 Amazon retailer offers in the source catalog.
- Removed the closed Store ID from the public catalog and generated site.
- Replaced 67 Amazon-hosted product images with the local neutral thumbnail.
- Added a defensive retailer-link guard that blocks Amazon destinations until deliberately re-enabled with a newly approved account.
- Changed product pages with no active retail partner to show a transparent “retailer links are being updated” notice.
- Corrected the affiliate disclosure to state that NewGiftsAndGadgets is not currently an Amazon Associate.
- Preserved ASIN-based product IDs, editorial copy, guide URLs, internal links, and recorded price brackets so future retailer mapping remains possible.

## Verification

- Catalog validator: 75 products and 75 unique routes; 69 Amazon offers suspended; closed Store ID absent.
- Production build: 131 static pages and 128 canonical sitemap URLs.
- Local export scan: zero files containing the closed Store ID, Amazon product links, or Amazon-hosted image URLs.
- Live sitemap crawl: 128 of 128 canonical URLs returned HTTP 200.
- Live crawl scan: zero pages containing the closed Store ID, Amazon product links, or Amazon-hosted image URLs.
- Live disclosure and paused-retailer notices verified.

## Reapplication rule

Do not restore Amazon links by editing the old tag. Reapply only when traffic and conversion evidence make three genuine qualifying purchases within a fresh 180-day window realistic. After a new Store ID is issued, rebuild retailer links from each product’s ASIN-based ID and complete a fresh compliance scan before deployment.
