# Measurement checkpoint — 2026-08-23

## Verified baseline

| Source | Metric | Value | Interpretation |
|---|---:|---:|---|
| Google Search Console | Search impressions | 217 | Early visibility baseline; not enough volume to infer a stable trend. |
| Google Search Console | Search clicks | 2 | Search CTR is 0.92%; individual query/page detail should guide title and content changes after more data accrues. |
| Google Search Console | Indexed pages | 79 | Captured before the new cluster pages were submitted and recrawled. It is not a target for indexing every historical URL. |
| Amazon Associates | Clicks | 604 over the prior 30 days | Amazon-reported clicks are not equivalent to GA4 `affiliate_click` events and may span traffic before corrected analytics. |
| Amazon Associates | Ordered items | 0 | The core conversion problem remains unresolved; more clicks alone are not success. |
| Amazon Associates | Earnings | $0.00 | Baseline revenue. |
| Pinterest | Impressions | 1 | Too little activity for a channel judgment. |
| Email | Subscribers | 1 | Baseline list size. |

## Not yet trustworthy

- GA4 sessions, engaged sessions, affiliate-click events, and checklist-download events do not yet have a trustworthy post-fix reporting window.
- The site now uses measurement ID `G-52BQHQ8HL1`, loads analytics only after consent, and emits `affiliate_click` and `file_download` events. Event receipt inside GA4 still needs verification after consented live visits appear.
- Same-day zeroes must not be interpreted as evidence that the repaired measurement is failing. Use a complete seven-day window.

## Content shipped before this checkpoint

- Search Console validation requests started for historical 404, 403, noindex, duplicate-canonical, and Google-selected-canonical categories.
- Three priority home-office guides were strengthened.
- Remote-worker cluster expanded with video-call, ergonomic, no-subscription, under-$50, and small-office guides.
- Home-cook cluster expanded with under-$50, small-kitchen, and cooking-style guides.
- Current sitemap contains 128 canonical URLs.

## Next reporting window

At the next weekly checkpoint, record:

1. GA4 sessions, engaged sessions, `affiliate_click`, and `file_download` events.
2. Search Console impressions, clicks, top queries, top landing pages, and indexed-page movement.
3. Amazon clicks, ordered items, conversion rate, and earnings for the matching date range.
4. Pinterest impressions, saves, and outbound clicks.
5. Subscriber additions and unsubscribes.

Do not compare a 30-day Amazon click total directly with a seven-day GA4 event count. Normalize all sources to the same dates before calculating conversion rates.
