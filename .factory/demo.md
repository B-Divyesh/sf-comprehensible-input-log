# Demo sandbox

## URL

Open [https://comprehensible-input-log.sociobot.in/demo](https://comprehensible-input-log.sociobot.in/demo), or use `/demo` on a local preview. The home page also has a first-screen **Try it with sample data** link.

## Sample

The demo starts with four fictional, realistic language-input sources: a German podcast, a Spanish short book, a Spanish video, and a Spanish news article. They include subjective understanding bands, repeated words, completion status, and notes so the journal, trend, next-source suggestion, export, and import paths are populated immediately.

## Isolation and reset

Demo records use the separate IndexedDB database `demo:comprehensible-input-log`. Real records use `comprehensible-input-log`. The demo never reads or writes the real database.

The persistent **Demo — sample data, nothing is saved** banner has **Reset demo**, which restores the four shipped records in the demo database, and **Start for real**, which switches to the empty or existing real log. Leaving demo does not copy sample records to the real log.

## Verification

Every public claim in [`claims.json`](claims.json) starts from `/demo` in a fresh Playwright browser context. The offline claim uses its own context, installs the service worker, then reloads the demo while offline.
