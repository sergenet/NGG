# Stage 2 Newsletter Provider Contingency

Date researched: 2026-08-26

## Decision

The owner selected **EmailOctopus** on 2026-08-26. Configure it as a clean, empty newsletter system for NewGiftsAndGadgets.

The clean setup is now in progress under the ordered Stage 2 controls. No subscriber import or subscriber-facing send is permitted; the first contact will be the owner's live double-opt-in test.

## Requirements

- Suitable for a very small, low-frequency newsletter.
- Custom `contact@newgiftsandgadgets.com` Reply-To support.
- Human support accessible without an expensive plan.
- Domain authentication and delivery evidence.
- Double opt-in and consent records for new subscribers.
- Suppression/unsubscribe preservation during migration.
- Simple monthly operation for a nontechnical owner.

## Verified comparison

| Provider | Current entry plan | Human support | Reply-To and authentication | Fit |
|---|---|---|---|---|
| **Brevo** | Free: 300 sends/day, up to 100,000 stored contacts; no time limit | Email support is included on Free, and its help center directs free users to create an account ticket | Campaign settings allow a separate Reply-To address. Brevo documents sender-domain authentication and recommends a root-domain mailbox as Reply-To. Double opt-in forms and consent/event logs are supported. | **Best overall replacement.** Enough capacity, direct ticket path, explicit Reply-To control, and stronger consent/delivery logs. |
| **EmailOctopus** | Free: 2,500 subscribers and 10,000 emails/month | Live chat for the first 30 days; its documentation says support emails are answered within 24 hours, with priority/unlimited chat on Pro | Supports verified domains and routes replies to the owner's mailbox. Imports can preserve subscribed and unsubscribed statuses. | **Best simplicity/value alternative.** More than enough capacity, but long-term free-plan support is less explicit than Brevo's account-ticket path. |
| **MailerLite** | Free: 250 subscribers and 2,500 emails/month | Email and live chat are available for only the first 14 days on Free; paid Comfort adds 24/7 email support | Capable newsletter platform, but the support limitation recreates the principal Beehiiv problem after the trial. | Not recommended for this case unless paying at least for Comfort. |
| **Buttondown** | Newsletter-focused service | Documentation-led support model | A custom Reply-To on a managed sending domain also enables custom-domain sending. | Clean product, but less suitable than Brevo for guided setup, consent records, and support escalation. |

## Why EmailOctopus was selected

1. The free tier allows 2,500 subscribers and 10,000 monthly emails.
2. The product is focused on simple email newsletters rather than a broad marketing suite.
3. Live chat is available during the first 30 days, allowing setup and delivery questions to be resolved immediately.
4. The owner prefers its simpler interface and generous allowance.
5. No subscribers need to be migrated; the list will start empty.

## Controlled clean-start plan

1. Create an EmailOctopus Free account using the site owner's existing administrative identity.
2. During the initial 30-day live-support window, confirm the correct custom-domain sender and `contact@newgiftsandgadgets.com` reply path.
3. Configure domain authentication without changing or disrupting Namecheap mailbox MX records.
4. Create one empty NewGiftsAndGadgets list. Do not import any Beehiiv or Garden With Serge record.
5. Configure a double-opt-in form, consent copy, unsubscribe handling, and the required postal footer.
6. Integrate and validate the EmailOctopus form in the local static site without deploying it.
7. Deploy the validated form only after the owner's final deployment confirmation.
8. The owner subscribes through the live website and completes double opt-in.
9. Verify that exactly one active subscriber appears, consent evidence exists, confirmation delivery succeeds, and the received headers show SPF, DKIM, and DMARC alignment. Verify Reply-To behavior, unsubscribe handling, and the postal footer with the first owner-only campaign test.
10. Keep Beehiiv dormant until EmailOctopus passes the full Stage 2 acceptance checks; no Beehiiv export is required.

## Sources

- Brevo plan and Free-plan email support: https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans
- Brevo Free-plan limits and account tickets: https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan
- Brevo campaign Reply-To setting: https://help.brevo.com/hc/en-us/articles/4413566705298-Create-and-send-an-email-campaign
- Brevo sender and domain verification: https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email
- Brevo domain and Reply-To architecture: https://help.brevo.com/hc/en-us/articles/35852083084178-Domain-setup-for-better-email-deliverability
- Brevo double opt-in and consent logs: https://help.brevo.com/hc/en-us/articles/208733449-Double-opt-in-DOI-What-it-is-and-how-to-track-user-sign-ups
- EmailOctopus pricing: https://emailoctopus.com/pricing
- EmailOctopus support availability: https://help.emailoctopus.com/article/439-is-emailoctopus-for-me
- EmailOctopus Free-plan support window: https://help.emailoctopus.com/article/155-do-you-offer-a-trial
- EmailOctopus contact-status import: https://help.emailoctopus.com/article/34-importing-contacts-into-a-list
- EmailOctopus suppression migration: https://help.emailoctopus.com/article/30-creating-a-suppression-list-or-blocklist
- MailerLite pricing and support: https://www.mailerlite.com/pricing
- MailerLite support limitations: https://www.mailerlite.com/help/mailerlite-support-options
- Buttondown Reply-To behavior: https://docs.buttondown.com/replies
