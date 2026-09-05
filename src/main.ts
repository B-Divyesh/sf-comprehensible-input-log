import './style.css';
import { average, LEVELS, levelLabel, nextTarget, trend } from './metrics';
import { freshDemoEntries } from './demo';
import { deleteEntry, getEntries, isValidEntryDate, replaceEntries, saveEntry, setStorageNamespace, validateImport } from './storage';
import type { ExportFile, LogEntry, SourceType } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
let entries: LogEntry[] = [];
let activeView: 'journal' | 'trends' = 'journal';
let editingId: string | null = null;
let deleteId: string | null = null;
let pendingImport: LogEntry[] | null = null;

type Route = 'home' | 'demo' | 'privacy' | 'terms' | 'not-found';

const routeDetails: Record<Route, { title: string; description: string }> = {
  home: { title: 'Comprehensible Input Log — Choose language input', description: 'Log language input you understand and choose the next book, podcast, or video that fits.' },
  demo: { title: 'Demo — Comprehensible Input Log', description: 'Try a private sample language input log with realistic books, podcasts, videos, and trends.' },
  privacy: { title: 'Privacy — Comprehensible Input Log', description: 'Learn how Comprehensible Input Log keeps your language input log on this device.' },
  terms: { title: 'Terms — Comprehensible Input Log', description: 'Read the terms for using Comprehensible Input Log.' },
  'not-found': { title: 'Page not found — Comprehensible Input Log', description: 'Return to the Comprehensible Input Log home page.' },
};

const icons: Record<string, string> = {
  sprout: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21v-9m0 1c-4 0-7-2-7-6 4 0 7 2 7 6Zm0 3c4 0 7-2 7-6-4 0-7 2-7 6Z"/></svg>',
  book: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Zm16 0A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></svg>',
  podcast: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="9" r="3"/><path d="M8 21v-3a4 4 0 0 1 8 0v3M5.6 14.5a8 8 0 1 1 12.8 0"/></svg>',
  video: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></svg>',
  article: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6V3Z"/><path d="M14 3v5h5M9 12h7M9 16h7"/></svg>',
  other: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 19h16M6 16l3-9 3 7 2-4 4 6"/></svg>',
};

function escapeHtml(value: string): string {
  const el = document.createElement('div');
  el.textContent = value;
  return el.innerHTML;
}

function currentRoute(): Route {
  if (location.pathname === '/privacy') return 'privacy';
  if (location.pathname === '/terms') return 'terms';
  if (location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1') return 'demo';
  if (location.pathname === '/' || location.pathname === '/index.html') return 'home';
  return 'not-found';
}

function isDemo(): boolean {
  return currentRoute() === 'demo';
}

function updateDocumentMeta(route: Route): void {
  const details = routeDetails[route];
  document.title = details.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = details.description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `${location.origin}${location.pathname}`;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = details.title;
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')!.content = details.description;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')!.content = details.title;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')!.content = details.description;
}

function shell(content: string, route: Route = 'home'): string {
  const appRoute = route === 'home' || route === 'demo';
  return `
    <header class="site-header">
      <a class="wordmark" href="/" data-route aria-label="Comprehensible Input Log home">
        <span class="seal">${icons.sprout}</span><span>Input Log</span>
      </a>
      <nav aria-label="Primary">${appRoute ? `<button class="nav-tab ${activeView === 'journal' ? 'is-active' : ''}" data-view="journal">Log</button><button class="nav-tab ${activeView === 'trends' ? 'is-active' : ''}" data-view="trends">Trends</button>` : '<a class="nav-link" href="/" data-route>Log</a>'}<a class="nav-link ${route === 'demo' ? 'is-active' : ''}" href="/demo" data-route>Demo</a><a class="nav-link ${route === 'privacy' ? 'is-active' : ''}" href="/privacy" data-route>Privacy</a></nav>
      ${appRoute ? `<button class="button primary header-action" data-open-form aria-label="Log a source">${icons.sprout}<span>Log a source</span></button>` : '<a class="button quiet" href="/" data-route>Back to log</a>'}
    </header>
    <main id="main" tabindex="-1">${content}</main>
    <footer><p>Private local input log for language learners.</p><nav aria-label="Legal"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a></nav><p class="asset-note">Built by Param Factory · Build 1.1.0 · Original AI-assisted field illustration</p></footer>
    <div id="live-region" class="sr-only" aria-live="polite"></div>
  `;
}

