import * as SQLite from 'expo-sqlite';
import { AnchorDate } from '../hooks/useDateStore';

const DB_NAME = 'dates.db';
let _db: SQLite.SQLiteDatabase | null = null;

export function getDatabase() {
  if (!_db) {
    _db = SQLite.openDatabaseSync(DB_NAME);
    // Enable Write-Ahead Logging (WAL) mode for safe concurrent multi-process access
    _db.execSync('PRAGMA journal_mode = WAL;');
    _db.execSync(`
      CREATE TABLE IF NOT EXISTS anchor_dates (
        id TEXT PRIMARY KEY NOT NULL,
        label TEXT NOT NULL,
        dateISO TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS deleted_dates_history (
        id TEXT PRIMARY KEY NOT NULL,
        label TEXT NOT NULL,
        dateISO TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT NOT NULL,
        deletedAtISO TEXT NOT NULL,
        createdAtISO TEXT NOT NULL,
        status TEXT
      );
    `);
    try {
      _db.execSync('ALTER TABLE deleted_dates_history ADD COLUMN status TEXT;');
    } catch (e) {
      // already exists
    }
  }
  return _db;
}

export function loadDatesFromDb(): AnchorDate[] {
  try {
    const db = getDatabase();
    const rows = db.getAllSync('SELECT * FROM anchor_dates') as AnchorDate[];
    return rows;
  } catch (err) {
    console.error('Failed to load dates from SQLite:', err);
    return [];
  }
}

export function saveDateToDb(entry: AnchorDate) {
  try {
    const db = getDatabase();
    db.runSync(
      'INSERT OR REPLACE INTO anchor_dates (id, label, dateISO, type, icon) VALUES (?, ?, ?, ?, ?)',
      String(entry.id || Date.now().toString()),
      String(entry.label || ''),
      String(entry.dateISO || new Date().toISOString()),
      String(entry.type || 'birthday'),
      String(entry.icon || '⭐')
    );
  } catch (err) {
    console.error('Failed to save date to SQLite:', err);
  }
}

export function deleteDateFromDb(id: string) {
  try {
    const db = getDatabase();
    db.runSync('DELETE FROM anchor_dates WHERE id = ?', String(id));
  } catch (err) {
    console.error('Failed to delete date from SQLite:', err);
  }
}

export function updateDateInDb(id: string, patch: Partial<Omit<AnchorDate, 'id'>>) {
  try {
    const db = getDatabase();
    const existing = db.getFirstSync('SELECT * FROM anchor_dates WHERE id = ?', String(id)) as AnchorDate | null;
    if (existing) {
      const updated = { ...existing, ...patch };
      db.runSync(
        'INSERT OR REPLACE INTO anchor_dates (id, label, dateISO, type, icon) VALUES (?, ?, ?, ?, ?)',
        String(id),
        String(updated.label || ''),
        String(updated.dateISO || new Date().toISOString()),
        String(updated.type || 'birthday'),
        String(updated.icon || '⭐')
      );
    }
  } catch (err) {
    console.error('Failed to update date in SQLite:', err);
  }
}

export function replaceAllDatesInDb(dates: AnchorDate[]) {
  try {
    const db = getDatabase();
    db.runSync('DELETE FROM anchor_dates');
    for (const d of dates) {
      if (!d) continue;
      db.runSync(
        'INSERT OR REPLACE INTO anchor_dates (id, label, dateISO, type, icon) VALUES (?, ?, ?, ?, ?)',
        String(d.id || Date.now().toString()),
        String(d.label || ''),
        String(d.dateISO || new Date().toISOString()),
        String(d.type || 'birthday'),
        String(d.icon || '⭐')
      );
    }
  } catch (err) {
    console.error('Failed to replace dates in SQLite:', err);
  }
}

export interface HistoryEntry {
  id: string;
  label: string;
  dateISO: string;
  type: string;
  icon: string;
  deletedAtISO: string;
  createdAtISO: string;
  status?: string;
}

export function loadHistoryFromDb(): HistoryEntry[] {
  try {
    const db = getDatabase();
    const rows = db.getAllSync('SELECT * FROM deleted_dates_history') as HistoryEntry[];
    return rows;
  } catch (err) {
    console.error('Failed to load history from SQLite:', err);
    return [];
  }
}

export function saveToHistoryDb(entry: HistoryEntry) {
  try {
    const db = getDatabase();
    db.runSync(
      'INSERT OR REPLACE INTO deleted_dates_history (id, label, dateISO, type, icon, deletedAtISO, createdAtISO, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      String(entry.id),
      String(entry.label),
      String(entry.dateISO),
      String(entry.type),
      String(entry.icon),
      String(entry.deletedAtISO),
      String(entry.createdAtISO),
      String(entry.status || 'completed')
    );
  } catch (err) {
    console.error('Failed to save to history in SQLite:', err);
  }
}

export function deleteFromHistoryDb(id: string) {
  try {
    const db = getDatabase();
    db.runSync('DELETE FROM deleted_dates_history WHERE id = ?', String(id));
  } catch (err) {
    console.error('Failed to delete history row from SQLite:', err);
  }
}

export function clearHistoryDb() {
  try {
    const db = getDatabase();
    db.runSync('DELETE FROM deleted_dates_history');
  } catch (err) {
    console.error('Failed to clear history from SQLite:', err);
  }
}
