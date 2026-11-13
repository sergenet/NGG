# $100 paid launch: Plunge Chill landing page

Everything here is set up and live except the ad spend itself, which needs the
advertiser's own account and payment method.

- **Landing page:** https://newgiftsandgadgets.com/cold-plunge/
- **Product:** Plunge Chill 1HP Cold Plunge Chiller + Tub (Plus), **$1,359**
- **Merchant:** Plunge Chill (Awin 122418), publisher 2913559
- **Commission:** 10% = **$135.90** per sale, plus the **$10** first-sale bonus
  offered for November–December, so the first sale is worth **$145.90**

## Why this page and not the other 235 products

A paid click has to be paid for out of the commission. At a 10% rate:

| Catalogue band | Typical order | Commission | Break-even CPC at 1% |
|---|---|---|---|
| Under $50 | $30 | $3 | **$0.03** |
| $50–100 | $75 | $7.50 | **$0.08** |
| $100–250 | $150 | $15 | **$0.15** |
| **This product** | **$1,359** | **$135.90** | **$1.36** |

Only the top band survives a real click price. This is the highest-priced item
in the catalogue, so it is the one place a $100 test can return more than it
costs.

## What $100 actually buys — read this before spending it

At $0.80–$1.20 a click, $100 is **85–125 clicks**. That is enough to answer
*"will anyone click through to the merchant?"* It is **not** enough to measure a
conversion rate: establishing a 1% rate needs roughly 300–500 clicks before the
result stops being noise.

So the honest goal is a **click-through test**, with the conversion as upside.
Treat it as tuition for one number — merchant click-through rate — not as a
customer-acquisition campaign. Anyone who tells you $100 proves ROI on a $1,359
product is guessing.

## Campaign settings

| Setting | Value | Why |
|---|---|---|
| Network | Google Search only | Search partners and Display off: Display can burn a small budget in a day on junk placements |
| Budget | $14/day for 7 days | Spreads the test across a week of search behaviour instead of one afternoon |
| Bidding | Manual CPC, max **$1.00** | Above $1.36 you need >1% conversion just to break even |
| Location | United States | Merchant ships US, USD pricing, site is US-focused |
| Devices | All, no bid adjustment | Learn before optimising |
| Ad groups | One | $100 does not support segmentation |
| Landing page | `/cold-plunge/` only | One page, one offer, one measurable path |

### Keywords (exact and phrase only)

`cold plunge chiller and tub` · `1hp cold plunge chiller` ·
`cold plunge tub with chiller for home` · `cold plunge chiller for ice bath` ·
`home cold plunge with chiller` · `cold plunge setup for home`

Long-tail and specific on purpose: head terms like "cold plunge" are bid up by
brands with far more budget.

**Do not bid on "Plunge Chill" or any misspelling or variant.** Many Awin
programmes prohibit brand-term bidding, and this one's rules should be checked in
the Awin interface before launch. All the keywords above are generic.

### Negative keywords (add at launch)

`free` · `diy` · `cheap` · `rental` · `used` · `how to build` · `chest freezer` ·
`meaning` · `benefits` · `study` · `reddit` · `lawsuit` · `review` · `youtube` ·
`near me`

Those are research and DIY intents. They will spend the budget without buying.

## Measurement

Three layers, and only one of them decides anything.

1. **Awin `clickref` — the truth.** Each CTA on the page already carries its own
   reference, so a sale is attributed to the exact button that produced it:

   | Placement | clickref |
   |---|---|
   | Hero | `lp1-hero` |
   | Mid-page (Trustpilot block) | `lp1-midpage` |
   | Closing CTA | `lp1-footer` |

   Read it in Awin → Reports → Transactions, grouped by click reference. A sale
   with no clickref means the customer arrived some other way.

2. **Merchant click-through rate — the number this test is for.** The site
   records `page_view` and `retailer_click` events (consent-gated, same-origin).
   `retailer_click ÷ page_view` on `/cold-plunge/` is the page's real job. Below
   10% the page is not persuading; above 25% it is doing its job and the price
   point is the obstacle.

