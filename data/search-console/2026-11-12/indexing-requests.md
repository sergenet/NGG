# Re-indexing requests submitted in Search Console

Captured by hand from the property UI while signed in as the property owner.
Google exposes no API for "Request indexing" (the Indexing API accepts only
JobPosting and BroadcastEvent), and no API for reading the request history, so
this file is the only reliable record of what was actually submitted.

Property: https://newgiftsandgadgets.com/
Session:   2026-11-12, ~18:10 GTBST (16:10 UTC)

## Why these URLs

Commit `b2b694a` turned the removed product URLs from 410/404 into 301s. The
eleven product pages that earned any impression between 11 Aug and 10 Nov were
checked against the live host on 12 Nov; ten of them now redirect:

| # | Old URL (impressions) | Today | 301 target | Target |
|---|-----------------------|-------|------------|--------|
| 1 | /product/govee-ai-sync-box-2 (2) | 301 | /smart-home/top-smart-home-tech-2026/ | 200 |
| 2 | /product/elgato-prompter (3) | 301 | /gifts/video-call-gifts/ | 200 |
| 3 | /product/wyze-bulb-color (2) | 301 | /smart-home/top-smart-home-tech-2026/ | 200 |
| 4 | /product/irobot-roomba-combo-j7 (2) | 301 | /shop/smart-home/ | 200 |
| 5 | /product/thermopro-twin-tempspike-plus (2) | 301 | /kitchen/best-kitchen-gadgets-2026-updated/ | 200 |
| 6 | /product/samsung-t7-shield-1tb (1) | 301 | /home-office/essential-desk-upgrades/ | 200 |
| 7 | /product/smootherpro-bolt-action-brass-pen (1) | 301 | /shop/desk-toys-novelty-gifts/ | 200 |
| 8 | /product/sonos-era-100 (1) | 301 | /shop/home-entertainment/ | 200 |
| 9 | /product/ninja-professional-blender-bl610 (1) | 301 | /shop/kitchen/ | 200 |
| 10 | /product/philips-hue-bridge-starter-kit (1) | 301 | /smart-home/top-smart-home-tech-2026/ | 200 |

`/product/nemo-grabo-v2-electric-vacuum-lifter/` is the eleventh and is still in
the catalogue; it answers 200 and needed no request.

The old URLs are not in the sitemap (they are no longer pages), so Google can
only learn about the 301 by recrawling a URL it already knows. Requesting
indexing on the old URL is what puts that recrawl in the priority queue, which
is why these were submitted rather than the targets.

## What was submitted

| # | URL | Result |
|---|-----|--------|
| 1 | /product/govee-ai-sync-box-2/ | **Indexing requested** — "URL was added to a priority crawl queue." |
| 2 | /product/elgato-prompter/ | **Quota Exceeded** — request refused, nothing queued |
| 3 | /product/wyze-bulb-color/ | Not attempted — quota already exhausted |
| 4 | /product/irobot-roomba-combo-j7/ | Not attempted — quota already exhausted |
| 5 | /product/thermopro-twin-tempspike-plus/ | Not attempted — quota already exhausted |
| 6 | /product/samsung-t7-shield-1tb/ | Not attempted — quota already exhausted |
| 7 | /product/smootherpro-bolt-action-brass-pen/ | Not attempted — quota already exhausted |
| 8 | /product/sonos-era-100/ | Not attempted — quota already exhausted |
| 9 | /product/ninja-professional-blender-bl610/ | Not attempted — quota already exhausted |
| 10 | /product/philips-hue-bridge-starter-kit/ | Not attempted — quota already exhausted |

One request landed. Search Console caps URL-inspection requests per property
per day (roughly ten), and the allowance was already used up when the second URL
was submitted: the button on #1 read "Request indexing / Request again", so that
URL had been submitted on an earlier occasion, and the very next submission was
refused outright. Whether the earlier spend happened today or the cap is simply
smaller cannot be read from the UI, and Google keeps no visible log of past
requests, so what any earlier submissions covered is unknown. Only #1 is
confirmed.

The quota resets daily (midnight Pacific). The remaining nine are still valid
candidates and should be submitted on the next run, since a 410 that Google has
not recrawled cannot transfer its signals to the 301 target.

## What was observed about the old URLs

URL Inspection for `/product/govee-ai-sync-box-2/` after the redirect deployed:

- Reported "Page is not indexed: Not found (404)"
- **Last crawl: 10 November 2026, 09:16** — two days before the redirect went
  live, so Google's picture of these URLs is still the pre-fix state
