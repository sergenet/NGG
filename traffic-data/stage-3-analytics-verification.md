# Stage 3 — live analytics verification

Started: 2026-08-26, Europe/Bucharest

## Required events

| Measurement | Implementation status | Live receipt status |
|---|---|---|
| Page view | GA4 configuration emits the standard page view after consent | Verified in authoritative GA4 Realtime |
| Retailer click | `affiliate_click` is emitted by active primary and vendor-grid retailer links | Verified in authoritative GA4 Realtime |
| File download | `file_download` is emitted by the checklist download links | Verified in authoritative GA4 Realtime |
| Newsletter click | `newsletter_click` is emitted only from the EmailOctopus Subscribe control after the Stage 3 correction | Verified in authoritative GA4 Realtime |
| Newsletter signup | `newsletter_signup_attempt` records form submission truthfully; confirmed subscription remains authoritative in EmailOctopus because double opt-in confirmation occurs off-site | Verified in authoritative GA4 Realtime |
| Checkout | No checkout or paid digital product exists in the current static site. Checkout events are not fabricated; event verification becomes applicable when Stage 9 adds a hosted checkout. | Not yet applicable |

GA4 Realtime first confirmed several events during testing of the subsequently rejected duplicate property, so those receipts were discarded. After the pre-existing property was restored and the tag-loader defect corrected, all currently applicable events were repeated and confirmed in the authoritative property.

## Consent boundary

GA4 is not rendered when analytics is declined or undecided. The site stores the visitor's choice locally and loads the configured GA4 property only after `Allow analytics` is selected.

Live verification after deployment passed on 2026-08-26:

- After selecting `No thanks` and reloading, no Google tag script was present.
- After selecting `Allow analytics`, only the configured Google tag script loaded.
- The former `G-52BQHQ8HL1` identifier was absent.

## Local quality gate

The Stage 3 newsletter-event correction passed catalog validation, truthmode validation, ESLint, TypeScript, and the full 131-page static production build. The approved deployment completed successfully, including server extraction, cleanup, and IndexNow submission of 128 URLs.

Public-layer verification passed: the homepage returned HTTP 200; the dedicated measurement ID and `newsletter_signup_attempt` were present in live JavaScript; the former measurement ID was absent; and both temporary deployment files returned HTTP 404.

The consent-time initialization correction was deployed after a second full quality-gate pass. Public verification confirmed the immediate initializer, analytics-disable flag, and `affiliate_click` in the live bundle.

The site was then rebuilt and redeployed with the pre-existing property's measurement ID. Public verification confirmed that ID in the live bundle, with both the duplicate and Garden identifiers absent. The homepage returned HTTP 200, both temporary deployment files returned HTTP 404, and IndexNow accepted 128 URLs. A controlled consented page load and affiliate click were generated; Realtime receipt is still pending rather than assumed.

## Property-isolation correction

The first live GA4 test revealed that the site's prior measurement ID belonged to the `Garden with Serge` property. Although it received NewGiftsAndGadgets page views, retaining it would mix two businesses and invalidate the Stage 3 baseline.

An existing `New Gifts and Gadgets` property was later identified in the property picker. It is property `529707553`, with web stream `14215782488` for `https://www.newgiftsandgadgets.com`. This pre-existing property is authoritative and the local environment and live site now use its measurement ID.

The accidentally created duplicate property `551675930` is no longer referenced by the website and has not been deleted.

The authoritative property Realtime report confirmed `page_view`, `affiliate_click`, `file_download`, `newsletter_click`, and `newsletter_signup_attempt` on 2026-08-26. Stage 3 Step 1 is complete. Checkout remains not applicable until Stage 9 introduces a hosted checkout.
