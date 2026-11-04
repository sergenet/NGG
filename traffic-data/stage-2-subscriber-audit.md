# Stage 2 subscriber audit

Audit date: 2026-08-25, Europe/Bucharest

This file intentionally contains aggregate counts only. No subscriber address is stored in the repository.

## Corrected scope

On 2026-08-26, the owner confirmed that the previously reported 185 subscribers were supplied by mistake and belong exclusively to Garden With Serge. They are outside the NewGiftsAndGadgets project and require no further audit or action here.

Result: no Garden With Serge record will be accessed, exported, imported, segmented, or emailed as part of NewGiftsAndGadgets.

## Beehiiv reconciliation

Publication: NewGiftsandGadgets Buyers Check List

Observed directly in the signed-in Beehiiv account on 2026-08-25:

| State | Count | Eligibility decision |
|---|---:|---|
| Total records | 5 | Reconciled in Beehiiv subscriber table |
| Active | 1 | Potentially eligible; acquired from a NewGiftsAndGadgets website referral |
| Inactive | 4 | Excluded from all sends |
| Suppressed | 0 | Suppression page showed 0 of 0 |
| Pending/approval-needed | 0 observed | Subscriber approval is disabled |
| Paused | 0 observed | Retention/pause feature is unavailable on the current plan |

On 2026-08-26, the owner confirmed that the sole active Beehiiv subscriber is the owner. No Beehiiv subscriber or suppression export is needed for the clean EmailOctopus setup.

## Consent and eligible segment

- Existing subscribers to migrate: **0**.
- EmailOctopus will begin with an empty list.
- The owner will subscribe through the finished NewGiftsAndGadgets signup flow to test double opt-in and delivery.

On 2026-08-26, the owner completed the live EmailOctopus double-opt-in flow. EmailOctopus then showed exactly **1 subscribed contact**, added through a form or integration, with the record changing at the time the confirmation link was used. The sole subscriber is the owner.

The owner later completed the campaign unsubscribe test. EmailOctopus recorded the owner as **Unsubscribed** after a short processing delay and linked the activity to the owner-only Stage 2 campaign. The owner may now use the live double-opt-in form again to restore the intended single active owner subscription.

EmailOctopus retained the unsubscribe as a suppression record and therefore ignored a later form attempt instead of sending another confirmation email. This is intentional provider behavior designed to prevent accidental re-subscription. After the owner explicitly requested to subscribe again, the existing contact was manually restored to **Subscribed** in EmailOctopus. The original contact and unsubscribe activity history were preserved.

Current subscriber-facing campaign send count: **0**. No reintroduction campaign is required.

## Clean-start rule

Only subscribers who complete the new EmailOctopus double-opt-in flow for NewGiftsAndGadgets may enter the operational list. Beehiiv and Garden With Serge records will not be imported.