3. **GA4 — secondary.** Consent-gated, so it undercounts. Useful for the traffic
   source split, not for conversion.

### Campaign tagging

```
https://newgiftsandgadgets.com/cold-plunge/?utm_source=google&utm_medium=cpc&utm_campaign=cp-launch-nov26&utm_content={creative}
```

Use the same URL for every ad; the creative token separates them.

## Decision rule — write the answer down before you look

After 7 days or $100, whichever comes first, stop and pick one:

| Outcome | Reading | Action |
|---|---|---|
| **≥1 sale** | Commission $135+ against ≤$100 spend | Profitable on one sale. Raise the daily budget gradually; do not triple it |
| Clicks reach Awin, **0 sales**, merchant CTR ≥ 25% | Page works, price point does not convert cold traffic | **Stop.** Do not top up. The next lever is an email capture, not more spend |
| Clicks reach Awin, **0 sales**, merchant CTR < 10% | The page is not persuading, or the traffic is wrong | **Stop.** Compare search terms against the keyword list; the page is the suspect |
| **No Awin clicks at all** | Tracking is broken, not the campaign | Check `clickref` in the transaction report before spending another dollar |

The one thing not to do is extend the budget because "it was close". With 85–125
clicks, a zero is ambiguous and a second $100 inherits the same ambiguity.

## Before you press launch

- [ ] Confirm Plunge Chill is an **approved** programme on the Awin account, and
      read its promotion rules for brand-bidding restrictions
- [ ] Confirm the $10 first-sale bonus applies to this account for Nov–Dec
- [ ] Check the price is still $1,359 — the catalogue was corrected to this on
      12 Nov 2026 and the page and schema both read from it
- [ ] Add the negative keyword list
- [ ] Set the campaign end date to day 7, so it cannot quietly keep spending
- [ ] Note the $100 is not charged by us — it needs their ad account and card

## What is not automated, deliberately

The page cannot know whether a sale happened: the purchase completes on
`plungechill.com`, so the only record of a conversion is Awin's. No pixel is
installed on the merchant's checkout, and no revenue figure is inferred from
clicks. If a number on this page and a number in Awin disagree, Awin is right.

---

# Launch kit (added 13 November 2026)

The measurement gap is closed and the ad copy is written and length-checked.
What remains is the spend, which only the ad account can authorise.

## What changed on 13 November

**Before:** the first-party collector received `type`, `path` and `referrer`. A
Google Ads click arrives from `google.com` exactly like an organic result, so
every paid visit was recorded as `source: google` and could not be separated from
free traffic. The campaign's click-through rate — the one number this test exists
to produce — was unreadable.

**Now:**

- The browser reads `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` and
  `utm_term` from the landing URL and keeps them for the session, so an internal
  page view does not forget which campaign paid for the visit.
- Every event carries them. The collector stores a `campaign` dimension
  (`source/medium/name`), a `campaign_creative` dimension, and — on outbound
  clicks — `click_page` and `click_placement`.
- A tagged visit is labelled `google/cpc` in the traffic-source table instead of
  being folded into `google`.
- Auto-tagging is handled: if Google rewrites the click to carry `gclid` (or
  `gbraid`/`wbraid`) with no utm parameters, the visit is still recorded as paid
  (`google/cpc-auto`). The identifier itself is never stored.
- The control room has three new tables: **Campaigns**, **Ad creatives**,
  **CTA placements**, and **Pages producing clicks**.

Verified on the live host on 13 November: cross-origin posts rejected `403`,
unknown event types rejected `400`, and a tagged `page_view` plus a tagged
`retailer_click` both returned `204` — a failed SQL write would have rolled back
and returned `503`. Those two synthetic events are in the database under
`test/verify` with campaign `plumbing-check`, and will appear as a visible row if
you want to confirm the plumbing yourself.

## Ad copy — one responsive search ad

Limits enforced by Google: headline 30 characters, description 90.

