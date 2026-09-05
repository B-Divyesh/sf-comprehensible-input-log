# Handoff — Comprehensible Input Log repair 1

**Completed:** 2026-09-05

**Live URL:** <https://comprehensible-input-log.sociobot.in>

**Implementation commits:** `14ec354d4ce1344cfeee19b0bc4a8af501bc410e` (demo, claims, copy, validation, metadata) and `95351aa` (real HTTP 404 routing)
**Documentation commit:** this handoff commit (made after the implementation commits above)

## What changed

- Added `/demo` and `?demo=1` support. It seeds four fictional, cross-media language sources and immediately shows a populated journal, trend, and next-source suggestion.
- Added the persistent **Demo — sample data, nothing is saved** banner with **Reset demo** and **Start for real**.
- Kept demo data isolated in IndexedDB database `demo:comprehensible-input-log`; real data remains in `comprehensible-input-log`. No demo record is read from or written to the real log.
- Rewrote the first screen in plain words. Its job is “Log language input you understand”; it names language self-learners and begins with **Try it with sample data**.
- Added 12 public claims in [`.factory/claims.json`](claims.json), each with one `@claim:` Playwright test that starts at `/demo`.
- Fixed import validation so impossible and future calendar dates are rejected before the replacement dialog.
- Added route-specific titles/descriptions/canonicals, Open Graph/Twitter metadata, an original 1200×630 social crop, `sitemap.xml`, improved robots metadata, and a designed 404 page. Valid SPA URLs are explicit rewrites; an unknown live URL returns HTTP 404 with the designed page.
- Added Static Web Apps response policy: manifest MIME type, CSP, Permissions-Policy, no-sniff/referrer headers, no-cache worker, and seven-day static asset caching.
- Updated the service-worker cache version and offline fallback copy. The build copies `staticwebapp.config.json` into `dist/`.
- Added the demo guide, copy audit, catalog description, and updated README/design provenance.

## Verification

From a clean dependency install (`npm ci`):

```sh
npm test
npm run test:e2e
npm run build
```

Results:

- `npm test`: 6/6 passed.
- `npm run test:e2e`: 32/32 passed across Chromium desktop and Pixel 5.
- Every command declared in `.factory/claims.json` passed separately (12 claim commands; each runs the one tagged demo test in desktop and phone projects).
- `npm run build`: passed; `dist/index.html` is 54.54 KB / 16.84 KB gzip. The initial inline application payload remains below the 200 KB JavaScript and 50 KB CSS budgets; no external scripts or fonts load.
- Local `verify-url.sh` against `/demo`: title, `lang`, one `h1`, `<main>`, image alt text, and console checks passed.
- Live `verify-url.sh` against `/demo`: the same checks passed with no console errors.
- Live fresh desktop (1440×1000) and phone (390×844) loads had no console errors or horizontal overflow. Before scrolling, both showed the job, audience, and **Try it with sample data** action.
- Live demo flow: started at 4 records, saved a fifth demo record, reset to 4, removed the temporary record, and returned with **Start for real** to an empty real log. Requests observed in the flow stayed same-origin.
- Live offline demo: after the first visit and service-worker activation, an offline reload showed the full four-record demo and the offline status.
- Live Axe via Playwright: 0 violations, including 0 serious/critical. The standalone `@axe-core/cli` could not launch because this worker has no system Chrome; the repository and live checks use Playwright’s installed Chromium instead.
- Live Lighthouse mobile on `/demo`: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.35 s and CLS 0.
- Live headers: `manifest.webmanifest` is `application/manifest+json`; CSP and Permissions-Policy are present; static assets use `Cache-Control: public, max-age=604800`; the unknown `/not-a-page` URL returns HTTP 404 and the designed page.

Evidence is in `/work/.evidence/comprehensible-input-log-repair-1-live/`, including fresh desktop/phone screenshots, browser results, demo isolation flow, offline result, Axe output, and Lighthouse JSON. The catalog description is copied to `/work/.evidence/catalog-description.txt`.

## Earlier findings disposition

| Earlier finding | Disposition | Current evidence |
| --- | --- | --- |
| Missing one-click sandbox | Resolved | `/demo`, first-screen action, sample banner, reset, real-data separation, `.factory/demo.md`, and live reset/isolation flow. |
| Missing claims registry/tests | Resolved | 12 registry entries and separately run `@claim:` browser checks. |
| Unclear first screen | Resolved | Plain job title, audience sentence, primary sample action, three facts, and `.factory/copy-audit.md`. |
| Route metadata/sitemap/404 | Resolved | Route titles/metadata, sitemap, social image, and live unknown-path HTTP 404. |
| Impossible import dates | Resolved | Calendar/future validation plus unit and browser recovery checks. |
| Response/cache hardening | Resolved | Live MIME, CSP, Permissions-Policy, no-cache worker, and static asset cache headers. |

## Run and deploy

```sh
npm ci
npm test
npm run test:e2e
npm run build
/opt/fleet/lib/deploy-static.sh comprehensible-input-log dist
```

The app is a static local-first PWA. It has no backend, tenant, rate-limit, or database migration path.

## Known limits

- Understanding bands remain subjective; they are not proficiency scores or language certification.
- Real data is browser-local. A JSON backup is the recovery and transfer path; cross-device sync is intentionally out of scope.
- The 404 response is for unknown URLs. `/404` is a directly viewable designed page but, as a named valid path, returns HTTP 200.
