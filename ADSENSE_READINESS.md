# AdSense: why the site was refused, and what would change it

**Status as read from AdSense → Sites on 12 November 2026:** `newgiftsandgadgets.com` —
*Needs attention*, reason **Low value content**, ads.txt *Authorized*, last updated
**12 Nov 2026, 09:29 PST**.

This is the policy text AdSense attaches to that reason, quoted in full because the
rejection email deliberately omits it:

> Maintaining a healthy and trusted ad ecosystem requires our partners to meet clear
> quality and operational standards. To qualify for ad serving, a site must provide
> **substantial unique value**, establish a **consistent presence on the web**, and show a
> level of **user interest** that supports a commercial advertising partnership.
>
> Before re-submitting your site, ensure that it:
> - Provides authentic, high-quality information, tools, or services.
> - Exhibits ongoing curation and structural maintenance.
> - Generates and sustains genuine user interest.

Three tests, not one. This document measures the site against each.

## What is already compliant

Worth stating first, because none of it is the problem and no time should go into it:

| Check | State |
|---|---|
| Site ownership | Verified |
| `ads.txt` | Served `200 text/plain`, `google.com, pub-0467059729557007, DIRECT, f08c47fec0942fa0`, reported **Authorized** |
| Ad code | `adsbygoogle.js` loader on every page, slots in the `<ins>` format |
| Policy pages | 7 live: privacy, terms, contact, about, affiliate disclosure, editorial policy, work with us |
| Privacy policy | 1,212 words, with an Advertising section naming Google, personalised-ad opt-out links, and consent-gated serving |
| Analytics consent | Google Analytics loads only after an explicit opt-in |
| Sitemap / robots | 284 URLs, valid, submitted |
| Accessibility of ads to crawlers | No `noindex`, no blocked ad endpoints |

A reviewer would find nothing mechanically wrong. That is precisely why the verdict reads
"low value" rather than a named technical policy.

## Test 1 — substantial unique value: **fails, and by more than the project's records say**

The catalogue has 236 product pages. Measured from `src/lib/data/products.json`:

| | |
|---|---|
| Mean merchant-feed product description | **34 words** |
| Mean per-product editorial notes (two notes) | **112 words** |
| Pages with under 150 words of their own notes | **230 of 236** |
| Mean total substance per page (merchant + notes) | **~146 words** |

So a typical product page is a heading, a 34-word paragraph lifted from a merchant feed,
about 112 words written for this site, a price-bracket line, and affiliate buttons. Across
236 pages.

The figure previously recorded in `SESSION_HANDOFF.md` — "mean content words 598" — is a
**whole-`<main>` count**. It includes the retailer grid, the "Keep comparing" side panel,
the cross-sell links and the shared page furniture, which are near-identical on every
product page. It is the right number for measuring *duplication*, which is what it was
built for, and the wrong number for measuring *substance*, which is what AdSense judges.
The 146 figure above is the one that applies here.

Scale compounds it: **236 of 284 sitemap URLs (83%) are product pages.** There are 48
non-product pages, and the deepest editorial sits in five `/home-office/` articles and two
gift-guide hubs. A reviewer sampling ten pages at random lands on a product page nine
times out of ten.

## Test 2 — consistent presence and curation: **partially met**

The site has a real structure — categories, gift guides, editorial policy, an about page
describing the research method — and a maintenance trail: 301 recovery for 76 delisted
slugs, retired guides removed rather than left to rot, and a control room tracking traffic.
That is curation. What it lacks is any visible cadence: no publication dates on most pages,
no author, no archive of new work over time. Nothing signals "this is maintained" to
someone evaluating it in five minutes.

## Test 3 — genuine user interest: **fails, and this is the decisive one**

From Search Console, 11 August – 10 November 2026:

| | |
|---|---|
| Clicks | **0** |
| Impressions | **21** |
| Indexed pages | **81 of 337 known** |
| Crawled, currently not indexed | **114** |

Three months, zero clicks. This is the criterion no amount of rewriting reaches. AdSense is
a commercial partnership; a site that Google's own search has not sent a single visitor to
does not present as one, and the policy text says so explicitly — "a level of user interest
that supports a commercial advertising partnership".

## Why requesting review now would fail again

The verdict is dated **this morning**. Google has already looked at the current site —
including the rewritten pages, the recovered 301s and the per-product notes — and returned
the same reason. Pressing `Request review` today submits the same site to the same test.

There is also an account-level pattern to weigh. Of five sites on this AdSense account,
**three are refused for Low value content** and one for a missing `ads.txt`. Only
`blueseasfishing.com` is Ready. Repeatedly re-submitting thin affiliate catalogues is how
an account accumulates a reputation, and an account-level judgement is far more expensive
to undo than a single site's.

## What would actually change the result

In the order that matters, not the order that is easiest:

1. **Traffic first.** Nothing below matters until the site has visitors. Search Console
   already says why it has none: 161 of 284 sitemap URLs have never been crawled, and the
   114 crawled-not-indexed pages are template-shaped. That work is documented in
   `SESSION_HANDOFF.md` §9 and `TRAFFIC_PLAN.md`. AdSense should be reconsidered *after*
   the 19 November re-read shows movement, not before.
2. **Change the ratio, not the copy.** 83% product pages is the structural signal. A site
   that is mostly affiliate listings reads as a shopfront; a site with twenty substantial
   guides and a smaller, well-chosen catalogue reads as a publication. This is where the
   pruning question in `CATALOGUE_PRUNE_DECISION.md` needs revisiting — that document
   decided *not* to prune on search-demand grounds, which remains correct, but it did not
   weigh AdSense's "substantial unique value" test, which points the other way.
3. **Deepen fewer pages.** 112 words per product is below any threshold a reviewer would
   call substantial. Deepening 30 pages properly beats adding notes to 236, and it is the
   only version of this work with a finish line.
4. **Show the cadence.** Dates on guides, a named author, an archive that grows. Cheap, and
   it addresses the one criterion that is close to being met.

## Decision rule

Request a review when **either** holds:

- Search Console shows clicks, not just impressions, over a trailing 28 days; or
- the non-product share of the sitemap is at least a third and the deepest 20 pages each
  carry more than 600 words of original writing.

Otherwise the outcome is already known, and each attempt spends the account's credibility.

## What this document does not claim

It does not predict approval. Tests 1 and 3 are human judgements made by Google on a
sample of pages, and a site can fail them while looking fine by every measurement in this
repository. What is measurable is stated above with its source; what is judgement is
labelled as such.