function render(): void {
  const route = currentRoute();
  updateDocumentMeta(route);
  if (route === 'privacy') app.innerHTML = shell(legalPage('privacy'), route);
  else if (route === 'terms') app.innerHTML = shell(legalPage('terms'), route);
  else if (route === 'not-found') app.innerHTML = shell(notFoundPage(), route);
  else app.innerHTML = shell(`${route === 'demo' ? demoBanner() : ''}${activeView === 'journal' ? journalPage() : trendsPage()}`, route);
  bindEvents();
}

function journalPage(): string {
  const target = nextTarget(entries);
  return `
    <section class="hero ${entries.length ? 'hero-compact' : ''}" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="eyebrow">Private language input log</p>
        <h1 id="page-title">Log language input you understand</h1>
        <p class="lede">For language self-learners who want books, podcasts, and videos that fit their understanding.</p>
        ${!entries.length ? `<div class="hero-actions"><a class="button primary large" href="/demo" data-route>${icons.sprout}<span>Try it with sample data</span></a><button class="button quiet" data-open-form>Log a source</button></div><p class="action-help">See four sample sources, a trend, and a next-source suggestion.</p><ul class="plain-facts"><li>Free to use</li><li>Works offline after the first visit</li><li>No account, analytics, or media uploads</li></ul>` : ''}
      </div>
      <picture class="hero-art">
        <source type="image/avif" srcset="/assets/field-notes-hero-640.avif 640w, /assets/field-notes-hero.avif 1200w" sizes="(max-width: 760px) 92vw, 48vw">
        <source type="image/webp" srcset="/assets/field-notes-hero-640.webp 640w, /assets/field-notes-hero.webp 1200w" sizes="(max-width: 760px) 92vw, 48vw">
        <img src="/assets/field-notes-hero.webp" width="1200" height="800" alt="An open notebook with a pressed fern and abstract marks for books, audio, and video" decoding="async" fetchpriority="high">
      </picture>
    </section>
    ${entries.length ? `<section class="target-section" aria-labelledby="next-target"><div class="section-marker">Next source</div><div class="target-copy"><h2 id="next-target">${target.title}</h2><p>${target.detail}</p></div><button class="button secondary" data-open-form>Log a source</button></section>` : gettingStarted()}
    <section class="log-section" aria-labelledby="observations-heading">
      <div class="section-heading"><div><p class="eyebrow">Saved sources</p><h2 id="observations-heading">Your input log</h2></div>${entries.length ? `<p><strong>${entries.length}</strong> ${entries.length === 1 ? 'source' : 'sources'} recorded</p>` : ''}</div>
      ${entries.length ? `<ol class="entry-list">${entries.map(entryCard).join('')}</ol>` : `<div class="empty-log"><span class="empty-glyph">${icons.sprout}</span><h3>No sources yet</h3><p>Log a reading, listening, or viewing session. Your trend appears after a few entries.</p><button class="button secondary" data-open-form>Log a source</button></div>`}
    </section>
    ${dialogs()}`;
}

function gettingStarted(): string {
  return `<section class="how-it-works" aria-labelledby="how-heading"><p class="eyebrow">How it works</p><h2 id="how-heading">Choose your next language source</h2><ol><li><span>01</span><div><h3>Log a source</h3><p>Add any book, podcast, video, article, or other source.</p></div></li><li><span>02</span><div><h3>Rate understanding</h3><p>Choose a personal understanding band. It is not a language score.</p></div></li><li><span>03</span><div><h3>Check the trend</h3><p>Use recent entries to choose the next source.</p></div></li></ol></section>`;
}

