import type { ExportFile, LogEntry } from './types';

const DB_NAME = 'comprehensible-input-log';
const STORE = 'entries';
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Your local log could not be opened. Check browser storage settings and reload.'));
  });
}

export async function getEntries(): Promise<LogEntry[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as LogEntry[]).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)));
    request.onerror = () => reject(new Error('Your saved observations could not be read. Reload and try again.'));
  });
}

export async function saveEntry(entry: LogEntry): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('This observation could not be saved. Check available storage and try again.'));
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('This observation could not be removed. Try again.'));
  });
}

export async function replaceEntries(entries: LogEntry[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    store.clear();
    entries.forEach(entry => store.put(entry));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('The import could not be saved. Your existing log is unchanged.'));
  });
}

export function validateImport(value: unknown): ExportFile {
  if (!value || typeof value !== 'object') throw new Error('That file is not a Comprehensible Input Log export.');
  const candidate = value as Partial<ExportFile>;
  if (candidate.product !== 'comprehensible-input-log' || candidate.version !== 1 || !Array.isArray(candidate.entries)) throw new Error('That file is not a supported Comprehensible Input Log export.');
  const sourceTypes = ['book', 'podcast', 'video', 'article', 'other'];
  for (const entry of candidate.entries) {
    if (!entry || typeof entry.id !== 'string' || typeof entry.title !== 'string' || !entry.title.trim() || typeof entry.language !== 'string' ||
      !sourceTypes.includes(entry.sourceType) || !Number.isInteger(entry.amount) || entry.amount < 1 || entry.amount > 10000 ||
      !['minutes', 'pages'].includes(entry.amountUnit) || !Number.isInteger(entry.comprehension) || entry.comprehension < 1 || entry.comprehension > 5 ||
      !Array.isArray(entry.words) || entry.words.length > 3 || entry.words.some(word => typeof word !== 'string') || !['finished', 'stopped'].includes(entry.status) ||
      typeof entry.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || typeof entry.notes !== 'string' || typeof entry.createdAt !== 'string' || typeof entry.updatedAt !== 'string') {
      throw new Error('One or more observations in that file are incomplete or invalid.');
    }
  }
  return candidate as ExportFile;
}
