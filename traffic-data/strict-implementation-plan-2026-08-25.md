# NewGiftsAndGadgets strict implementation plan

Date agreed for planning: 2026-08-25
Status: Stage 0 complete; Stage 1 awaiting deployment approval

## Binding execution rule

We will execute the stages in the exact order shown. No stage is skipped, combined, or silently reprioritized. A stage advances only after:

1. every required action is completed;
2. every acceptance test passes;
3. evidence is recorded in `traffic-data/`;
4. the completion report is presented to the user;
5. any external or irreversible action listed as approval-required receives explicit user confirmation immediately before execution.

If a gate fails, work remains in that stage until corrected or the user explicitly revises this plan.

## Standing workload rule

The steady-state business must fit a modest routine:

- weekly: one focused maintenance/content work block;
- monthly: one metrics and newsletter work block;
- quarterly: one catalog/vendor/product refresh;
- no daily publishing requirement;
- no client service deadlines;
- no system that depends on the user writing code or operating complex automation.

---

## Stage 0 — Safety, recoverability, and source of truth

### Objective

Prevent legacy automation or an unrecoverable local change from undoing the Amazon shutdown or corrupting the current site.

### Required actions

1. Record the current repository, live sitemap, FTP deployment manifest, and scheduled-task state.
2. Create a recoverable Git baseline for the current rebuilt source while preserving all user files and unrelated changes.
3. Classify every root folder/script as current, reference-only, generated, legacy, secret-bearing, or removable-later.
4. Disable the five identified NGG scheduled tasks. This changes Windows task state and therefore requires explicit user approval immediately before execution.
5. Quarantine legacy Amazon builders, ASIN/link repair, and social autopost scripts so they cannot be run accidentally.
6. Confirm the current build/deploy workflow uses `src`, `public`, and `out`, not legacy `engine` output or `public_old`.
7. Verify credentials remain outside tracked source and flag any credential that needs external rotation without displaying it.

### Acceptance gate

- current source has a recoverable baseline;
- five obsolete scheduled tasks are disabled;
- no active task can rewrite or upload Amazon-era output;
- one documented source-to-build-to-deploy path exists;
- `npm run check` passes;
- a complete `out` scan finds zero closed Store ID, Amazon destination, or Amazon-hosted image;
- evidence file: `traffic-data/stage-0-completion.md`.

---

## Stage 1 — Public truth, compliance, and trust repair

### Objective

Make every public commercial and editorial statement defensible before asking vendors or subscribers to trust the site.

### Required actions

1. Replace unsupported `/work-with-us/` claims with verified figures or clearly labeled “not yet available” language.
2. Remove promises of hands-on reviews, audience demographics, traffic mix, open rate, social services, and results unless evidence is documented.
3. Audit every guide and catalog description for unsupported testing, performance, health, popularity, live-price, urgency, and “best/top-rated” claims.
4. Keep research-based labeling adjacent to recommendations.
5. Rewrite the current checklist into an evergreen, evidence-safe source document; remove Amazon-specific instructions and unsupported hands-on statements.
6. Review affiliate disclosure, privacy, terms, contact, correction, and sponsored-content policies for non-Amazon vendors, email, and future digital downloads.
7. Add automated truthmode checks for prohibited closed-tag material and high-risk claim phrases.
8. Run the full build and quality gate, then inspect representative pages and the complete exported tree.
9. Deploy only after user approval immediately before the FTP upload.

### Acceptance gate

- claim audit log lists every changed or retained high-risk claim and its evidence;
- partnership page contains only supported current facts;
- revised checklist passes content and visual review;
- catalog validation, lint, typecheck, and production build pass;
- exported-tree compliance scan passes;
- all sitemap URLs return HTTP 200 after approved deployment;
- evidence file: `traffic-data/stage-1-completion.md`.

---

## Stage 2 — Subscriber provenance, consent, and list recovery

### Objective

Determine whether the reported 185 addresses are truly usable NewGiftsAndGadgets subscribers, then preserve and re-engage only the eligible portion.

### Required actions

