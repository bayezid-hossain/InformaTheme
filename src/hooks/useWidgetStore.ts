import { useCallback, useEffect, useState } from 'react';
import { getJSON, setJSON } from '../services/storage';

export interface Widget {
  id: string;
  name: string;
  desc: string;
  icon: string;
  enabled: boolean;
}

const STORAGE_KEY = 'widget_states';

const DEFAULTS: Widget[] = [
  { id: 'clock', name: 'Clock', desc: 'Large stencil digital clock', icon: '🕐', enabled: true },
  { id: 'battery', name: 'Battery', desc: 'Show battery percentage & charging status', icon: '🔋', enabled: true },
  { id: 'todo', name: 'Todo Tracker', desc: 'Days remaining for future events', icon: '📝', enabled: true },
  { id: 'birthday', name: 'Birthday Tracker', desc: 'Days / age countdown to birthdays', icon: '🎂', enabled: true },
  { id: 'anniversary', name: 'Anniversary', desc: 'Circular progress to next anniversary', icon: '💍', enabled: true },
  { id: 'milestone', name: 'Milestone Tracker', desc: 'Days / age since anchor date', icon: '📅', enabled: true },
  { id: 'weather', name: 'Weather', desc: 'Current conditions + temperature', icon: '☁️', enabled: true },
];

let globalWidgets: Widget[] = DEFAULTS;
let loadedFromStorage = false;
const listeners = new Set<(widgets: Widget[]) => void>();

export function useWidgetStore() {
  const [widgets, setWidgets] = useState<Widget[]>(globalWidgets);
  const [loaded, setLoaded] = useState(loadedFromStorage);

  useEffect(() => {
    const handleUpdate = (nextWidgets: Widget[]) => {
      setWidgets(nextWidgets);
      setLoaded(true);
    };
    listeners.add(handleUpdate);

    if (!loadedFromStorage) {
      getJSON<Record<string, boolean>>(STORAGE_KEY).then((stored) => {
        if (stored) {
          globalWidgets = DEFAULTS.map((w) => ({ ...w, enabled: stored[w.id] ?? w.enabled }));
        }
        loadedFromStorage = true;
        setLoaded(true);
        listeners.forEach((l) => l(globalWidgets));
      });
    } else {
      setWidgets(globalWidgets);
      setLoaded(true);
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    globalWidgets = globalWidgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    const stateMap = Object.fromEntries(globalWidgets.map((w) => [w.id, w.enabled]));
    setJSON(STORAGE_KEY, stateMap);
    listeners.forEach((l) => l(globalWidgets));
  }, []);

  return { widgets, loaded, toggle };
}