function entryCard(entry: LogEntry): string {
  const words = entry.words.filter(Boolean);
  const date = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: entry.date.slice(0, 4) !== String(new Date().getFullYear()) ? 'numeric' : undefined, timeZone: 'UTC' }).format(new Date(`${entry.date}T12:00:00Z`));
  return `<li class="entry-card"><article>
    <div class="entry-icon">${icons[entry.sourceType]}</div>
    <div class="entry-body"><div class="entry-top"><div><p class="entry-meta">${escapeHtml(entry.sourceType)} · ${date}</p><h3>${escapeHtml(entry.title)}</h3></div><div class="entry-actions"><button class="icon-button" data-edit="${entry.id}" aria-label="Edit ${escapeHtml(entry.title)}">Edit</button><button class="icon-button danger-link" data-delete="${entry.id}" aria-label="Delete ${escapeHtml(entry.title)}">Delete</button></div></div>
    <div class="entry-facts"><span><strong>${levelLabel(entry.comprehension)}</strong> understood</span><span>${entry.amount} ${entry.amountUnit}</span><span>${entry.status === 'stopped' ? 'Stopped early' : 'Finished session'}</span>${entry.language ? `<span>${escapeHtml(entry.language)}</span>` : ''}</div>
    ${words.length ? `<div class="word-row" aria-label="Recurring unknown words">${words.map(word => `<span>${escapeHtml(word)}</span>`).join('')}</div>` : ''}
    ${entry.notes ? `<p class="entry-notes">${escapeHtml(entry.notes)}</p>` : ''}
    </div></article></li>`;
}

function trendsPage(): string {
  const avg = average(entries);
  const direction = trend(entries);
  const stopped = entries.filter(entry => entry.status === 'stopped').length;
  const words = recurringWords(entries);
  return `<section class="page-intro"><p class="eyebrow">Understanding trend</p><h1>See your understanding trend</h1><p>These are your own observations, not a language level or proficiency assessment.</p></section>
    ${entries.length < 2 ? `<section class="trend-empty"><div class="empty-glyph">${icons.sprout}</div><h2>${entries.length ? 'One more source starts a trend' : 'Your trend needs sources'}</h2><p>${entries.length ? 'Log another source when you are ready. Four or more sources make the direction clearer.' : 'Log at least two sources to draw the first line.'}</p><button class="button primary" data-open-form>Log a source</button></section>` : `
    <section class="trend-grid" aria-label="Input summary">
      <div class="metric"><p>Recent understanding</p><strong>${avg?.toFixed(1)} <small>of 5 bands</small></strong><span>${direction === 'new' ? 'Still gathering a pattern' : direction === 'improving' ? 'Trending more understandable' : direction === 'easing' ? 'Recently more demanding' : 'Holding steady'}</span></div>
      <div class="metric"><p>Sessions completed</p><strong>${entries.length - stopped}<small> of ${entries.length}</small></strong><span>${stopped ? `${stopped} stopped early—useful evidence, too` : 'No sessions stopped early'}</span></div>
      <div class="metric"><p>Recurring words noted</p><strong>${new Set(entries.flatMap(e => e.words.map(w => w.toLowerCase()))).size}</strong><span>${words.length ? `Most seen: ${escapeHtml(words.slice(0, 2).join(', '))}` : 'Add words only when they recur'}</span></div>
    </section>
    ${trendChart(entries)}
    <section class="interpretation"><p class="eyebrow">How to read the trend</p><h2>${direction === 'improving' ? 'Later sources felt easier.' : direction === 'easing' ? 'Recent sources felt harder.' : 'Your recent range is steady.'}</h2><p>${direction === 'improving' ? 'Your later ratings sit above earlier ones. Keep the format stable before adding difficulty.' : direction === 'easing' ? 'Try a familiar topic, a shorter session, or a replay before choosing different material.' : 'Steady understanding can show that the material fits. Change one thing at a time.'}</p></section>`}
    <section class="data-tools" aria-labelledby="data-heading"><div><p class="eyebrow">Your data</p><h2 id="data-heading">Export or import your log</h2><p>Export a JSON backup or a spreadsheet-ready CSV. Import replaces this ${isDemo() ? 'demo' : 'local'} log only after you confirm.</p></div><div class="tool-actions"><button class="button secondary" data-export="json" ${!entries.length ? 'disabled' : ''}>Export JSON</button><button class="button quiet" data-export="csv" ${!entries.length ? 'disabled' : ''}>Export CSV</button><label class="button quiet file-button">Import JSON<input id="import-file" type="file" accept="application/json,.json"></label></div></section>
    ${dialogs()}`;
}

