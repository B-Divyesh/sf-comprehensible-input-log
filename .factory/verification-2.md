# Verify logging language input you understand — FAIL

**Work order:** `comprehensible-input-log-verify-2`  
**Verified:** 2026-09-05  
**Live URL:** <https://comprehensible-input-log.sociobot.in>  
**Implementation candidate:** `95351aa9e7db5fc12b6852698a51b779dda182d4`  
**Documentation SHA:** `355baf878013b9b32b30f9c65854880e845003b3`  
**Repository head inspected:** `987a85bce94bd12b5fb8ed05d4d2c05d8961ee35` (later Graphify-only factory record)

## Verdict

**FAIL — 5 findings, including 1 P1 and 4 P2 findings, with 3 untested public claims.**

The implemented job works and every declared claim command passes. Acceptance still fails because mandatory demo, claims, accessibility, and site-structure contracts have defects. A successful test command is not a product PASS.

## First screen before scrolling

Fresh desktop at 1440×1000 and phone at 390×844 both showed:

- Job: **“Log language input you understand”**
- Audience: **language self-learners choosing books, podcasts, and videos that fit their understanding**
- First action: **“Try it with sample data”**

All three were fully inside each initial viewport. The three facts were also visible. Screenshots are `live-desktop-first-screen.png` and `live-phone-first-screen.png` in the evidence directory.

## Findings

### P1 — Three public privacy and deletion claims are absent from the claims registry

The Privacy page makes three distinct promises that a visitor can rely on but that are not listed in `.factory/claims.json` and have no exact `@claim:` browser test:

1. The app has no advertising, tracking pixels, or server database, and entered log fields stay on the device.
2. Deleting a source removes it from local storage.
3. The service worker does not send log content while checking for updates.

The declared `no-account-analytics` test only asserts that requests are same-origin. The `no-media-uploads` test checks that saving a source makes no non-GET request. Those are useful checks but do not list or completely exercise the three quoted promises. Register each promise with an observable demo test or narrow the public copy.

### P2 — Leaving the demo does not discard edited demo data

The demo contract requires leaving demo mode to discard demo data unless the user explicitly chooses to keep it as real data. On the live site, I added **“Should be discarded on exit”**, selected **Start for real**, then reopened **Demo**. The custom record returned and the demo contained five records rather than the shipped four. Real data remained isolated, but the demo exit behavior is still non-compliant.

Clear or reseed the demo namespace when **Start for real** is used. A normal reload inside the demo may continue to preserve the current sample session.

### P2 — Skip and browser-history navigation lose focus and route announcements

The skip link receives a visible focus ring, but pressing Enter leaves `document.activeElement` on `BODY` instead of `#main`. A normal in-app Privacy navigation correctly focuses `#main` and announces the route. Browser Back to `/` then leaves focus on `BODY` and the polite live region empty. The `popstate` path renders the route without the focus and announcement work performed by `navigate()`.

Make skip activation focus `#main`. Apply the same focus, scroll, and live-region behavior after Back and Forward navigation.

### P2 — Five phone touch targets are smaller than 44×44 CSS pixels

At 390×844, measured visible targets below the required minimum were:

| Target | Measured size |
| --- | ---: |
| Home wordmark | 113×34 |
| Reset demo | 133×41 |
| Start for real | 144×41 |
| Footer Privacy | 45×19 |
| Footer Terms | 37×19 |

Give each control or link a minimum 44-pixel hit area without reducing the visible spacing between adjacent targets.

### P2 — The 404 response omits the required shared site structure

`/not-a-page-meta-check` correctly returns HTTP 404 with the designed **“This page was not found”** content and a working home link. The deliberate 404 itself is expected and is not a defect. The returned page has no shared header, navigation, footer, Privacy link, Terms link, or build identifier, although the site-structure contract requires the standard header and footer on every route. `/404` serves the same incomplete structure with HTTP 200.

Keep the real 404 status and design, but add the common header/footer skeleton and legal links.

## Clean candidate verification

I cloned `/work/repo` with `--no-local`, detached the clean checkout at the implementation candidate, and installed the documented prerequisites with `npm ci`.

| Command | Result |
| --- | --- |
| `npm ci` | Passed; 67 packages audited, 0 vulnerabilities |
| `npm test` | Passed, 6/6 |
| `npm run build` | Passed; `dist/index.html` generated |
| `npm run test:e2e` | Passed, 32/32 across desktop Chromium and Pixel 5 |

The production shell is 54,544 bytes: 33,458 bytes inline JavaScript and 19,174 bytes inline CSS. Both are below the product budgets.

## Declared claims

