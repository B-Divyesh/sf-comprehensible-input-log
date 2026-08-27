# Comprehensible Input Log

A private, source-agnostic field notebook for language learners. Log a book, podcast, video, article, or other source; record how much felt understandable; note up to three recurring unknown words; and use the trend and next-source target to choose material with less guesswork.

The app is not a proficiency test and does not assign language levels. Ratings are personal observations. It does not upload or host study media.

Live: https://comprehensible-input-log.sociobot.in

## What it includes

- Offline-first installable PWA with IndexedDB persistence
- Add, edit, and confirmed-delete flows for observations
- Duration in minutes or pages, finished/stopped status, optional language and notes
- Five plain-language comprehension bands with calibration ranges
- Trend chart with a text equivalent and simple recent-pattern interpretation
- Practical next-source target based on the latest four observations
- Complete JSON backup/import and spreadsheet-friendly CSV export
- Local `/privacy` and `/terms` pages; no account, tracking, third-party scripts, or CDN fonts
- Responsive light/dark botanical field-guide design with reduced-motion support

## Run locally

Requires a current Node.js release and npm.

```sh
npm install
npm run dev
```

Open the URL Vite prints. Data is specific to that browser origin.

## Test and build

```sh
npm test          # unit tests
npm run test:e2e  # Playwright: desktop, mobile, axe, offline
npm run build     # reproducible production output in dist/
npm run preview   # serve dist locally
```

The exact deployment build command is `npm run build`; publish `dist/` as a static site with SPA fallback to `index.html` so direct visits to `/privacy` and `/terms` resolve correctly. No environment variables or server are required.

The browser tests pin Playwright 1.58.2 and expect its Chromium build to be available. Run `npx playwright install chromium` if needed outside the factory worker.

## Data ownership

Observations live only in the browser’s IndexedDB database named `comprehensible-input-log`. JSON exports are versioned and suitable for full restoration; importing shows a count preview and atomically replaces the current local log after confirmation. CSV is intended for analysis, not restoration.

Clearing site data, using ephemeral/private browsing, or uninstalling the PWA may remove local observations. Keep JSON backups when the history matters.

## Design and provenance

The researched scope is in [`.factory/brief.json`](.factory/brief.json), the product-specific visual system and generated-asset provenance are in [`.factory/design.md`](.factory/design.md), and verification notes are in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT — see [LICENSE](LICENSE).
