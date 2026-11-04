# Stage 2 completion — subscriber truth, consent, and email compliance

Completed: 2026-08-26, Europe/Bucharest

## Outcome

Stage 2 is complete. NewGiftsAndGadgets now uses EmailOctopus with a deployed, authenticated, double-opt-in signup flow. Beehiiv is dormant and no Garden With Serge or Beehiiv subscriber was imported.

## Reconciled audience

- Eligible legacy NewGiftsAndGadgets subscribers: **0**.
- Garden With Serge records in scope: **0**.
- Imported contacts: **0**.
- Current active EmailOctopus subscriber: **1**, the owner, restored after the completed unsubscribe test at the owner's explicit request.
- Ineligible addresses sent a campaign: **0**.

## Live acceptance evidence

- The EmailOctopus form is deployed on the live website with monthly-cadence consent text, privacy link, reCAPTCHA, and double opt-in.
- The owner received and completed the confirmation message; EmailOctopus recorded the contact as Subscribed.
- The owner-only campaign was explicitly approved and sent to exactly one recipient.
- Observed campaign evidence: one email sent, owner open recorded, no standard link click reported, unsubscribe completed and persisted, no bounce displayed, and no complaint displayed.
- Reply-To passed: the owner's reply arrived at `contact@newgiftsandgadgets.com`.
- The required unsubscribe link and EmailOctopus physical return address appeared in the delivered message.
- Unsubscribe persistence passed. EmailOctopus retained the address as Unsubscribed until the owner explicitly requested restoration; manual restoration preserved the prior activity record.

## Authentication evidence from Yahoo

- DKIM: pass for aligned identity `@newgiftsandgadgets.com`, selector `eo`.
- Provider DKIM: pass for `@eu.sparkpostmail2.com`.
- SPF: pass for `eom.newgiftsandgadgets.com`.
- DMARC: pass with policy `p=NONE` and header From `newgiftsandgadgets.com`.

## Acceptance-gate decision

The Stage 2 acceptance gate passes. Because there were zero eligible legacy subscribers, no reintroduction campaign was required or sent. The only campaign was the controlled owner-only compliance test. Stage 3 may begin.
