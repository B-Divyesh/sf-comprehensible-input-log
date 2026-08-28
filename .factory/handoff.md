# Handoff — Comprehensible Input Log v1

## Independent verification — 2026-08-28 — PASS

Candidate `8f5363084562f7e4f369392e264c8b6f0792f1b6` was independently verified from a clean detached clone and against https://comprehensible-input-log.sociobot.in. The live root HTML (47,515 bytes, SHA-256 `81b90f925965aaa345f4692b829b37ac1462bc0a9c98dae848ef31723aa9a09f`) and sampled PWA assets exactly match the candidate build.

- Passed: `npm ci` (0 audit vulnerabilities), `npm test` (5/5), `npm run build`, explicit TypeScript check, and `npm run test:e2e` (5 passed; 3 intentional skips). No lint command exists in this repository.
- Independently exercised normal, minimum (1), maximum (10,000), invalid/recovery, edit, delete-cancel, persistence-after-tab-close, trend/target, export/import, and CSV formula-safety paths.
- Live desktop and 390px mobile had no console/page errors or horizontal overflow; all observed traffic was same-origin. Axe found zero serious/critical issues; keyboard focus, dialog Escape, reduced motion, offline reload, and the service-worker update toast/activation path passed.
- Lighthouse 12.8.2 mobile against the production preview: Performance 93, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s and CLS 0.

See [`.factory/verification.md`](verification.md) for exact commands, evidence, headers, and two non-blocking P3 follow-ups: semantic invalid dates can pass JSON import validation, and production headers/cache policy could be hardened.

## What shipped

- A complete Vite + TypeScript offline PWA for logging language input from books, podcasts, videos, articles, and other sources.
- IndexedDB persistence for title, language, date, source type, minutes/pages, one of five subjective understanding bands, up to three recurring words, completion/abandonment, and an optional short note.
- Add, edit, validated save, specific delete confirmation, empty/error/offline states, and immediate status announcements.
- A source-agnostic journal, comprehension trend chart with text alternative, recent-pattern summary, completed/stopped summary, recurring-word summary, and a concrete next-source target based on the latest four observations.
- Versioned JSON backup/import with schema validation and replacement confirmation, plus formula-safe CSV export.
- Install manifest with 192px/512px maskable icons; versioned service worker with precached single-file app shell, cache-first assets, navigation fallback, cache cleanup, `clients.claim`, and an in-app update prompt.
- Local privacy and terms views, no account, analytics, external fonts/scripts, API, or media upload.
- A responsive botanical field-guide system, light/dark treatments, reduced-motion behavior, hand-authored SVG marks, and an original generated/optimized hero illustration. Provenance is in `.factory/design.md` and `assets/src/field-notes-hero.json`.

## Run and deploy

```sh
npm install
npm test
npm run test:e2e
npm run build
```

The required build command is `npm run build`. Output is `dist/`, with `dist/index.html` at its root. Deploy as a static SPA and route unknown paths to `index.html` for direct `/privacy` and `/terms` access.

## Verification — 2026-08-27

- `npm test`: 5/5 unit tests passed.
- `npm run test:e2e`: 5 passed, 3 intentional cross-project skips. The complete add/edit/save/reload/trends path ran on desktop Chromium and a Pixel 5 profile; JSON import/export was also exercised. Axe serious/critical coverage and offline reload each run once on Chromium to avoid duplicate shared-origin service-worker checks.
- `npm run build`: passed. App shell is one 47.5 KB HTML file, 15.3 KB gzip. There is no initial external JS or CSS payload; the inline JS portion is about 28 KB raw and CSS about 18 KB raw. Mobile hero derivatives are 20 KB AVIF / 28 KB WebP; desktop derivatives are 68 KB / 120 KB.
- Playwright console smoke check at 1440×1000 and 390×844: one `<h1>`, zero console/page errors, no horizontal layout loss.
- Offline test: after one online load, `context.setOffline(true)` + reload served the full app and displayed the offline status. Existing IndexedDB observations remain usable.
- Axe: zero serious or critical violations on the empty journal and modal form.
- Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100. FCP 0.8 s, LCP 1.5 s, TBT 100 ms, CLS 0.
- `npm audit`: zero known vulnerabilities.

## Known constraints and next steps

- Understanding bands are intentionally subjective and must not be interpreted as proficiency or certification.
- Data is device/browser-local. Cross-device sync is deliberately out of scope; JSON is the transfer and recovery path.
- Trend direction becomes meaningful after four observations and uses a deliberately transparent comparison of the earlier and later halves.
- A production static host must provide SPA fallback for direct legal-page URLs and should serve the already versioned images with long-lived cache headers. The service worker handles repeat/offline visits independently.
- Useful future work, if user evidence supports it: filters by language and media type, non-destructive merge import, and user-configurable target session size.