1. Identify the database/publication where the 185 count was observed.
2. Export counts—not email addresses into the repository—by status, signup source, signup date, language, consent text/version, last send, last engagement, bounce, complaint, and unsubscribe state.
3. Export Beehiiv's current subscriber report and reconcile active, inactive, pending, paused, suppressed, and approval-needed counts.
4. Determine whether the 185 subscribed specifically to NewGiftsAndGadgets. GardenWithSerge consent must not be silently repurposed.
5. Exclude all unsubscribed, suppressed, complained, invalid, or unverifiable records.
6. Confirm the sending domain, From name, Reply-To address, physical postal address, unsubscribe link, privacy wording, and authentication records (SPF, DKIM, and DMARC).
7. Create an eligible subscriber segment and a suppression record.
8. Prepare one plain reintroduction email explaining what they signed up for, the new monthly cadence, what they will receive, and how to unsubscribe.
9. Send a test only to the owner and inspect desktop/mobile rendering and every link.
10. Obtain explicit user approval immediately before sending to subscribers.
11. Send once to the eligible list, then record delivered, bounced, opened, clicked, unsubscribed, and complained counts without overstating open-rate accuracy.

### Acceptance gate

- exact eligible count is documented and reconciled;
- consent source is documented for every included segment;
- no ineligible address can receive a send;
- domain/authentication and compliance checklist passes;
- owner test passes;
- approved reintroduction send is complete;
- delivery, click, unsubscribe, complaint, and bounce results are recorded;
- evidence file: `traffic-data/stage-2-completion.md`.

If none of the 185 has verifiable NewGiftsAndGadgets consent, Stage 2 still completes by documenting zero eligible legacy subscribers and configuring a correct new signup system. The list is not imported or emailed.

---

## Stage 3 — Measurement reset and commercial baseline

### Objective

Create trustworthy measurements before choosing vendors or traffic tactics.

### Required actions

1. Verify live GA4 consent flow and receipt of page view, retailer click, file download, newsletter click/signup, and future checkout events.
2. Export current Search Console queries, pages, countries, devices, indexing state, and 28-day metrics.
3. Record current Beehiiv active subscribers, eligible sends, clicks, unsubscribes, bounces, and complaints.
4. Export Awin click, transaction, advertiser, and commission data for the same date range.
5. Record Bing and Pinterest only if their data is current and attributable.
6. Replace Amazon-specific KPI fields with vendor-neutral affiliate metrics.
7. Update the weekly report so every source uses matching date windows.
8. Complete one full 28-day clean measurement period after event verification. Do not interpret partial periods as growth.

### Acceptance gate

- all required events are verified live;
- one 28-day baseline uses matching dates;
- top pages and queries are documented without invented search volume;
- subscriber and affiliate counts reconcile with their source systems;
- no placeholder zero is presented as observed performance;
- evidence file: `traffic-data/stage-3-completion.md`.

---

## Stage 4 — Vendor strategy and applications

### Objective

Secure reliable non-Amazon buying destinations for the two priority audiences before expanding content.

### Required actions

1. Keep initial scope to remote workers/home office and home cooks/kitchen.
2. Audit the current Awin account: approved, pending, rejected, and available relevant US advertisers; confirm payment/tax details and program terms.
3. Build a vendor scorecard containing US shipping, product relevance, commission structure, cookie period, reversal rules, product feed/deep-link support, image usage permission, price/availability maintenance burden, return policy, brand reliability, and program status.
4. Prefer the existing Awin account first. Consider another network only when it fills a documented catalog gap that Awin cannot fill.
5. Create a truthful publisher profile using only Stage 3 evidence.
6. Shortlist no more than 10 priority programs in the first application batch.
7. Present program terms and the exact proposed application list to the user.
8. Obtain explicit user approval immediately before submitting affiliate applications.
9. Record each application and wait for decisions; no unapproved tracking links are published.

### Acceptance gate

- vendor scorecard complete;
- at least 5 relevant US programs approved across the two priority audiences, or a documented market result shows fewer are available;
- image/link/feed permissions documented;
- every active program has recorded maintenance and disclosure requirements;
- evidence file: `traffic-data/stage-4-completion.md`.

