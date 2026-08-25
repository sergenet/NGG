# Stage 0 asset classification

Date: 2026-08-25

This inventory classifies the repository-root folders and executable scripts. It is a retention and safety map, not permission to delete reference material.

## Current source of truth

- `src/`: Next.js pages, components, and canonical catalog/editorial data.
- `public/`: static assets copied into the export, including the subscriber API/config supplied by the host.
- `content-ideas/`: maintained editorial planning inputs.
- `traffic-data/`: audit, measurement, and stage evidence.
- `scripts/validate-catalog.mjs`, `scripts/build-traffic-report.mjs`, `scripts/validate-monetization.mjs`: current quality/reporting tools.
- `engine/sitemap_generator.py`, `engine/rss_generator.py`, `engine/generate_pinterest_feed.py`, `engine/utils.py`: the only current engine helpers; they post-process the Next.js export and do not build the site.
- `upload_zip.py`: current FTP uploader. It uploads `out/`; running it is an explicit external deployment action.
- root configuration: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`, `.vercelignore`, `.env.example`, `README.md`, and `AGENTS.md`.

## Generated or dependency material

- `.next/`, `out/`, `node_modules/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `__pycache__/`, `tmp/`, and `scratch/`.
- `.deploy-manifest.json` is generated operational state and is deliberately ignored.
- build/deploy logs and reports at the root (`build_output.txt`, `deploy_*.txt`, `deploy_latest.log`, `filelist.txt`, `broken*.json`, `broken_links.txt`, `full_link_report.json`, `master_broken_list.json`, and `updated_asins.json`) are generated evidence, not source.

## Secret-bearing or local operational material

- `.env.local` and `social_config.json` are local secret-bearing files and are ignored by Git.
- `post_history.json`, `social_autopost*.log`, and `link_repair.log` are local operational history.
- `.vscode/` and `.vercel/` are local tool state.
- No credential-bearing filename identified above is tracked in the Stage 0 baseline.
- Any credential previously pasted into a document, log, or third-party service must be rotated externally if exposure is suspected; Stage 0 does not display or copy credential values.

## Reference-only material

- `assets_old/`, `public_old/`, `templates_old/`, `categories/`, `content/`, `data/`, `design-system/`, `google search/`, `homepage/`, `senior-directory/`, `seo/`, and `site-structure/` preserve the pre-rebuild site, research, or design references.
- Root `.docx`, `.pdf`, `.txt`, `.html`, `.zip`, `.mp4`, `.jpg`, and `.bak` files are authoring, audit, media, or historical references. They are not part of the build unless copied into `public/`.
- The root checklist PDF is a relevant author/reference copy; `public/downloads/2026-gadget-buyers-checklist.pdf` is the current downloadable source asset.

## Legacy and quarantined executables

These entry points are obsolete and now fail immediately with a Stage 0 retirement message:

- `engine/build.py` and `refresh_site.ps1` (pre-Next Python builder);
- `engine/auto_affiliate_updater.py`, `engine/auto_link_repair.py`, and `engine/sync_to_nextjs.py` (closed Amazon-era catalog mutation);
- `social_autopost.py`, `run_autopost.bat`, and `scripts/run_daily_post.ps1` (closed Amazon-era product autoposting);
- `setup_automation.bat` and `setup_social_autopost.bat` (obsolete scheduled-task installers).

Other root Python/PowerShell/batch utilities—including `add_dummy_vendors.py`, audit/check/find/get/test/update/migrate/optimize scripts, Pinterest helpers, and `weekly_kpi_report.py`—are retained as reference-only or removable-later utilities. They are not invoked by `npm run build` or an enabled scheduled task. Amazon repair/suggestion scripts under `scripts/` are manual reference-only tools and must not be used while the closed Store ID remains retired.

## Removable later, after a separate review

Generated logs/reports, duplicate legacy folders, temporary extraction folders, old screenshots/videos, one-off diagnostic scripts, and obsolete deployment notes may be removed in a later cleanup. They remain untouched now because Stage 0 prioritizes recoverability and because some may contain useful provenance.

## One authoritative workflow

1. Edit maintained content and code only in `src/`, `public/`, `content-ideas/`, and current configuration/scripts.
2. Run `npm run check`.
3. Run `npm run build`. This validates data, performs the Next.js static export to `out/`, generates the sitemap and RSS, and removes the inaccurate Pinterest merchant feed.
4. Inspect and compliance-scan the complete `out/` tree.
5. Only after explicit user approval, run `powershell -File scripts/deploy_to_namecheap.ps1`, which rebuilds and calls `upload_zip.py` to FTP-sync `out/`.
6. Verify the remote command result, live HTTP pages, canonical tags, sitemap, and expected content before claiming deployment success.

The legacy Python builder, `public_old/`, and the reference folders are not inputs to this workflow.
