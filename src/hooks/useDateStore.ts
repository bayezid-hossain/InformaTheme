import { useState, useEffect, useCallback } from 'react';
import { NativeModules, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadDatesFromDb, saveDateToDb, deleteDateFromDb, updateDateInDb, replaceAllDatesInDb, loadHistoryFromDb, saveToHistoryDb, deleteFromHistoryDb, clearHistoryDb, HistoryEntry } from '../services/db';

export type DateType = 'birthday' | 'anniversary' | 'milestone' | 'todo';

export interface AnchorDate {
  id: string;
  label: string;
  dateISO: string;
  type: DateType;
  icon: string;
}

const TYPE_ICONS: Record<DateType, string> = {
  birthday: '🎂',
  anniversary: '💍',
  milestone: '⭐',
  todo: '📝',
};

const DEFAULTS: AnchorDate[] = [
  { id: '1', label: "Luka's Birthday", dateISO: '2020-06-15', type: 'birthday', icon: '🌱' },
  { id: '2', label: 'Anniversary', dateISO: '2018-09-22', type: 'anniversary', icon: '💍' },
  { id: '3', label: "Wife's Birthday", dateISO: '1995-04-10', type: 'birthday', icon: '🎂' },
  { id: '4', label: "Future Trip", dateISO: '2028-12-25', type: 'todo', icon: '✈️' },
];

export function useDateStore() {
  const [dates, setDates] = useState<AnchorDate[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const checkExpiredTodos = useCallback(() => {
    let changed = false;
    const now = new Date();
    const currentDates = loadDatesFromDb();
    const activeTodos = currentDates.filter((d) => d.type === 'todo');
    
    for (const d of activeTodos) {
      if (new Date(d.dateISO) < now) {
        const histRow: HistoryEntry = {
          id: d.id,
          label: d.label,
          dateISO: d.dateISO,
          type: d.type,
          icon: d.icon,
          deletedAtISO: new Date().toISOString(),
          createdAtISO: new Date(parseInt(d.id) || Date.now()).toISOString(),
          status: 'failed',
        };
        saveToHistoryDb(histRow);
        deleteDateFromDb(d.id);
        changed = true;
      }
    }
    
    if (changed) {
      setDates(loadDatesFromDb());
      setHistory(loadHistoryFromDb());
    }
  }, []);

  const syncPendingDeletions = useCallback(async () => {
    const { LockscreenModule } = NativeModules;
    if (LockscreenModule && LockscreenModule.getPendingDeletions) {
      try {
        const deletionsStr = await LockscreenModule.getPendingDeletions();
        const deletions = JSON.parse(deletionsStr || '[]') as any[];
        if (deletions.length > 0) {
          for (const d of deletions) {
            const histRow: HistoryEntry = {
              id: d.id || `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              label: d.label,
              dateISO: d.dateISO,
              type: d.type,
              icon: d.icon,
              deletedAtISO: d.deletedAtISO || new Date().toISOString(),
              createdAtISO: d.createdAtISO || new Date(parseInt(d.id) || Date.now()).toISOString(),
              status: d.status || 'completed',
            };
            saveToHistoryDb(histRow);
            deleteDateFromDb(histRow.id);
          }
          await LockscreenModule.clearPendingDeletions();
          setDates(loadDatesFromDb());
          setHistory(loadHistoryFromDb());
        }
      } catch (e) {
        console.error('Failed to sync pending deletions:', e);
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const initialized = await AsyncStorage.getItem('db_initialized');
        let dbRows = loadDatesFromDb();
        
        if (initialized !== 'true') {
          // First launch: populate with DEFAULTS in SQLite and mark as initialized
          replaceAllDatesInDb(DEFAULTS);
          dbRows = DEFAULTS;
          await AsyncStorage.setItem('db_initialized', 'true');
        }

        setDates(dbRows);
        setHistory(loadHistoryFromDb());
        setLoaded(true);

        checkExpiredTodos();
        await syncPendingDeletions();
      } catch (err) {
        console.error('Failed to load or initialize SQLite database:', err);
        setLoaded(true);
      }
    })();
  }, [syncPendingDeletions, checkExpiredTodos]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkExpiredTodos();
        syncPendingDeletions();
      }
    });
    return () => subscription.remove();
  }, [syncPendingDeletions, checkExpiredTodos]);

  const persist = useCallback((next: AnchorDate[]) => {
    setDates(next);
    replaceAllDatesInDb(next);
  }, []);

  const addDate = useCallback((label: string, dateISO: string, type: DateType) => {
    const isFuture = new Date(dateISO) > new Date();
    const finalType = isFuture ? 'todo' : type;
    const entry: AnchorDate = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      label,
      dateISO,
      type: finalType,
      icon: TYPE_ICONS[finalType] || '📝',
    };
    setDates((prev) => {
      const next = [...prev, entry];
      saveDateToDb(entry);
      return next;
    });
  }, []);

  const deleteDate = useCallback((id: string) => {
    setDates((prev) => {
      const matched = prev.find((d) => d.id === id);
      if (matched) {
        const histRow: HistoryEntry = {
          id: matched.id,
          label: matched.label,
          dateISO: matched.dateISO,
          type: matched.type,
          icon: matched.icon,
          deletedAtISO: new Date().toISOString(),
          createdAtISO: new Date(parseInt(matched.id) || Date.now()).toISOString(),
        };
        saveToHistoryDb(histRow);
        setHistory((prevH) => [histRow, ...prevH]);
      }
      const next = prev.filter((d) => d.id !== id);
      deleteDateFromDb(id);
      return next;
    });
  }, []);

  const restoreDate = useCallback((entry: HistoryEntry) => {
    const restored: AnchorDate = {
      id: entry.id,
      label: entry.label,
      dateISO: entry.dateISO,
      type: entry.type as any,
      icon: entry.icon,
    };
    setDates((prev) => {
      const next = [...prev, restored];
      saveDateToDb(restored);
      return next;
    });
    deleteFromHistoryDb(entry.id);
    setHistory((prevH) => prevH.filter((h) => h.id !== entry.id));
  }, []);

  const clearHistory = useCallback(() => {
    clearHistoryDb();
    setHistory([]);
  }, []);

  const updateDate = useCallback((id: string, patch: Partial<Omit<AnchorDate, 'id'>>) => {
    setDates((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
      updateDateInDb(id, patch);
      return next;
    });
  }, []);

  return { dates, history, loaded, addDate, deleteDate, restoreDate, clearHistory, updateDate, persist };
}
