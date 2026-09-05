# Review 1 — FAIL

**Work order:** `comprehensible-input-log-review-1`
**Reviewed:** 2026-09-05
**Live URL:** <https://comprehensible-input-log.sociobot.in>
**Implementation candidate:** `185551263c62c8fb2e92c0084fe577fbac4800fd` (`1855512`, last product-source change)
**Documentation/test SHA:** `a05c6a1166a4e9bfb64375f2bc14e43ed2aea5c4`

## Verdict

**FAIL — 6 findings, including 3 P1 findings, and 10 untested public claims.**

The core local log works, but the live product does not provide the required
one-click, isolated sample experience, its public claims have no claims
registry or sandbox evidence, and its first screen does not state the learning
job in plain words. These are acceptance failures, not a product PASS.

The live root exactly matches a fresh build of the reviewed tree: SHA-256
`81b90f925965aaa345f4692b829b37ac1462bc0a9c98dae848ef31723aa9a09f` for both
live `/` and local `dist/index.html`. The application source is unchanged from
`1855512`; the later commits add tests and reports only.

## What was checked

- Opened the live page in fresh Chromium desktop (1440×1000) and phone
  (390×844) contexts. Both loaded HTTP 200 without console/page errors or
  horizontal overflow. Before scrolling, the visible heading was “Find input
  that fits today.” The user, job, and first action were not stated plainly:
  the eyebrow says “Your private field notebook” and the action is “Log your
  first source.”
- Searched the live DOM, routes, source, and documentation for a sample action
  and demo entry point. There is no “Try it with sample data” control, `/demo`,
  `?demo=1` behavior, persistent demo label, Reset demo, Start for real, demo
  storage namespace, or `.factory/demo.md`. The required sample-output/reset/
  real-data-isolation checks therefore could not be performed.
- In an isolated fresh browser context, logged a normal source, reloaded to
  confirm persistence, saved the amount boundaries 1 and 10,000, exercised
  blank-form validation and focus recovery, and tested invalid import recovery.
  The normal and boundary flows worked. Live Axe found zero violations in the
  populated Trends state. Keyboard Tab reached the designed 3px focus ring;
  reduced-motion durations were 0.00001s. An installed service worker reloaded
  the app offline and showed the offline status.
- Checked `/`, `/privacy`, `/terms`, `/404`, and an unknown URL in fresh
  contexts; checked links from the landing page; checked privacy traffic; and
  inspected live headers, manifest, static routes, and prior reports.
- From a clean no-local clone at `a05c6a1`, ran `npm ci` (0 vulnerabilities),
  `npm test` (5/5), `npm run build`, and `npm run test:e2e` (5 passed, 3
  documented skips). The repository declares no other test command. There is
  no `.factory/claims.json`, so there were no declared claim commands to run.

## Findings

### P1 — Required sample sandbox is absent

The app has no one-click sample entry point. The landing page only offers a
real-data “Log your first source” flow. No `/demo` or `?demo=1` route exists,
and no code or document establishes a separate `demo:` storage namespace,
sample label, reset, or explicit transition back to real data. A reviewer and
a cold visitor cannot see realistic populated output without creating actual
local observations, and cannot prove that samples never touch real data.

Required repair: add the documented demo route and first-screen “Try it with
sample data” action; seed realistic cross-media observations; show the
persistent “Demo — sample data, nothing is saved” label with Reset demo and
Start for real; keep demo data in a separate namespace; and add
`.factory/demo.md` plus sandbox tests.

### P1 — Public claims have no registry or observable sandbox tests

`.factory/claims.json` is absent and neither Vitest nor Playwright has an
`@claim:` test. The following 10 distinct public claims are therefore
untested under the required demo-only protocol: source-agnostic logging;
subjective ratings rather than proficiency scores; trend and next-source
guidance; browser-local persistence; offline use after first visit; JSON
backup; CSV export; confirmation before replacement import; no account or
analytics; and no uploads/hosted study media. Existing tests exercise a
manually-created real-context record, not the mandated demo entry point.

Required repair: register each claim with exactly one `@claim:<id>` observable
test that starts at the demo URL. Remove any claim that cannot be tested.

### P1 — First screen obscures the language-learning job

The homepage title is brand/mood copy (“Find input that fits today.”), while
“field notebook,” “field method,” and “observations” substitute metaphors for
the user’s task. Before scrolling, a learner is not plainly told that this is
a private log for books, podcasts, and videos where they record understanding
to choose the next suitable source. The primary action also does not say what
happens after it. The required copy audit is missing.

Required repair: replace the title with a ≤9-word job headline, name language
self-learners and the result in a ≤22-word sentence, use plain consistent
terms such as “input log” and “understanding,” put “Try it with sample data”
first with a nearby outcome, and add `.factory/copy-audit.md`.

### P2 — Route titles, metadata, sitemap, and 404 behavior are incomplete

All tested routes, including `/privacy` and `/terms`, retain the brand-only
title `Comprehensible Input Log`; the title does not name the job and legal
routes have no route-specific title. `index.html` lacks canonical, Open Graph,
Twitter-card, and apple-touch metadata. `/sitemap.xml` is 404. `/404` and an
unknown URL return HTTP 200 and silently render the journal instead of a
designed not-found page with a way back. This is an unexpected successful page,
not a deliberate HTTP 404.

Required repair: implement route-specific document titles and required
metadata, add a sitemap, and configure/render a real 404 route and response.

### P3 — JSON import accepts impossible calendar dates (prior finding remains)

The prior verification’s semantic-date finding is still present. Uploading a
structurally valid backup containing `date: "2026-99-99"` opens the replacement
confirmation (“The file contains 1 observation”), so it can overwrite valid
local history. `validateImport` checks only the `YYYY-MM-DD` shape.

Required repair: parse a real calendar date and reject future/impossible dates
before displaying import confirmation.

### P3 — Live response policy/cache hardening remains incomplete (prior finding remains)

The manifest is served as `application/octet-stream`; live HTML has no
Content-Security-Policy or Permissions-Policy; static assets use only
`Cache-Control: public, must-revalidate, max-age=30`. This repeats the prior
verification observation. Chromium currently parses the manifest and the app
works, but the response policy does not meet the expected production hardening.

Required repair: serve the manifest as `application/manifest+json`, add a CSP
and restrictive permissions policy compatible with the app, and apply suitable
long-lived cache headers to static/versioned assets.

## Earlier-review disposition

| Earlier finding | Current disposition | Evidence |
| --- | --- | --- |
| P3 semantic date validation | Still open | Live invalid-calendar backup reached replacement confirmation. |
| P3 response/cache hardening | Still open | Manifest MIME, absent CSP/Permissions-Policy, and 30-second cache observed live. |

## Passed checks and limits

The current real-data flow passed normal, invalid, boundary, persistence,
offline, desktop, phone, focus, reduced-motion, and populated-state Axe smoke
checks. The privacy request capture observed only same-origin HTML and hero
image requests. Landing-page Privacy and Terms links returned 200; legal pages
exist. No backend, tenant, rate-limit, or installed-artifact checks apply to
this static local-first PWA.

Those checks do not compensate for the missing demo isolation and claims
evidence. The update toast path was not rerun because the deployed application
assets exactly match the previously verified implementation and later commits
are documentation/test-only.

## Reproduce

```sh
git clone --no-local /work/repo /tmp/comprehensible-input-log-review-1
cd /tmp/comprehensible-input-log-review-1
git checkout a05c6a1166a4e9bfb64375f2bc14e43ed2aea5c4
npm ci
npm test
npm run build
npm run test:e2e
```
