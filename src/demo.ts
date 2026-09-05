import type { LogEntry } from './types';

/**
 * Shipped, fictional sample records. They are only ever written to the
 * `demo:comprehensible-input-log` IndexedDB database.
 */
export const DEMO_ENTRIES: LogEntry[] = [
  {
    id: 'demo-easy-german-market', title: 'Easy German: At the weekly market', language: 'German', sourceType: 'podcast', amount: 18,
    amountUnit: 'minutes', comprehension: 4, words: ['trotzdem', 'der Stand'], status: 'finished', date: '2026-08-11',
    notes: 'Understood the main conversation without pausing.', createdAt: '2026-08-11T18:00:00.000Z', updatedAt: '2026-08-11T18:00:00.000Z',
  },
  {
    id: 'demo-cuentos-cortos', title: 'Cuentos cortos: La bicicleta azul', language: 'Spanish', sourceType: 'book', amount: 7,
    amountUnit: 'pages', comprehension: 3, words: ['de repente', 'la esquina'], status: 'finished', date: '2026-08-18',
    notes: 'The dialogue was clear. I looked up two repeated phrases.', createdAt: '2026-08-18T20:00:00.000Z', updatedAt: '2026-08-18T20:00:00.000Z',
  },
  {
    id: 'demo-dreaming-spanish-bus', title: 'Dreaming Spanish: A bus ride in Madrid', language: 'Spanish', sourceType: 'video', amount: 14,
    amountUnit: 'minutes', comprehension: 4, words: ['de repente', 'el trayecto'], status: 'finished', date: '2026-08-25',
    notes: 'Pictures helped with the unfamiliar travel words.', createdAt: '2026-08-25T19:00:00.000Z', updatedAt: '2026-08-25T19:00:00.000Z',
  },
  {
    id: 'demo-news-weather', title: 'Noticias breves: La lluvia vuelve', language: 'Spanish', sourceType: 'article', amount: 5,
    amountUnit: 'minutes', comprehension: 5, words: ['la tormenta'], status: 'finished', date: '2026-09-01',
    notes: 'A short familiar topic felt comfortable.', createdAt: '2026-09-01T08:00:00.000Z', updatedAt: '2026-09-01T08:00:00.000Z',
  },
];

export function freshDemoEntries(): LogEntry[] {
  return DEMO_ENTRIES.map(entry => ({ ...entry, words: [...entry.words] }));
}