The registry has 12 unique IDs, 12 unique commands, and exactly one matching source tag for each ID. I ran every command separately from the clean candidate checkout. Each command passed its desktop and phone case, so no declared claim was left untested.

| Claim ID | Separate command result |
| --- | --- |
| `demo-isolation` | PASS, 2/2 |
| `source-agnostic-log` | PASS, 2/2 |
| `subjective-ratings` | PASS, 2/2 |
| `trend-guidance` | PASS, 2/2 |
| `browser-local-persistence` | PASS, 2/2 |
| `offline-reload` | PASS, 2/2 |
| `json-backup` | PASS, 2/2 |
| `csv-export` | PASS, 2/2 |
| `import-confirmation` | PASS, 2/2 |
| `free-no-account` | PASS, 2/2 |
| `no-account-analytics` | PASS, 2/2 |
| `no-media-uploads` | PASS, 2/2 |

The report’s `untested_claim_count` is 3 because the additional public claims in finding 1 are not declared.

## Live functional evidence

- The one-click demo opened with four realistic German and Spanish podcast, book, video, and article records. The banner, **Reset demo**, and **Start for real** remained visible on Log, Trends, and reload.
- A real record at the maximum amount of 10,000 persisted after reload. It was absent from the demo. A demo-only minimum amount of 1 saved, reset removed it, and returning to the real log restored only the real record.
- Distinct IndexedDB databases `comprehensible-input-log` and `demo:comprehensible-input-log` were present. Sample actions did not alter real data.
- Blank required fields were rejected with the title focused. Impossible `2026-99-99` and future `2999-01-01` imports were rejected before confirmation, and the existing record remained. The named delete confirmation could be cancelled without data loss.
- The installed live demo reloaded offline with all four sample records and the offline status. A local production-server update test changed the worker cache version, showed **“An app update is ready”**, activated **Update now**, and reloaded without errors.
- Requests observed through the real/demo flow were same-origin GET/HEAD requests. No external script, font, account, analytics, upload, or payment request appeared. No backend, tenant, rate-limit, restart-persistence, or SQLite server check applies to this static local-first PWA.

## Accessibility, routes, privacy, and performance

- Playwright Axe reported zero violations in light and dark demo states and in the open source dialog. Escape closed the dialog; dialog focus began on the title; reduced-motion animation duration was effectively zero; 200% text retained content without page-level horizontal overflow.
- The supplied `verify-url.sh` passed on live `/demo`: title, `lang`, one `h1`, `<main>`, image alt text, labeled buttons, and zero console/page errors.
- `/`, `/demo`, `/privacy`, and `/terms` each returned 200 with distinct titles, descriptions, canonicals, one `h1`, header, navigation, main, footer, legal links, and build ID. All discovered internal links returned 200. The expected console resource message on a deliberate HTTP 404 was not classified as a defect.
- Live CSP, Permissions-Policy, no-sniff/referrer headers, manifest MIME, and seven-day asset caching were present. The manifest, icons, robots file, and sitemap were valid and reachable.
- Live Lighthouse mobile on `/demo`: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.93 s, LCP 1.35 s, TBT 78 ms, CLS 0.
- Live `index.html`, `manifest.webmanifest`, `sw.js`, `offline.html`, and the responsive hero asset hash-match the clean candidate build. The root SHA-256 is `6cb0d3df51ff0364b1998b522fff6e6ef02f6e171972f5f912981b74acf869bf`.

## Earlier findings disposition

| Earlier finding | Current disposition | Evidence |
| --- | --- | --- |
| Missing one-click sandbox | Resolved for entry, sample, reset, and real-data isolation | Live first action, four records, banner, reset, two IndexedDB namespaces; demo-exit retention is a new finding |
| Missing claims registry/tests | Resolved for 12 declared claims; incomplete for 3 additional public claims | 12 separate commands pass; finding 1 records the remaining coverage gap |
| Unclear first screen | Resolved | Job, audience, action, and three facts are visible before scrolling on desktop and phone |
| Route metadata, sitemap, and real 404 | Resolved for status and metadata; 404 skeleton incomplete | Distinct live metadata and HTTP 404 pass; finding 5 records missing shared structure |
| Impossible/future import dates | Resolved | Unit, browser, and independent live checks reject both before confirmation |
| Manifest MIME, CSP, permissions, and caching | Resolved | Live response headers and MIME/cache checks pass |

## Other scope checks

The product does not need an AI action for its stated job. Import/export is present, and cross-device sync remains an explicit non-goal for this local-first product. No missed-leverage finding was recorded.

Evidence is in `/work/.evidence/comprehensible-input-log-verify-2/` and the required report copy is `/work/.evidence/qa-report.md`.
