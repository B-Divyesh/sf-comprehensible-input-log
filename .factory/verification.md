# Independent verification — PASS

**Work order:** `comprehensible-input-log-verify-1`  
**Candidate:** `8f5363084562f7e4f369392e264c8b6f0792f1b6` (`8f53630`)  
**Live URL:** https://comprehensible-input-log.sociobot.in  
**Verified:** 2026-08-28

## Verdict

**PASS.** The requested candidate is deployed, byte-for-byte matches the fresh production build, and satisfies the researched job: a learner can keep a private cross-source input log, rate subjective comprehension, record recurring words, see a trend and next-source target, and export/import local data. No blocking functional, privacy, accessibility, PWA, or performance defect was found.

The non-blocking P3 observations below are deployment/data-validation hardening items, not reasons to withhold this candidate.

## Reproducible local evidence

I cloned `/work/repo` with `--no-local`, detached it at the exact candidate into `/tmp/comprehensible-input-log-qa`, and ran the checks there. The checkout was clean before installation.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 67 packages audited, 0 vulnerabilities |
| `npm test` | Passed: 5/5 Vitest tests |
| `npm run build` | Passed; includes `tsc --noEmit`; generated `dist/` |
| explicit `npx tsc --noEmit` | Passed |
| `npm run test:e2e` | Passed: 5 browser tests, 3 intentional mobile/shared-worker skips |
| lint | No lint script or linter dependency is declared in `package.json` |
| Lighthouse 12.8.2, mobile/local production preview | Performance 93, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.5 s, TBT 300 ms, CLS 0 |

The built app shell is 47,515 bytes (15,300 gzip): 28,804 bytes inline JS and 17,990 bytes inline CSS, both below the static-product budgets. The responsive mobile hero is 16,888-byte AVIF / 28,542-byte WebP, below 300 KB; no external fonts are loaded.

## Independent product exercise

On the production build I separately exercised the brief’s core flow and recovery paths, beyond the repository’s supplied tests:

- Empty journal → keyboard-opened log sheet → validation error and focus recovery (empty title/amount/rating), then saved a normal observation at the minimum amount (1).
- Confirmed the one-observation trend state; imported four book/podcast/video/article observations spanning ratings 2–5, a stopped session, and repeated words. The trend rendered “Trending more understandable,” counted 3 of 4 sessions complete, and derived the repeated-word summary and next-source guidance.
- Edited, persisted on reload and after closing/reopening the final tab, cancelled a specifically named delete confirmation, and exercised the maximum UI amount (10,000).
- Rejected an incomplete JSON backup without replacing the current log; accepted a valid versioned import only after the replacement confirmation. JSON and CSV downloads work; CSV formula-like content is prefixed with an apostrophe.
- Confirmed no automatic transcription, certification, hosted content, account, or upload claim is made; ratings are visibly described as personal observations rather than proficiency scores.

## Browser, accessibility, privacy, and PWA evidence

- Fresh desktop (1440px) and 390px mobile live loads: HTTP 200, one `<h1>`, `<main>`, `<html lang="en">`, title, meaningful hero alt text, zero horizontal overflow, and zero console/page errors.
- Browser request capture on both live viewports found only `https://comprehensible-input-log.sociobot.in`; no analytics, tracking, CDN font/script, media upload, or third-party request. Storage is browser IndexedDB (`comprehensible-input-log`), and the rendered privacy page accurately describes that boundary.
- Axe found zero serious/critical issues for empty, dialog, and populated trend states. Separate light and dark Axe runs had zero violations. Keyboard smoke testing reached the visible skip link and controls by Tab; the ring is a 3px ochre outline. Enter opened the sheet, focus moved to the title, and Escape closed it. At 390px the sheet had no horizontal overflow. Reduced-motion mode reduced transition/animation durations to 0.01ms.
- Offline: the supplied production E2E test installed the worker, set the context offline, reloaded successfully, and showed the offline status while retaining IndexedDB data.
- Update: an independent static test server first served SW `input-log-v1.0.3`, then a changed `v1.0.4` worker. `registration.update()` displayed “A fresh field guide is ready”; **Update now** activated the worker and reloaded without browser errors. This verifies the update toast / `SKIP_WAITING` / `clients.claim` path rather than merely checking source text.
- The live manifest is parsed by Chromium without errors and contains standalone display, versioned start URL, matching colors, and 192/512 icons including maskable purpose.

## Deployment identity and response behavior

The live `/` response is exactly the candidate output: both live and local `dist/index.html` are 47,515 bytes with SHA-256 `81b90f925965aaa345f4692b829b37ac1462bc0a9c98dae848ef31723aa9a09f`. The live `manifest.webmanifest`, `sw.js`, `offline.html`, mobile hero WebP, and 192px icon also each hash-identically to `dist/`. Direct `/privacy` and `/terms` requests return the same SPA shell with HTTP 200.

Live responses provide HTTPS, HSTS (`max-age=10886400; includeSubDomains; preload`), `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`. Root, worker, manifest, hero, and legal page all return `Cache-Control: public, must-revalidate, max-age=30`; the service worker provides the repeat/offline cache behavior tested above.

## Defects / follow-up

### P3 — semantic date validation is incomplete for imported JSON

`validateImport` accepts a structurally date-shaped but impossible date such as `2026-99-99`, presents the replacement confirmation, and would replace a real local log with it. The regular form prevents future/invalid dates, and incomplete imports are correctly rejected. Tighten import validation to parse a real calendar date and reject future dates before permitting replacement.

### P3 — production response-policy/cache hardening

The host sends `manifest.webmanifest` as `application/octet-stream` (Chromium currently parses it without manifest errors), sends no Content-Security-Policy or Permissions-Policy, and applies only a 30-second browser cache to static images and icons. This does not break the product or its service-worker cache, but the deployment should serve the manifest as `application/manifest+json`, add a CSP compatible with the single-file app, restrict unused browser permissions, and use an appropriate longer cache policy for versioned/static assets.

