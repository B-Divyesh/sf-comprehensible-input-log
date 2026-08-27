export type SourceType = 'book' | 'podcast' | 'video' | 'article' | 'other';
export type AmountUnit = 'minutes' | 'pages';

export interface LogEntry {
  id: string;
  title: string;
  language: string;
  sourceType: SourceType;
  amount: number;
  amountUnit: AmountUnit;
  comprehension: number;
  words: string[];
  status: 'finished' | 'stopped';
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportFile {
  product: 'comprehensible-input-log';
  version: 1;
  exportedAt: string;
  entries: LogEntry[];
}
