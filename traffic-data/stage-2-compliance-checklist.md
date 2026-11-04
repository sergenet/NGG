# Stage 2 email compliance checklist

Checked: 2026-08-26, Europe/Bucharest

| Control | Current evidence | Status |
|---|---|---|
| Publication | EmailOctopus account and `NewGiftsAndGadgets Signup` form | Pass |
| From identity | `NewGiftsAndGadgets`; `newgiftsandgadgets.com` is verified in EmailOctopus and aligned in the delivered Yahoo message | Pass |
| Retired Beehiiv path | Beehiiv failed to hand verification mail to the recipient server and was replaced. It is dormant and has no subscriber records requiring migration. | Closed; not part of the active delivery path |

On 2026-08-26, the Namecheap evidence and exact reproduction steps were submitted to Beehiiv through its in-app **Report a Bug** channel. Beehiiv displayed `Bug report filed successfully`. The Launch-plan form explicitly states that it does not provide a direct response; hands-on support tickets remain Scale-plan gated.
| EmailOctopus Reply-To | `contact@newgiftsandgadgets.com` was saved as sender and Reply-To; the owner's reply arrived in that mailbox. | Pass |
| Physical postal address | A complete US postal address was supplied by the owner and saved in EmailOctopus. EmailOctopus's privacy-forwarding option is enabled; its return address appeared in the owner test. The private address is intentionally omitted from repository evidence. | Pass |
| Unsubscribe | The owner reached the unsubscribe confirmation page and EmailOctopus persisted the contact as Unsubscribed before explicit manual restoration. | Pass |
| Privacy wording | Site privacy policy covers newsletter processing, purpose, retention, providers, choices, and contact | Pass |
| Signup clarity | The deployed form states monthly content, unsubscribe availability, privacy terms, and reCAPTCHA notice. | Pass |
| Double opt-in | Enabled and passed through the live form, confirmation message, confirmation link, success page, and resulting Subscribed record. | Pass |
| Bot protection | EmailOctopus form reCAPTCHA is enabled, with Google privacy and terms links beside the live embed. | Pass |
| SPF | Yahoo reported `spf=pass` for `eom.newgiftsandgadgets.com`. | Pass |
| DKIM | Yahoo reported `dkim=pass` for aligned identity `@newgiftsandgadgets.com`, selector `eo`; the provider DKIM also passed. | Pass |
| DMARC | Yahoo reported `dmarc=pass (p=NONE)` with header From `newgiftsandgadgets.com`. | Pass |
| Tracking records | EmailOctopus `eom`, `eot`, and numeric validation CNAME records are installed and verified. | Pass |
| Custom sending domain | `newgiftsandgadgets.com` is verified in EmailOctopus and passed live Yahoo authentication. | Pass |

The embedded EmailOctopus form was deployed on 2026-08-26. `npm run check`, TypeScript, the production build, FTP extraction, public HTTP checks, and a browser-rendered live preview passed. The live page displays the EmailOctopus email field, Subscribe button, consent checkbox, privacy links, and reCAPTCHA notice. The live Content Security Policy permits the required EmailOctopus and reCAPTCHA resources and no longer permits Beehiiv. Temporary deployment files return 404 after cleanup. The later owner subscription and delivery tests passed.

During the first owner test, EmailOctopus accepted the Yahoo address directly as Subscribed and sent no confirmation message. A live settings audit found that the underlying double-opt-in checkbox was actually disabled despite the earlier apparent configuration. On 2026-08-26 it was enabled again, the approved confirmation email and success-page copy were restored, Save completed, and a full reload confirmed the underlying checkbox remained checked and the custom content persisted. The incorrectly auto-subscribed owner test contact was permanently deleted; the list is again empty for a clean test.

The clean retest passed on 2026-08-26: the owner received the confirmation message, followed its confirmation link, and reached the configured `Subscription confirmed` success page. EmailOctopus subsequently showed exactly one Subscribed contact, added via a form or integration, with its record updated at confirmation time. Double opt-in and live signup acceptance are therefore complete. Campaign-level Reply-To, authentication-header, unsubscribe-link, and postal-footer verification remain for the first owner-only campaign test; no broader send is permitted before those checks pass.

An owner-only campaign draft named `Owner-only Stage 2 delivery test` was created and stopped at EmailOctopus's final review screen. It targeted exactly one recipient, used `NewGiftsAndGadgets <contact@newgiftsandgadgets.com>`, and had the subject `NewGiftsAndGadgets email delivery test`. Preview verification confirmed the test instructions, unsubscribe link, and EmailOctopus physical return address. The owner later approved and completed this send.

The owner explicitly approved the irreversible send on 2026-08-26. EmailOctopus accepted `Send now` for exactly one subscriber, completed the send, and recorded the campaign in Reports.

EmailOctopus subsequently reported the campaign as Sent to one subscriber, and the owner confirmed receipt with the correct visible content, unsubscribe mechanism, and footer. The unsubscribe URL uses the authenticated branded tracking host `eot.newgiftsandgadgets.com`. Reply-path receipt and raw-message SPF/DKIM/DMARC results remain to be confirmed before Stage 2 closes.

The owner replied to the campaign and confirmed the reply arrived at `contact@newgiftsandgadgets.com`; the Reply-To path passes. The owner then used the unsubscribe link and reached EmailOctopus's `Unsubscribed — You won't receive any more of these emails` confirmation page. EmailOctopus's contact dashboard continued to show Subscribed during immediate and delayed checks, so suppression persistence is not yet accepted and the owner must not resubscribe until the provider state changes or support resolves the discrepancy.

A later recheck showed the contact as `Unsubscribed`, with recent activity stating `Unsubscribed after receiving Owner-only Stage 2 delivery test` and a matching update time. The earlier mismatch was provider processing delay. Unsubscribe persistence now passes; no support escalation or platform fix is required.

A subsequent live-form attempt did not send a new confirmation because EmailOctopus deliberately retains unsubscribed contacts and prevents forms from overriding their suppression state. Following the owner's explicit renewed consent, the existing owner contact was manually changed back to `Subscribed`; a reload confirmed the status and new update time while preserving the unsubscribe activity record.

All Stage 2 email compliance controls pass. Future sends remain limited to contacts with valid NewGiftsAndGadgets consent.