function trendChart(items: LogEntry[]): string {
  const points = [...items].sort((a, b) => a.date.localeCompare(b.date)).slice(-12);
  const width = 760, height = 230, left = 42, right = 20, top = 18, bottom = 38;
  const x = (index: number) => left + (index * (width - left - right)) / Math.max(1, points.length - 1);
  const y = (value: number) => top + ((5 - value) * (height - top - bottom)) / 4;
  const path = points.map((point, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(point.comprehension)}`).join(' ');
  return `<figure class="chart"><figcaption><div><p class="eyebrow">Last ${points.length} sources</p><h2>Understanding over time</h2></div><p class="chart-key"><span></span>Your self-rated band</p></figcaption><div class="chart-wrap"><svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Understanding observations over time</title><desc id="chart-desc">${points.map(p => `${p.date}: ${levelLabel(p.comprehension)}`).join('; ')}</desc>${[1,2,3,4,5].map(level => `<line x1="${left}" x2="${width-right}" y1="${y(level)}" y2="${y(level)}"/><text x="${left-10}" y="${y(level)+4}" text-anchor="end">${level}</text>`).join('')}<path class="trend-line" d="${path}"/>${points.map((point, i) => `<circle cx="${x(i)}" cy="${y(point.comprehension)}" r="6"><title>${escapeHtml(point.title)}: ${levelLabel(point.comprehension)}</title></circle>`).join('')}${points.map((point, i) => `<text class="date-label" x="${x(i)}" y="${height-10}" text-anchor="middle">${i === 0 || i === points.length - 1 || points.length < 6 ? point.date.slice(5).replace('-', '/') : ''}</text>`).join('')}</svg></div><p class="chart-note">1 = A little · 3 = Most · 5 = Nearly all. Bands are personal estimates, not test results.</p></figure>`;
}

function recurringWords(items: LogEntry[]): string[] {
  const counts = new Map<string, number>();
  items.flatMap(entry => entry.words).filter(Boolean).forEach(word => counts.set(word.toLowerCase(), (counts.get(word.toLowerCase()) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([word]) => word);
}

function formDialog(): string {
  const entry = entries.find(item => item.id === editingId);
  const today = new Date().toISOString().slice(0, 10);
  return `<dialog id="entry-dialog" class="entry-dialog"><form id="entry-form" method="dialog" novalidate><div class="dialog-heading"><div><p class="eyebrow">Session details</p><h2>${entry ? 'Edit this source' : 'Log a source'}</h2></div><button class="close-button" type="button" data-close-dialog aria-label="Close dialog">×</button></div>
    <div id="form-error" class="form-error" role="alert" hidden></div>
    <div class="form-grid"><div class="field field-wide"><label for="title">Source title <span aria-hidden="true">*</span></label><input id="title" name="title" required maxlength="100" value="${entry ? escapeHtml(entry.title) : ''}" autocomplete="off"><p class="field-hint">A title you will recognize later.</p></div>
    <div class="field"><label for="language">Language</label><input id="language" name="language" maxlength="40" value="${entry ? escapeHtml(entry.language) : ''}" autocomplete="off" placeholder="e.g. German"></div>
    <div class="field"><label for="date">Date <span aria-hidden="true">*</span></label><input id="date" name="date" type="date" required max="${today}" value="${entry?.date ?? today}"></div>
    <fieldset class="field-wide"><legend>Source type <span aria-hidden="true">*</span></legend><div class="choice-row source-choices">${(['book','podcast','video','article','other'] as SourceType[]).map(type => `<label><input type="radio" name="sourceType" value="${type}" ${(entry?.sourceType ?? 'podcast') === type ? 'checked' : ''}><span>${icons[type]}${type[0].toUpperCase()+type.slice(1)}</span></label>`).join('')}</div></fieldset>
    <div class="field"><label for="amount">Amount <span aria-hidden="true">*</span></label><input id="amount" name="amount" type="number" required min="1" max="10000" inputmode="numeric" value="${entry?.amount ?? ''}"></div>
    <div class="field"><label for="amountUnit">Measured in</label><select id="amountUnit" name="amountUnit"><option value="minutes" ${entry?.amountUnit === 'minutes' ? 'selected' : ''}>minutes</option><option value="pages" ${entry?.amountUnit === 'pages' ? 'selected' : ''}>pages</option></select></div>
    <fieldset class="field-wide understanding"><legend>How much did you understand? <span aria-hidden="true">*</span></legend><p class="field-hint">Choose from memory. This is a personal observation, not a proficiency score.</p><div class="level-choices">${LEVELS.map(level => `<label><input type="radio" name="comprehension" value="${level.value}" ${entry?.comprehension === level.value ? 'checked' : ''} required><span><b>${level.label}</b><small>${level.range}</small></span></label>`).join('')}</div></fieldset>
    <fieldset class="field-wide words"><legend>Recurring unknown words <span>optional, up to 3</span></legend><div class="word-inputs">${[0,1,2].map(i => `<label><span class="sr-only">Unknown word ${i+1}</span><input name="word${i+1}" maxlength="40" value="${entry?.words[i] ? escapeHtml(entry.words[i]) : ''}" placeholder="${i === 0 ? 'e.g. trotzdem' : `Word ${i+1}`}"></label>`).join('')}</div></fieldset>
    <fieldset class="field-wide"><legend>Did you finish this session?</legend><div class="choice-row"><label><input type="radio" name="status" value="finished" ${(entry?.status ?? 'finished') === 'finished' ? 'checked' : ''}><span>Finished</span></label><label><input type="radio" name="status" value="stopped" ${entry?.status === 'stopped' ? 'checked' : ''}><span>Stopped early</span></label></div></fieldset>
    <div class="field field-wide"><label for="notes">A note for next time <span>optional</span></label><textarea id="notes" name="notes" maxlength="280" rows="3" placeholder="What made this easier or harder?">${entry ? escapeHtml(entry.notes) : ''}</textarea></div></div>
    <div class="dialog-actions"><button class="button quiet" type="button" data-close-dialog>Cancel</button><button class="button primary" type="submit">${entry ? 'Save changes' : 'Save observation'}</button></div></form></dialog>`;
}

function dialogs(): string {
  return `${formDialog()}<dialog id="confirm-dialog" class="confirm-dialog"><div><p class="eyebrow">Remove source</p><h2>Delete “<span id="delete-title"></span>”?</h2><p>This removes it from this ${isDemo() ? 'demo' : 'device'}. Export a backup first if you may need it later.</p><div class="dialog-actions"><button class="button quiet" data-cancel-delete>Keep it</button><button class="button danger" data-confirm-delete>Delete source</button></div></div></dialog><dialog id="import-dialog" class="confirm-dialog"><div><p class="eyebrow">Import preview</p><h2>Replace this ${isDemo() ? 'demo' : 'local'} log?</h2><p id="import-summary"></p><p>Your current sources will be replaced. Export them first if you may need them.</p><div class="dialog-actions"><button class="button quiet" data-cancel-import>Cancel</button><button class="button primary" data-confirm-import>Replace and import</button></div></div></dialog>`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  return `<article class="legal"><p class="eyebrow">${kind}</p><h1>${kind === 'privacy' ? 'Privacy for your input log' : 'Terms for your input log'}</h1>${kind === 'privacy' ? `<p class="lede">Comprehensible Input Log keeps sources in your browser’s IndexedDB storage. It needs no account.</p><h2>What we collect</h2><p>Nothing. The app has no analytics, advertising, tracking pixels, accounts, or server database. Titles, languages, ratings, words, and notes stay on the device where you enter them.</p><h2>Backups and deletion</h2><p>You can export JSON or CSV from Trends. Clearing browser storage or removing the installed app may erase the log. Keep a JSON backup if the history matters to you. Deleting a source removes it from local storage.</p><h2>Network use</h2><p>The service worker checks this site for updated app files. It does not send your log content. The app does not upload or host the media you study.</p>` : `<p class="lede">Use this free tool as a private input log. It does not assess fluency or certify a language level.</p><h2>Your responsibility</h2><p>You are responsible for backups and the notes you enter. Do not paste copyrighted books, transcripts, or sensitive personal information into the log. Source titles and up to three recurring words are enough.</p><h2>No guarantee</h2><p>Suggestions reflect your subjective recent ratings. They are not educational, medical, or professional advice. The software is provided “as is” under the MIT License.</p><h2>Availability</h2><p>The installed app works offline after its first successful load. Browser storage limits, private browsing, device policies, or clearing site data can affect persistence.</p>`}<p class="legal-updated">Effective September 5, 2026</p></article>`;
}

function demoBanner(): string {
  return `<section class="demo-banner" data-demo-banner data-testid="demo-banner" aria-label="Demo controls"><p><strong>Demo — sample data, nothing is saved</strong> to your real log.</p><div><button class="button quiet" data-reset-demo>Reset demo</button><a class="button primary" href="/" data-route>Start for real</a></div></section>`;
}

function notFoundPage(): string {
  return `<section class="not-found"><p class="eyebrow">404</p><h1>This page was not found</h1><p>Choose the input log home page to continue.</p><a class="button primary" href="/" data-route>Go to input log</a></section>`;
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>('[data-route]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    void navigate((event.currentTarget as HTMLAnchorElement).href);
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button => button.addEventListener('click', () => {
    activeView = button.dataset.view as typeof activeView;
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-open-form]').forEach(button => button.addEventListener('click', () => openForm()));
  document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(button => button.addEventListener('click', () => openForm(button.dataset.edit)));
  document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(button => button.addEventListener('click', () => openDelete(button.dataset.delete!)));
  document.querySelectorAll<HTMLButtonElement>('[data-close-dialog]').forEach(button => button.addEventListener('click', () => closeDialog('entry-dialog')));
  document.querySelector<HTMLFormElement>('#entry-form')?.addEventListener('submit', handleSubmit);
  document.querySelector<HTMLButtonElement>('[data-cancel-delete]')?.addEventListener('click', () => closeDialog('confirm-dialog'));
  document.querySelector<HTMLButtonElement>('[data-confirm-delete]')?.addEventListener('click', confirmDelete);
  document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(button => button.addEventListener('click', () => exportData(button.dataset.export as 'json' | 'csv')));
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', handleImportFile);
  document.querySelector<HTMLButtonElement>('[data-cancel-import]')?.addEventListener('click', () => { pendingImport = null; closeDialog('import-dialog'); });
  document.querySelector<HTMLButtonElement>('[data-confirm-import]')?.addEventListener('click', confirmImport);
  document.querySelector<HTMLButtonElement>('[data-reset-demo]')?.addEventListener('click', resetDemo);
  document.querySelector<HTMLButtonElement>('[data-reload]')?.addEventListener('click', () => location.reload());
}

async function navigate(href: string): Promise<void> {
  const url = new URL(href, location.origin);
  history.pushState({}, '', `${url.pathname}${url.search}`);
  activeView = 'journal';
  await loadEntriesForRoute();
  render();
  document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
  scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  announce(routeDetails[currentRoute()].title);
}

async function resetDemo(): Promise<void> {
  if (!isDemo()) return;
  await replaceEntries(freshDemoEntries());
  entries = await getEntries();
  activeView = 'journal';
  render();
  announce('Demo reset to the four sample sources.');
}

function openForm(id?: string): void {
  editingId = id ?? null;
  const existing = entries.find(entry => entry.id === editingId);
  const old = document.querySelector('#entry-dialog');
  if (old) old.outerHTML = formDialog();
  const dialog = document.querySelector<HTMLDialogElement>('#entry-dialog')!;
  dialog.querySelectorAll<HTMLButtonElement>('[data-close-dialog]').forEach(button => button.addEventListener('click', () => closeDialog('entry-dialog')));
  dialog.querySelector<HTMLFormElement>('#entry-form')!.addEventListener('submit', handleSubmit);
  dialog.addEventListener('close', () => { editingId = null; });
  dialog.showModal();
  requestAnimationFrame(() => dialog.querySelector<HTMLInputElement>('#title')?.focus());
  if (existing) announce(`Editing ${existing.title}`);
}

function closeDialog(id: string): void {
  document.querySelector<HTMLDialogElement>(`#${id}`)?.close();
}

async function handleSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const formData = new FormData(form);
  const error = form.querySelector<HTMLDivElement>('#form-error')!;
  const title = String(formData.get('title') ?? '').trim();
  const amount = Number(formData.get('amount'));
  const comprehension = Number(formData.get('comprehension'));
  const date = String(formData.get('date') ?? '');
  if (!title || !isValidEntryDate(date) || !Number.isInteger(amount) || amount < 1 || amount > 10000 || !Number.isInteger(comprehension) || comprehension < 1 || comprehension > 5) {
    error.textContent = 'Please add a title, date, amount, and understanding band.';
    error.hidden = false;
    const invalid = !title ? form.querySelector('#title') : !amount ? form.querySelector('#amount') : form.querySelector('input[name="comprehension"]');
    (invalid as HTMLElement)?.focus();
    return;
  }
  const old = entries.find(entry => entry.id === editingId);
  const now = new Date().toISOString();
  const entry: LogEntry = {
    id: old?.id ?? crypto.randomUUID(), title, language: String(formData.get('language') ?? '').trim(),
    sourceType: formData.get('sourceType') as SourceType, amount, amountUnit: formData.get('amountUnit') as 'minutes' | 'pages',
    comprehension, words: [1,2,3].map(i => String(formData.get(`word${i}`) ?? '').trim()).filter(Boolean),
    status: formData.get('status') as 'finished' | 'stopped', date, notes: String(formData.get('notes') ?? '').trim(),
    createdAt: old?.createdAt ?? now, updatedAt: now,
  };
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  submit.disabled = true;
  submit.textContent = 'Saving…';
  try {
    await saveEntry(entry);
    entries = await getEntries();
    closeDialog('entry-dialog');
    render();
    announce(old ? `${title} updated.` : `${title} added to your log.`);
  } catch (cause) {
    error.textContent = cause instanceof Error ? cause.message : 'The observation could not be saved. Try again.';
    error.hidden = false;
    submit.disabled = false;
    submit.textContent = old ? 'Save changes' : 'Save observation';
  }
}

