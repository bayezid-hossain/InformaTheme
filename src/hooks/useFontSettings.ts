import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontId } from '../constants/fonts';

export type FontCategory = 'clock' | 'birthday' | 'anniversary' | 'milestone' | 'todo' | 'others';

export interface FontSetting {
  fontId: FontId;
  sizeOffset: number; // -2, -1, 0, +1, +2
}

export type FontSettings = Record<FontCategory, FontSetting>;

const STORAGE_KEY = 'font_settings';

const DEFAULTS: FontSettings = {
  clock:       { fontId: 'stencil', sizeOffset: 0 },
  birthday:    { fontId: 'modern',  sizeOffset: 0 },
  anniversary: { fontId: 'modern',  sizeOffset: 0 },
  milestone:   { fontId: 'modern',  sizeOffset: 0 },
  todo:        { fontId: 'modern',  sizeOffset: 0 },
  others:      { fontId: 'modern',  sizeOffset: 0 },
};

let globalSettings: FontSettings = { ...DEFAULTS };
let loadedFromStorage = false;
const listeners = new Set<(settings: FontSettings) => void>();

function broadcast() {
  listeners.forEach((l) => l({ ...globalSettings }));
}

export function useFontSettings() {
  const [settings, setSettings] = useState<FontSettings>(globalSettings);
  const [loaded, setLoaded] = useState(loadedFromStorage);

  useEffect(() => {
    const handleUpdate = (next: FontSettings) => {
      setSettings(next);
      setLoaded(true);
    };
    listeners.add(handleUpdate);

    if (!loadedFromStorage) {
      AsyncStorage.getItem(STORAGE_KEY).then((json) => {
        if (json) {
          try {
            const stored = JSON.parse(json) as Partial<FontSettings>;
            globalSettings = {
              clock:       { ...DEFAULTS.clock,       ...stored.clock },
              birthday:    { ...DEFAULTS.birthday,    ...stored.birthday },
              anniversary: { ...DEFAULTS.anniversary, ...stored.anniversary },
              milestone:   { ...DEFAULTS.milestone,   ...stored.milestone },
              todo:        { ...DEFAULTS.todo,        ...stored.todo },
              others:      { ...DEFAULTS.others,      ...stored.others },
            };
          } catch {}
        }
        loadedFromStorage = true;
        broadcast();
      });
    } else {
      setSettings(globalSettings);
      setLoaded(true);
    }

    return () => { listeners.delete(handleUpdate); };
  }, []);

  const setFont = useCallback((category: FontCategory, fontId: FontId) => {
    globalSettings = {
      ...globalSettings,
      [category]: { ...globalSettings[category], fontId },
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(globalSettings));
    broadcast();
  }, []);

  const setSizeOffset = useCallback((category: FontCategory, sizeOffset: number) => {
    const clamped = Math.max(-5, Math.min(10, sizeOffset));
    globalSettings = {
      ...globalSettings,
      [category]: { ...globalSettings[category], sizeOffset: clamped },
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(globalSettings));
    broadcast();
  }, []);

  return { settings, loaded, setFont, setSizeOffset };
}