| Headline | Chars |
|---|---|
| Cold Plunge With Chiller | 24 |
| 1HP Chiller, 36°F Water | 23 |
| No More Buying Ice | 18 |
| 120-Gallon Insulated Tub | 24 |
| Chiller + Tub For $1,359 | 24 |
| Specs, Cost & What To Check | 27 |
| Runs $0.70 To $1.50 A Day | 25 |
| Read The Specs First | 20 |
| Cold Plunge Buyer's Guide | 25 |
| Cools To 36°F, No Ice | 21 |

| Description | Chars |
|---|---|
| 1HP chiller and a 120-gallon insulated tub. What the specs mean and what it costs to run. | 89 |
| Cools to 36°F without ice. The running cost, the catch, and who should skip it. | 79 |
| Compare the chiller and tub specifications before you spend four figures on one. | 80 |

The copy deliberately promises a specification and a running cost rather than a
transformation. That is what this page can actually deliver, and it filters for
the person willing to read a spec table before spending $1,359 — which is the
only person who converts at this price.

### Final URL

```
https://newgiftsandgadgets.com/cold-plunge/?utm_source=google&utm_medium=cpc&utm_campaign=cp-launch-nov26&utm_content={creative}
```

Use the same URL for every ad; `{creative}` separates them. The `utm_content`
value is stored as its own dimension, so a creative that reaches the page but
never reaches the merchant is visible as such.

### Display path

`newgiftsandgadgets.com/cold-plunge`

## Launch checklist — the exact settings

Everything below is in the Google Ads UI. There is no API credential for this
account in the repository, so this step cannot be automated from here.

- [ ] New campaign → **Search** only. Uncheck Search Partners and Display.
- [ ] Bid strategy: **Manual CPC**, max **$1.00** per click.
- [ ] Daily budget **$14.00**, campaign end date **day 7**.
- [ ] Location: **United States**. Language: English.
- [ ] One ad group. Paste the 10 headlines and 3 descriptions above.
- [ ] Keywords, phrase and exact match only: `cold plunge chiller and tub`,
      `1hp cold plunge chiller`, `cold plunge tub with chiller for home`,
      `cold plunge chiller for ice bath`, `home cold plunge with chiller`,
      `cold plunge setup for home`.
- [ ] Negative keywords: `free`, `diy`, `cheap`, `rental`, `used`,
      `how to build`, `chest freezer`, `meaning`, `benefits`, `study`, `reddit`,
      `lawsuit`, `review`, `youtube`, `near me`.
- [ ] **Do not** bid on `Plunge Chill` or any variant — check the Awin programme
      rules on brand bidding first.
- [ ] Confirm auto-tagging is on (it is the default). It is a second safety net
      if a utm parameter is ever dropped.
- [ ] Turn conversion tracking for *this site* off in Google Ads. The sale
      completes on `plungechill.com`; Google cannot see it, and a zero there
      would be a false negative.

## Daily log — fill this in while it runs

| Day | Spend | Clicks | Avg CPC | Merchant clicks (Awin) | Sales | Notes |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |
| 6 | | | | | | |
| 7 | | | | | | |

Two readings to take from the control room each day, both for `/cold-plunge/`:

- **Campaigns** table: landings under `google/cpc` — the paid traffic that
  actually arrived.
- **CTA placements**: which of `lp1-hero`, `lp1-midpage`, `lp1-footer` is being
  clicked. If the footer out performs the hero on paid traffic, the page opens
  with the wrong argument.

Compare those with **Retailer clicks** in Awin. The site's number is
consent-gated and will read lower than Google's click count; Awin's is the one
that decides.

## Status as at 13 November 2026

| Item | State |
|---|---|
| Landing page | Live, `200`, instrumented with three distinct `clickref` values |
| Ad copy | Written, all assets inside Google's character limits |
| Campaign attribution | Implemented, deployed, verified against the live endpoint |
| Dashboard reporting | Deployed; campaign tables render from the collector's dimensions |
| **Spend** | **Not started — needs the ad account and payment method** |

The campaign is ready to switch on. Nothing else in the repository blocks it.
