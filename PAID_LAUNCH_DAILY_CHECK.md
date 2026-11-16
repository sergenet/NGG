# Daily check — Plunge Chill Search Nov26

One page. Three minutes a day, 13–20 November 2026.

**The shape of the test:** $100.00 campaign total · $1.00 max CPC · Search only,
United States · 6 phrase-match keywords · 15 negative keywords · 1 responsive
search ad with 4 sitelinks and 6 callouts.

Because it is a **campaign total**, not a daily budget, Google paces the spend
itself. Nothing needs topping up and nothing can overspend: the account stops at
$100 or on 20 November, whichever comes first.

---

## The three minutes

1. **Google Ads** → Campaigns → *Plunge Chill Search Nov26*. Read **Cost**,
   **Clicks**, **Avg CPC**, **Impr.**
2. **Control room** → `https://newgiftsandgadgets.com/control-room/` →
   **Campaigns** table. The row is `google/cpc/cp-launch-nov26`; the number is
   landings that actually rendered a page.
3. **Control room** → **CTA placements**. Three rows: `lp1-hero`,
   `lp1-midpage`, `lp1-footer`.

That is the whole routine. Everything below is only about what to do with those
numbers.

---

## What to expect

| Over 8 days (13–20 Nov) | Rough figure |
|---|---|
| Spend per day | ~$12.50 |
| Clicks per day at ~$1.00 CPC | ~12 |
| Clicks over the week | ~95 |
| Landings in the control room | **fewer** than Google's clicks |

Landings below clicks is normal and not a fault: the site only records a
`page_view` when analytics consent has been granted, and it drops requests that
carry `DNT` or `Sec-GPC`. Google counts the click whether or not the visitor
consents. Treat the gap as the cost of consent, not a broken tag.

---

## The one number that decides

> **Retailer clicks ÷ control-room landings** — how many arriving visitors
> pressed a "Check price" button.

Not CTR. Google's click-through rate says whether the ad copy attracts the right
searcher; it says nothing about whether the page did its job.

| Merchant click rate | Reading |
|---|---|
| **under 2%** after ~50 clicks | the page is the problem, not the ad. Stop paying to test it |
| **2–5%** | working, but the ad or the offer is doing the heavy lifting |
| **5%+** | the page converts intent; a zero sale at the end is about price or trust on the merchant site |

These thresholds are decision rules for this test, not industry benchmarks.

---

## Do this when you see that

| You see | Do this |
|---|---|
| A search term with **3+ clicks and no retailer click** | add it as a campaign negative keyword |
| **Avg CPC pinned at $1.00** | nothing — that is the bid limit doing its job |
| **$50 spent, zero retailer clicks** | pause the campaign and fix the landing page first |
| Landings **half of Google's clicks or less** | consent or blocker loss; investigate before judging the page |
| Campaign row reads **`google/cpc-auto/autotagged`** | utm parameters were stripped; check the ad's Final URL before spending more |
| Retailer clicks recorded but **no `clickref` in Awin** | attribution is broken end-to-end; the clicks are not reaching the merchant link |
| A keyword with **0 impressions after 2 days** | the phrase is too narrow for the budget; note it, don't widen anything mid-test |

---

## Where the money is attributed

Each CTA carries its own reference into Awin, so a sale names the button that
earned it:

| Placement | Awin `clickref` |
|---|---|
| Hero | `lp1-hero` |
| Mid-page | `lp1-midpage` |
| Closing | `lp1-footer` |

Read the result in **Awin → Reports → Transactions**, grouped by click
reference. A sale with no click reference did not come from this campaign.

---

## Do not

- **Do not add assets, images or AI-generated creative mid-test.** It changes
  what you are measuring between days and the $100 no longer answers one
  question.
- **Do not raise the bid** because the CPC looks cheap relative to $1.00; cheap
  clicks are only good if they convert, and you will not know that until the end.
- **Do not read Awin the same day.** Affiliate sales post with a lag and can be
  reversed in the return window.
- **Do not judge on impressions.** 95 clicks from 2,000 impressions and 95 from
  200 are the same result to the bottom line.

---

## The end of the test

On **20 November** the campaign stops on its own. Then pick exactly one:

| Outcome | Decision |
|---|---|
| ≥1 confirmed sale | profitable on one sale at this price point; raise the budget gradually, not by multiples |
| Retailer clicks but no sale | page and offer work; the leak is on the merchant's checkout — do not buy more clicks until you know why |
| Few clicks, no retailer clicks | the keywords or the page are wrong; fix before spending again |
| Zero of everything | the ad never served — check eligibility, not budget |

One $100 run answers one question. Treat a second $100 as a new test with one
variable changed, not as a continuation.
