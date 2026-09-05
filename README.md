# Comprehensible Input Log

## Log language input you understand

For language self-learners who want books, podcasts, and videos that fit their understanding.

Live: https://comprehensible-input-log.sociobot.in
Try the sample: https://comprehensible-input-log.sociobot.in/demo

## What it does

- Log books, podcasts, videos, articles, and other language sources.
- Rate understanding as a personal observation, not a proficiency score.
- See an understanding trend and a next-source suggestion.
- Keep source entries in this browser after a reload.
- Work offline after the first visit.
- Export the input log as a JSON backup or CSV.
- Preview an import before it replaces the current log.
- Try the log for free without an account.
- Send no account or analytics requests.
- Do not upload or host study media.

## Demo sandbox

The first-screen **Try it with sample data** link opens `/demo` with four fictional sources. The persistent demo banner can reset those records or start a real log. Sample data stays separate from the real log. See [`.factory/demo.md`](.factory/demo.md) for its sample, reset behavior, and IndexedDB namespaces.

## Run locally

Requires a current Node.js release and npm.

```sh
npm ci
npm run dev
```

Open the URL Vite prints. Use `/demo` for the sample log.

## Test and build

```sh
npm test
npm run test:e2e
npm run build
npm run preview
```

Run every declared claim command from a clean checkout:

```sh
node -e "const c=require('./.factory/claims.json'); for (const x of c) console.log(x.test)"
```

Copy each printed command into the shell. The browser tests use Playwright 1.58.2. Run `npx playwright install chromium` if Chromium is missing outside the factory worker.

The deployment build command is `npm run build`. Publish `dist/` as a static site. [`staticwebapp.config.json`](staticwebapp.config.json) provides explicit SPA route rewrites, a designed 404 response, MIME type, cache policy, and response headers for Static Web Apps.

## Data and privacy

Real entries use the browser IndexedDB database `comprehensible-input-log`. Demo entries use `demo:comprehensible-input-log`. Clearing site data, private browsing, or uninstalling the PWA can remove local entries. Keep a JSON backup when the history matters.

## Design and provenance

The researched scope is in [`.factory/brief.json`](.factory/brief.json). The visual system and image provenance are in [`.factory/design.md`](.factory/design.md). The repair handoff is in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT — see [LICENSE](LICENSE).
