# Stage 1 pre-deployment evidence

Prepared: 2026-08-25, Europe/Bucharest

Status: all local Stage 1 work and acceptance checks pass. Stage 1 is not complete because deployment and live verification require explicit user approval immediately before FTP upload.

## Completed work

- Replaced unsupported partnership performance, demographic, testing, social-service, and rate-card claims.
- Audited all 20 guides and 75 catalog products; corrected high-risk testing, health, ranking, outcome, reliability, durability, urgency, and promotional claims identified in the audit.
- Expanded editorial, sponsored-content, correction, privacy, affiliate, contact, and terms boundaries as applicable.
- Rebuilt the checklist as an evergreen, retailer-neutral source DOCX and downloadable PDF.
- Added `scripts/validate-truthmode.mjs` to the normal data, check, and build gates.
- Recorded every material changed or retained high-risk claim in `traffic-data/stage-1-claim-audit.md`.

## Document and PDF quality

- DOCX accessibility audit: 0 high, 0 medium, 0 low findings.
- The environment has no LibreOffice/`soffice`, so the DOCX could not be rendered to PNGs. It received structural, style, numbering, table-header, metadata, and accessibility checks; no claim is made that the DOCX passed visual rendering.
- PDF: 4 pages, generated from the same approved checklist content.
- PDF visual QA: all four pages rendered at 2x and inspected; no clipping, overlap, broken table, missing glyph, or unreadable text was found.
- Root, public-source, and `out` PDF SHA-256 match: `63232D8CCCC9A2D96291C0D745A54948E07C7FFAB66BC9EFFA12604CFD643B89`.

## Automated checks

| Check | Result |
|---|---|
| Catalog validation | PASS: 75 products, 75 unique routes, 69 Amazon offers suspended, closed Store ID absent |
| Truthmode validation | PASS: 20 guides, 75 products, and partnership claims checked |
| ESLint | PASS |
| TypeScript | PASS |
| Production build | PASS: 131 static HTML pages |
| Sitemap generation | PASS: 128 URLs |
| Editorial RSS | PASS: 34 items |
| Pinterest merchant-feed prevention | PASS |

## Complete exported-tree scan

| Scan | Result |
|---|---:|
| Closed Amazon Store ID | 0 hits |
| Amazon or amzn outbound destinations | 0 hits |
| Amazon-hosted images | 0 hits |
| Exact legacy unsupported claims | 0 hits |
| Sitemap URLs missing a corresponding local page | 0 |

## Representative exported-page inspection

The following exported pages contain the expected revised copy and correct self-canonical URL:

- `/work-with-us/`;
- `/editorial-policy/`;
- `/privacy/`;
- `/home-office/mx-master-3s-review-the-best-office-mouse/`;
- `/smart-home/roomba-vs-roborock-which-robot-vacuum-wins/`.

The checklist exists at `out/downloads/2026-gadget-buyers-checklist.pdf` and matches the reviewed public-source PDF byte for byte.

## Approval boundary

No FTP upload or live-site mutation has occurred in Stage 1. The next action is `powershell -File scripts/deploy_to_namecheap.ps1`, which rebuilds and synchronizes `out/` to the live host. This external publication action must not run until the user gives explicit approval after reviewing this evidence.

After an approved deployment, Stage 1 still requires live HTTP, content, canonical, sitemap, checklist-download, and all-sitemap-URL verification before the completion gate can close.