---

## Stage 5 — Priority catalog remapping

### Objective

Make the pages most likely to receive traffic useful and monetizable without restoring a broad, stale catalog.

### Required actions

1. Rank existing products by Stage 3 impressions, page engagement, audience fit, and approved-vendor availability.
2. Select an initial set of 20–30 priority products across remote work and home cooking.
3. Map each selected product to an approved vendor, lawful image, checked destination, price band, shipping market, return/warranty source, and last-verified date.
4. Replace stale claims and placeholder imagery for selected products.
5. Add a multi-vendor comparison only where at least two real approved destinations exist.
6. Keep non-priority products paused rather than filling them with weak alternatives.
7. Add validator rules for URL validity, approved vendor status, image provenance, last-verified date, and duplicate destinations.
8. Build, inspect, and deploy with explicit approval.

### Acceptance gate

- every selected priority product has at least one active approved US buying destination;
- every selected product has a lawful non-placeholder image;
- every selected destination passes a live redirect and product-match check;
- no claim implies live pricing or personal testing without evidence;
- all automated and live checks pass;
- evidence file: `traffic-data/stage-5-completion.md`.

---

## Stage 6 — Evergreen free product and signup funnel

### Objective

Turn useful site traffic into a permission-based owned audience.

### Required actions

1. Use Stage 3 behavior and subscriber feedback to choose one free asset. Default candidate: an evergreen “Smart Gadget Purchase Checklist,” subject to validation.
2. Create a source document and polished accessible PDF with truthmode language.
3. Remove the year from the product unless annual updating is intentional.
4. Create a clear signup page describing the monthly newsletter and the download.
5. Use Beehiiv or another hosted provider for confirmed signup and delivery; do not build a nonfunctional POST API on the static host.
6. Enable double opt-in when appropriate for the audience and provider configuration.
7. Tag signup source and asset name.
8. Create a welcome email that delivers the file and sets cadence expectations.
9. Preserve an optional no-signup resource only if it has a distinct purpose; do not describe an immediate public download as an email lead magnet.
10. Test signup, confirmation, delivery, unsubscribe, mobile layout, analytics events, and file accessibility end to end.
11. Deploy with explicit approval.

### Acceptance gate

- content and visual QA pass;
- consent, confirmation, delivery, and unsubscribe work end to end;
- source attribution appears in Beehiiv;
- GA4 records the intended funnel events after consent;
- privacy and terms describe the actual flow;
- evidence file: `traffic-data/stage-6-completion.md`.

---

## Stage 7 — Focused evergreen traffic program

### Objective

Grow qualified traffic at a workload sustainable for the owner.

### Required actions

1. Choose one primary cluster from measured evidence: remote workers or home cooks. Do not expand both simultaneously.
2. Audit the pillar and supporting pages against current Search Console queries and vendor coverage.
3. Produce an eight-item content/update queue where each item serves a distinct intent.
4. Complete one substantial page improvement or new evidence-rich page per week.
5. For each page, record sources, compatibility/constraints, who should skip, internal links, vendor coverage, update date, and newsletter placement.
6. Submit updated URLs through normal sitemap/internal-link discovery; do not repeatedly request indexing without a material change.
7. Send one useful newsletter per month using the same cluster—not a catalog dump.
8. Use Pinterest only after account authentication, image rights, landing-page relevance, and manual post QA are restored. Do not resume the legacy autoposter.
9. Continue for 12 full weeks without changing strategy based on daily fluctuations.

### Acceptance gate

- all eight queue items completed and quality-reviewed;
- 12-week program completed;
- three monthly newsletters sent to eligible subscribers;
- matching-window Search Console, GA4, Beehiiv, Awin, and Pinterest results recorded;
- qualified traffic, subscriber, and affiliate outcomes are separated from impressions;
- evidence file: `traffic-data/stage-7-completion.md`.

---

## Stage 8 — First paid digital product discovery

### Objective

Choose a paid download from demonstrated audience demand, not intuition.

### Required actions

