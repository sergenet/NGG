# Stage 0 completion evidence

Completed: 2026-08-25, Europe/Bucharest

Result: PASS. Stage 0 is complete; Stage 1 is now the next eligible stage but has not started.

## 1. Captured state and recoverability

- Initial evidence: `traffic-data/stage-0-initial-state.md`.
- Starting point: `master` at `1b690cc79a6ee438be53ba9c10640afc37e3b501`, with a heavily modified/untracked rebuilt site.
- Recoverable working branch: `codex/ngg-stage-0-baseline`.
- Rebuilt-source baseline commit: `6e14d92` (`chore: capture rebuilt NGG baseline`).
- Legacy-automation safety commit: `1cba33d` (`safety: retire legacy NGG automation`).
- Current export-helper recovery commit: `b7bc0a0` (`build: track current export helpers`).
- Existing unrelated and reference files were preserved.

## 2. PDF disposition

- Preserved the relevant author/reference PDF at the root and the current site PDF in `public/downloads/`; the build regenerated/preserved its `out/downloads/` copy.
- Deleted two temporary audit-render PNGs and one redundant ignored extraction PDF. No unique downloadable content was removed.
- Exact disposition and recoverability warning are recorded in `traffic-data/stage-0-initial-state.md`.

## 3. Scheduled-task shutdown

All five identified tasks were disabled and verified with Windows Task Scheduler:

| Task | Verified state | Enabled |
|---|---|---|
| `NewGiftsAndGadgets_ASIN_Updater` | Disabled | False |
| `NewGiftsAndGadgets_LinkRepair` | Disabled | False |
| `NewGiftsAndGadgets_MasterAutomation` | Disabled | False |
| `NewGiftsAndGadgets_SocialAutopost` | Disabled | False |
| `NGG-SocialAutopost` | Disabled | False |

This change is reversible in Task Scheduler, but the obsolete scripts are also guarded so an accidental manual launch cannot mutate or publish the site.

## 4. Legacy quarantine and source of truth

- Amazon catalog updater, Amazon link repair, legacy catalog sync, legacy Python builder, product affiliate autoposter, their runners, and their task-install scripts now fail immediately with a retirement message.
- Direct smoke tests of `engine/auto_affiliate_updater.py` and `social_autopost.py` each returned exit code 1 before performing work.
- Full classification and the only authorized build/deploy workflow are recorded in `traffic-data/stage-0-asset-classification.md`.
- The maintained path is `src` + `public` → `npm run build` → `out` → approval-gated `upload_zip.py` FTP sync.
- Legacy `engine/build.py`, `public_old/`, and reference folders are not build inputs. Only sitemap/RSS/feed-removal helpers in `engine/` are called after the Next.js export.

## 5. Credential boundary

- `.env.local`, `social_config.json`, and `.deploy-manifest.json` are ignored local/operational files.
- Git reported zero tracked files matching those sensitive filenames.
- No credential values were displayed or copied.
- External credential rotation remains appropriate if the owner knows a credential was previously exposed; no exposure was inferred merely from the files existing locally.

## 6. Acceptance checks

| Check | Result | Evidence |
|---|---|---|
| `npm run check` | PASS | Catalog validation: 75 products and 75 unique routes; 69 Amazon offers suspended; closed Store ID absent. ESLint and TypeScript passed. |
| `npm run build` | PASS | Next.js 16.2.4 compiled; 131 static pages generated. |
| Sitemap generation | PASS | 128 URLs written to `out/sitemap.xml` and synced to `public/sitemap.xml`. |
| RSS generation | PASS | 34 editorial gift/guide items generated. |
| Merchant feed prevention | PASS | Pinterest merchant feed remained disabled; no stale feed existed. |
| Complete `out` closed Store ID scan | PASS | 0 hits. |
| Complete `out` Amazon destination scan | PASS | 0 `href`/`action` destinations on Amazon or amzn domains. |
| Complete `out` Amazon-hosted image scan | PASS | 0 Amazon-hosted `src`/`srcset` images. |
| Obsolete task state | PASS | Five of five tasks verified Disabled / Enabled=False. |
| Accidental legacy execution | PASS | Representative Amazon updater and autoposter guards both stopped with exit code 1. |

## Gate decision

Every Stage 0 required action and acceptance test is complete. Stage 1 is unlocked but remains not started. No FTP upload, live-site mutation, email, vendor contact, or other external publication occurred during Stage 0.