function openDelete(id: string): void {
  deleteId = id;
  const entry = entries.find(item => item.id === id);
  const dialog = document.querySelector<HTMLDialogElement>('#confirm-dialog')!;
  dialog.querySelector('#delete-title')!.textContent = entry?.title ?? 'this source';
  dialog.showModal();
}

async function confirmDelete(): Promise<void> {
  if (!deleteId) return;
  const entry = entries.find(item => item.id === deleteId);
  try {
    await deleteEntry(deleteId);
    entries = await getEntries();
    deleteId = null;
    closeDialog('confirm-dialog');
    render();
    announce(`${entry?.title ?? 'Observation'} deleted.`);
  } catch (cause) { announce(cause instanceof Error ? cause.message : 'Could not delete that source.'); }
}

function exportData(format: 'json' | 'csv'): void {
  let body: string;
  let type: string;
  if (format === 'json') {
    const data: ExportFile = { product: 'comprehensible-input-log', version: 1, exportedAt: new Date().toISOString(), entries };
    body = JSON.stringify(data, null, 2); type = 'application/json';
  } else {
    const fields: (keyof LogEntry)[] = ['date','title','language','sourceType','amount','amountUnit','comprehension','status','words','notes'];
    const cell = (value: unknown) => {
      const raw = String(Array.isArray(value) ? value.join('; ') : value);
      const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    body = [fields.join(','), ...entries.map(entry => fields.map(field => cell(entry[field])).join(','))].join('\n'); type = 'text/csv';
  }
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = `input-log-${new Date().toISOString().slice(0, 10)}.${format}`; link.click();
  URL.revokeObjectURL(url);
  announce(`${format.toUpperCase()} export ready.`);
}

async function handleImportFile(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const imported = validateImport(JSON.parse(await file.text()));
    pendingImport = imported.entries;
    const dialog = document.querySelector<HTMLDialogElement>('#import-dialog')!;
    dialog.querySelector('#import-summary')!.textContent = `The file contains ${pendingImport.length} ${pendingImport.length === 1 ? 'source' : 'sources'}. This ${isDemo() ? 'demo' : 'device'} currently has ${entries.length}.`;
    dialog.showModal();
  } catch (cause) {
    announce(cause instanceof Error ? cause.message : 'That file could not be read.');
  } finally { input.value = ''; }
}