- "Sitemaps: No referring sitemaps detected" — expected, they left the sitemap
- `Crawl allowed? Yes`, `Crawled as Googlebot smartphone`

`/product/elgato-prompter/` was reported differently: "Crawled - currently not
indexed", last crawl 27 September. Both were still fetchable, which is what
makes the priority-crawl request worth spending on them.

Google accepted the request on a URL that now redirects, rather than refusing it
because it is not indexable. The live test ran for about 60 seconds before
returning a verdict, so a batch of ten takes roughly ten minutes plus the wait
for each panel to load.

## Not done, and why

- The eight distinct 301 targets were not submitted. They are indexable and
  live, and a request on them would prompt a recrawl of the target, but the
  stale URLs are what need the recrawl: a target that has been recrawled but
  whose old URL has not still collects nothing from it. If quota allows after
  the nine above, the pages absorbing the most redirects are worth a request
  too: `/shop/smart-home/` (13 old URLs),
  `/smart-home/top-smart-home-tech-2026/` (10), and
  `/home-office/essential-desk-upgrades/` and `/shop/kitchen/` (9 each).
- The sitemap was not resubmitted. Google re-reads a submitted sitemap on its
  own schedule and all 284 URLs in it are unchanged by this work; the redirects
  live in `.htaccess`, which no sitemap describes.

## Resuming tomorrow

`pending-indexing-queue.txt` in this directory holds the nine URLs still to
submit, one per line, in the order they appear in the table above. The queue is
plain text on purpose: the submission itself has to go through the Search
Console UI, so no script can drive it, but the list should not have to be
rebuilt by hand.

Quota resets at midnight Pacific, which is 08:00 UTC. Until then every attempt
returns the same Quota Exceeded dialog, so there is nothing to be gained by
retrying earlier in the day.

Procedure per URL, as performed here:

1. Search Console → the search box at the top (`Inspect any URL in …`) → paste
   the URL → Enter.
2. Wait for the URL Inspection panel to show `Page indexing`.
3. Click `REQUEST INDEXING`. It runs a live test for about 60 seconds.
4. Record the verdict in the table above, then delete the line from the queue.

Two things to watch on the next run:

- The panel keeps the previous URL's results in the DOM, so more than one
  `REQUEST INDEXING` button can be present. The last one is the current URL.
- If the first URL in the queue is refused, stop: the rest will be too, and the
  queue is unchanged.

## Second attempt, same day, ~20:15 UTC

Quota turned out not to be spent: the first submission of the evening was
accepted. It was exhausted again immediately afterwards, so the allowance is
far smaller than ten per day.

| # | URL | Result |
|---|-----|--------|
| 2 | /product/elgato-prompter/ | **Indexing requested** — "URL was added to a priority crawl queue." |
| 3 | /product/wyze-bulb-color/ | **Quota Exceeded** — refused |
| 4-10 | the rest | Not attempted — the queue rule says stop at the first refusal |

So two requests have now landed across the two runs (#1 and #2), and eight are
still queued in `pending-indexing-queue.txt`.

Two operational findings worth carrying forward:

- **The button needs a real click.** Driving it with a scripted `element.click()`
  produced an `Oops! Something went wrong — we had a problem submitting your
  indexing request` dialog, and that attempt appears to have consumed quota
  without queueing anything. The page also carries a reCAPTCHA iframe, which is
  the likely reason. Use the real pointer path.
- **Quota is spent per submission, not per URL inspected.** Inspecting is free;
  only `REQUEST INDEXING` counts. One acceptance followed by one refusal is the
  whole allowance here.

What the inspection panels showed on this run:

- `/product/elgato-prompter/` — **Crawled – currently not indexed**, last crawl
  **27 Sep 2026**, user-declared canonical itself, Google-selected canonical
  empty. Unchanged from the 12 Nov morning read, so Google has not recrawled it
  since the 301 went live.
- `/product/wyze-bulb-color/` — **Page is indexed**, reported as "URL is on
  Google, but has issues" with one invalid Product snippet. Indexed under its
  old identity; the 301 is still unseen.

## For the run after this one

Eight old URLs remain. Once they are submitted, the three targets that absorb
the most redirects are worth a request each — `/shop/smart-home/` (13 old URLs),
`/smart-home/top-smart-home-tech-2026/` (10) and
`/home-office/essential-desk-upgrades/` (9) — because all three were rewritten
on 12, 13 November and Google has judged none of them on their current copy.
At one accepted request per day, that is a multi-day queue, so spend it in this
order: the eight old URLs first, then those three targets.
