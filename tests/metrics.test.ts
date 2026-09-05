import { describe, expect, it } from 'vitest';
import { average, levelLabel, nextTarget, trend } from '../src/metrics';
import { validateImport } from '../src/storage';
import type { LogEntry } from '../src/types';

const makeEntry = (comprehension: number, date: string, amount = 20): LogEntry => ({
  id: crypto.randomUUID(), title: `Source ${date}`, language: 'German', sourceType: 'podcast', amount,
  amountUnit: 'minutes', comprehension, words: [], status: 'finished', date, notes: '', createdAt: `${date}T12:00:00Z`, updatedAt: `${date}T12:00:00Z`,
});

describe('learning summaries', () => {
  it('averages subjective bands without converting them to proficiency', () => {
    expect(average([makeEntry(2, '2026-01-01'), makeEntry(4, '2026-01-02')])).toBe(3);
    expect(average([])).toBeNull();
    expect(levelLabel(4)).toBe('Almost all');
  });

  it('spots improving, steady, and demanding recent directions', () => {
    expect(trend([1, 2, 4, 5].map((n, i) => makeEntry(n, `2026-01-0${i + 1}`)))).toBe('improving');
    expect(trend([3, 3, 3, 3].map((n, i) => makeEntry(n, `2026-01-0${i + 1}`)))).toBe('steady');
    expect(trend([5, 4, 2, 1].map((n, i) => makeEntry(n, `2026-01-0${i + 1}`)))).toBe('easing');
    expect(trend([makeEntry(3, '2026-01-01')])).toBe('new');
  });

  it('gives a concrete gentler target for difficult recent input', () => {
    const result = nextTarget([makeEntry(2, '2026-01-01', 20)]);
    expect(result.title).toContain('gentler');
    expect(result.detail).toContain('15–20 minutes');
  });
});

describe('import validation', () => {
  it('accepts this product’s v1 export', () => {
    const entries = [makeEntry(4, '2026-01-01')];
    expect(validateImport({ product: 'comprehensible-input-log', version: 1, exportedAt: '2026-01-02', entries }).entries).toEqual(entries);
  });

  it('rejects unrelated and malformed files', () => {
    expect(() => validateImport({ product: 'other', version: 1, entries: [] })).toThrow(/not a supported/);
    expect(() => validateImport({ product: 'comprehensible-input-log', version: 1, entries: [{ id: 'x', title: 'Bad', comprehension: 9, words: [] }] })).toThrow(/invalid/);
  });

  it('rejects impossible and future calendar dates before replacement', () => {
    const impossible = makeEntry(3, '2026-99-99');
    const future = makeEntry(3, '2099-01-01');
    expect(() => validateImport({ product: 'comprehensible-input-log', version: 1, entries: [impossible] })).toThrow(/invalid/);
    expect(() => validateImport({ product: 'comprehensible-input-log', version: 1, entries: [future] })).toThrow(/invalid/);
  });
});