async function confirmImport(): Promise<void> {
  if (!pendingImport) return;
  const count = pendingImport.length;
  try {
    await replaceEntries(pendingImport);
    entries = await getEntries(); pendingImport = null;
    closeDialog('import-dialog'); render(); announce(`${count} sources imported.`);
  } catch (cause) { announce(cause instanceof Error ? cause.message : 'The import could not be saved.'); }
}

function announce(message: string): void {
  let region = document.querySelector<HTMLElement>('#live-region');
  if (!region) { region = document.createElement('div'); region.id = 'live-region'; region.className = 'sr-only'; region.setAttribute('aria-live', 'polite'); document.body.append(region); }
  region.textContent = '';
  requestAnimationFrame(() => { if (region) region.textContent = message; });
}

function showOfflineState(): void {
  let bar = document.querySelector<HTMLDivElement>('#offline-bar');
  if (!navigator.onLine) {
    if (!bar) { bar = document.createElement('div'); bar.id = 'offline-bar'; bar.className = 'offline-bar'; bar.setAttribute('role', 'status'); document.body.prepend(bar); }
    bar.textContent = 'Offline — your log still saves on this device.';
  } else bar?.remove();
}

window.addEventListener('popstate', () => { void loadEntriesForRoute().then(render); });
window.addEventListener('online', showOfflineState);
window.addEventListener('offline', showOfflineState);

async function start(): Promise<void> {
  try { await loadEntriesForRoute(); }
  catch (cause) { app.innerHTML = shell(`<section class="fatal"><h1>Your input log could not open</h1><p>${escapeHtml(cause instanceof Error ? cause.message : 'Browser storage is unavailable.')}</p><button class="button primary" data-reload>Reload the app</button></section>`); bindEvents(); return; }
  render(); showOfflineState();
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateToast(worker);
        });
      });
    } catch { /* The app remains fully usable online if registration is unavailable. */ }
  }
}

async function loadEntriesForRoute(): Promise<void> {
  setStorageNamespace(isDemo() ? 'demo' : 'real');
  entries = await getEntries();
  if (isDemo() && entries.length === 0) {
    await replaceEntries(freshDemoEntries());
    entries = await getEntries();
  }
}

function showUpdateToast(worker: ServiceWorker): void {
  const toast = document.createElement('div');
  toast.className = 'update-toast'; toast.setAttribute('role', 'status');
  toast.innerHTML = '<span>An app update is ready.</span><button>Update now</button>';
  toast.querySelector('button')!.addEventListener('click', () => worker.postMessage({ type: 'SKIP_WAITING' }));
  document.body.append(toast);
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
}

start();
