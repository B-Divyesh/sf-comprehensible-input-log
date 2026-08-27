import type { LogEntry } from './types';

export const LEVELS = [
  { value: 1, label: 'A little', range: 'Below 50%', hint: 'Mostly out of reach' },
  { value: 2, label: 'Some', range: 'About 50–69%', hint: 'A demanding stretch' },
  { value: 3, label: 'Most', range: 'About 70–84%', hint: 'Challenging but usable' },
  { value: 4, label: 'Almost all', range: 'About 85–94%', hint: 'Comfortably near your level' },
  { value: 5, label: 'Nearly all', range: 'About 95%+', hint: 'Very comfortable input' },
] as const;

export function average(entries: LogEntry[]): number | null {
  if (!entries.length) return null;
  return entries.reduce((sum, entry) => sum + entry.comprehension, 0) / entries.length;
}

export function trend(entries: LogEntry[]): 'improving' | 'steady' | 'easing' | 'new' {
  if (entries.length < 4) return 'new';
  const chronological = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const split = Math.floor(chronological.length / 2);
  const change = (average(chronological.slice(split)) ?? 0) - (average(chronological.slice(0, split)) ?? 0);
  if (change >= 0.35) return 'improving';
  if (change <= -0.35) return 'easing';
  return 'steady';
}

export function nextTarget(entries: LogEntry[]): { title: string; detail: string } {
  if (!entries.length) return { title: 'Start with a familiar source', detail: 'Choose 10–15 minutes or 5 pages. Aim to understand almost all of the main idea.' };
  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const avg = average(recent) ?? 3;
  const last = recent[0];
  const amount = last.amountUnit === 'pages' ? `${Math.max(3, Math.round(last.amount * .75))}–${Math.max(5, Math.round(last.amount))} pages` : `${Math.max(8, Math.round(last.amount * .75))}–${Math.max(10, Math.round(last.amount))} minutes`;
  if (avg < 2.75) return { title: 'Make the next source gentler', detail: `Try a familiar topic for ${amount}. Repetition or a slower format can bring the main idea into reach.` };
  if (avg > 4.35) return { title: 'Try one small stretch', detail: `Keep the same format for ${amount}, but add one new topic or a slightly faster pace.` };
  return { title: 'Stay in this useful range', detail: `Look for another ${last.sourceType} around ${amount}. Your recent input is challenging without crowding out the main idea.` };
}

export function levelLabel(value: number): string {
  return LEVELS.find(level => level.value === value)?.label ?? 'Not rated';
}
