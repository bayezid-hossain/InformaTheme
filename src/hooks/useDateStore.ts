import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadDatesFromDb, saveDateToDb, deleteDateFromDb, updateDateInDb, replaceAllDatesInDb } from '../services/db';

export type DateType = 'birthday' | 'anniversary' | 'milestone';

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
};

const DEFAULTS: AnchorDate[] = [
  { id: '1', label: "Luka's Birthday", dateISO: '2020-06-15', type: 'birthday', icon: '🌱' },
  { id: '2', label: 'Anniversary', dateISO: '2018-09-22', type: 'anniversary', icon: '💍' },
  { id: '3', label: "Wife's Birthday", dateISO: '1995-04-10', type: 'birthday', icon: '🎂' },
];

export function useDateStore() {
  const [dates, setDates] = useState<AnchorDate[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const initialized = await AsyncStorage.getItem('db_initialized');
        const dbRows = loadDatesFromDb();
        
        if (initialized === 'true') {
          setDates(dbRows);
        } else {
          // First launch: populate with DEFAULTS in SQLite and mark as initialized
          replaceAllDatesInDb(DEFAULTS);
          setDates(DEFAULTS);
          await AsyncStorage.setItem('db_initialized', 'true');
        }
      } catch (err) {
        console.error('Failed to load or initialize SQLite database:', err);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: AnchorDate[]) => {
    setDates(next);
    replaceAllDatesInDb(next);
  }, []);

  const addDate = useCallback((label: string, dateISO: string, type: DateType) => {
    const entry: AnchorDate = {
      id: Date.now().toString(),
      label,
      dateISO,
      type,
      icon: TYPE_ICONS[type],
    };
    setDates((prev) => {
      const next = [...prev, entry];
      saveDateToDb(entry);
      return next;
    });
  }, []);

  const deleteDate = useCallback((id: string) => {
    setDates((prev) => {
      const next = prev.filter((d) => d.id !== id);
      deleteDateFromDb(id);
      return next;
    });
  }, []);

  const updateDate = useCallback((id: string, patch: Partial<Omit<AnchorDate, 'id'>>) => {
    setDates((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
      updateDateInDb(id, patch);
      return next;
    });
  }, []);

  return { dates, loaded, addDate, deleteDate, updateDate, persist };
}
