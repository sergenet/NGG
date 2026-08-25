# Stage 0 initial state

Captured: 2026-08-25, Europe/Bucharest

## Repository

- Repository root: `C:\newgiftsandgadgets.com`
- Starting branch: `master`
- Starting commit: `1b690cc79a6ee438be53ba9c10640afc37e3b501`
- Working tree: heavily modified and untracked; current rebuilt site is not recoverably represented by the starting commit.

## Current production artifacts

- Local deploy manifest: `.deploy-manifest.json`
- Local static export: 1,200 files, including 131 HTML files.
- Live sitemap: 128 URLs.
- Live sitemap SHA-256 at capture: `26B129C1B3718137946FE997B6FF2B74BB0FC13AB2EB364AEC9E456CEAF9481A`

## Scheduled tasks before Stage 0 disable operation

| Task | State | Action | Last run | Last result | Next run |
|---|---|---|---|---:|---|
| `NewGiftsAndGadgets_ASIN_Updater` | Ready / enabled | `python c:\newgiftsandgadgets.com\engine\auto_affiliate_updater.py` | 2026-08-25 04:00 +03:00 | 2147942402 | 2026-08-26 04:00 +03:00 |
| `NewGiftsAndGadgets_LinkRepair` | Ready / enabled | `python c:\newgiftsandgadgets.com\engine\auto_link_repair.py` | 2026-08-24 04:00 +03:00 | 2147942402 | 2026-08-26 04:00 +03:00 |
| `NewGiftsAndGadgets_MasterAutomation` | Ready / enabled | `C:\Python314\python.exe c:\newgiftsandgadgets.com\engine\auto_affiliate_updater.py` | 2026-08-24 04:00 +03:00 | 1 | 2026-08-26 04:00 +03:00 |
| `NewGiftsAndGadgets_SocialAutopost` | Ready / enabled | `cmd /c "c:\newgiftsandgadgets.com\run_autopost.bat"` | 2026-08-25 08:30 +03:00 | 0 | 2026-08-26 08:30 +03:00 |
| `NGG-SocialAutopost` | Ready / enabled | `c:\newgiftsandgadgets.com\run_autopost.bat` | 2026-08-25 09:00 +03:00 | 0 | 2026-08-26 09:00 +03:00 |

Task result `0` for the social wrapper does not mean posting succeeded. The child logs show Pinterest HTTP 401 and missing X credentials.

## PDF and audit-render disposition

Preserved because they are part of the current site or its source history:

- root authoring/reference PDF: `2026 GADGET BUYER'S CHECKLIST.pdf`;
- public source asset: `public/downloads/2026-gadget-buyers-checklist.pdf`;
- generated deploy copy: `out/downloads/2026-gadget-buyers-checklist.pdf`.

Deleted as irrelevant/redundant under the user's authorization:

- `tmp/pdfs/checklist-1.png`;
- `tmp/pdfs/checklist-2.png`;
- ignored legacy extraction duplicate `temp_extract/guides/2026-gadget-buyer-checklist.pdf`.

The deleted PDF was a redundant ignored extraction copy. The same current checklist remains preserved in the root, `public/downloads`, and generated `out` locations. The two PNGs were temporary audit renders. These deletions are not recoverable from Git, but no unique site content was removed.