1. Review the 12-week query, download, email click, reply, and affiliate data.
2. Ask subscribers one short question about the planning problem they most want solved.
3. Define one product with a narrow result, simple instructions, no specialist software requirement, and minimal support burden.
4. Write a one-page product concept including buyer, problem, contents, format, support promise, update policy, price hypothesis, refund policy, and excluded uses.
5. Create a preview or waitlist page before producing a large bundle.
6. Seek at least 10 meaningful expressions of interest or 3 explicit purchase-intent responses. These are validation thresholds, not revenue promises.
7. Stop or revise if the threshold is not met.

### Acceptance gate

- demand evidence and survey results documented;
- one product concept selected;
- validation threshold met, or a documented decision made to repeat discovery;
- evidence file: `traffic-data/stage-8-completion.md`.

---

## Stage 9 — Product creation, checkout, and controlled launch

### Objective

Create and sell one low-support evergreen digital download safely.

### Required actions

1. Produce the product and source files with accessibility, printing, and mobile-use checks as applicable.
2. Use a hosted checkout/delivery platform suitable for the owner's tax, payment, refund, and administrative needs; do not add a fake static-site checkout.
3. Document platform fees, payout method, tax handling, customer-data access, refund process, file-delivery controls, and succession/recovery access.
4. Add product, checkout, success, privacy, terms, refund, and support information.
5. Instrument view, checkout click, completed purchase (where the provider permits), refund, and support metrics without exposing customer data.
6. Complete owner test purchases/refunds where the provider supports safe testing.
7. Obtain explicit user approval immediately before enabling live sales and before the first launch email.
8. Launch to the eligible subscriber list before buying traffic.

### Acceptance gate

- product passes content and visual QA;
- checkout, payment, delivery, receipt, refund, and support routes tested;
- terms/privacy/disclosures match actual behavior;
- owner has recovery access documented;
- first controlled launch completed and results recorded;
- evidence file: `traffic-data/stage-9-completion.md`.

---

## Stage 10 — Sustainable maintenance and expansion

### Objective

Operate the site calmly and let useful assets mature without allowing accuracy or subscriber trust to decay.

### Required cadence

### Weekly

- check contact/support messages;
- verify the current priority page or vendor issue;
- complete at most one meaningful content improvement.

### Monthly

- send one useful newsletter;
- update the matching-window KPI report;
- check top landing pages, retailer clicks, affiliate transactions, download signups, sales, refunds, bounces, complaints, and unsubscribes;
- verify the ten most-clicked retailer destinations.

### Quarterly

- review all active affiliate programs and priority catalog items;
- refresh or pause stale products;
- review subscriber engagement and run a careful re-engagement/cleanup process;
- review the free and paid downloads for needed corrections;
- select the next quarter's single cluster objective.

### Annual

- complete a truth/compliance audit;
- review business continuity, credentials, recovery access, payouts, tax records, and vendor terms;
- retire content and products that create maintenance without qualified traffic or revenue.

### Expansion gate

No second paid product, second content cluster, new social channel, paid advertising, or Amazon reapplication begins until:

- the first product has completed a 90-day measurement period;
- at least one traffic channel produces qualified visits;
- list growth and newsletter engagement are measured;
- support burden remains within the standing workload rule;
- affiliate and/or digital sales evidence justifies expansion;
- the user explicitly approves the next scope.

Evidence file for each quarter: `traffic-data/quarterly-review-YYYY-QN.md`.

---

## Current stage tracker

| Stage | Status | Completion evidence |
|---:|---|---|
| 0 | Completed | `traffic-data/stage-0-completion.md` |
| 1 | In progress; local gate passed, awaiting deployment approval | `traffic-data/stage-1-predeployment.md` |
| 2 | Locked | — |
| 3 | Locked | — |
| 4 | Locked | — |
| 5 | Locked | — |
| 6 | Locked | — |
| 7 | Locked | — |
| 8 | Locked | — |
| 9 | Locked | — |
| 10 | Locked | — |

“Locked” means the stage may not begin until the preceding gate is completed and reported.
