# NewGifts & Gadgets local admin

Open **NewGifts Admin** on the Windows desktop. The loopback-only service runs at http://127.0.0.1:48731 and is not deployed to the public website. Closing the browser leaves its local reporting service running until Windows exits. Reopen the shortcut after restarting Windows. There is no paid hosting or startup task.

## Automatic reporting — one-time authorization required

Use **Connect accounts** on Overview:

1. Google: enable Analytics Data API in a Google Cloud project, create a dedicated service account, and grant its email Viewer access to **GA4 property 529707553**. Create its JSON key and select it in the console. Do not use credentials from unrelated projects. The panel requests only analytics.readonly. Sources: https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries and https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/batchRunReports
2. EmailOctopus: create an API key in account settings and find the **list ID**, not the form ID. Enter the exact NewGiftsAndGadgets list name so a different business’s audience cannot be selected accidentally. Source: https://emailoctopus.com/api-documentation/lists/get
3. Check successful synchronization timestamps. A configured credential is not proof of a working connection. An authorization error leaves the last successful data visible with a warning; it never invents zero totals.

Refresh runs on service start and every 30 minutes. Sync providers requests an immediate refresh (minimum one-minute cooldown). GA4 reports last 28 complete days through yesterday, in the property timezone: sessions, engaged sessions, users, page views, channels, top pages and conversion-intent events. Google processing delays and consent affect coverage. It is **not realtime visitor monitoring**.

EmailOctopus returns confirmed, pending and unsubscribed current list counts. Historical snapshots begin at connection time. Net change is not gross new signups, and counts include owner tests. No subscriber email addresses are downloaded. No email campaigns or contact changes are performed. Other sources (Awin, Search Console, Bing, Pinterest) remain manual in this version.

## Local data and security

Data: `%LOCALAPPDATA%\NewGiftsAndGadgets\AdminPanel`. `state.json` holds reporting records, provider snapshots, tasks and notes; `state.json.bak` is the prior saved state. Use Backup all data to export a JSON copy. Import accepts the console metrics CSV schema, not raw provider exports. There is no in-app JSON restore; stop the service before restoring state.json from a trusted backup.

Credentials: `credentials.dpapi`, encrypted by Windows DPAPI for this Windows account, outside source control/public output and excluded from dashboard exports. Do not distribute service-account key files. A local program running as the same user can decrypt DPAPI, so it is not protection against a compromised Windows account. To revoke access, remove the dedicated Google account’s GA4 permission and revoke the EmailOctopus API key in their provider consoles. Replacing credentials uses the connection forms.

The server binds only 127.0.0.1 and enforces Host, Origin and a session token on writes. It never exposes arbitrary project files or credentials. Do not reverse-proxy or share the local dashboard on the internet. Public site checks are HTTP-only and do not generate GA visits or affiliate clicks.

Run tests: `node --test admin-console/*.test.mjs`. Run manually: `node admin-console/server.mjs`.
