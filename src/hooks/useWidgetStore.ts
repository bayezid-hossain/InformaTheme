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
  { id: 'milestone', name: 'Milestone Tracker', desc: 'Days / age since anchor date', icon: '📅', enabled: true },
  { id: 'anniversary', name: 'Anniversary', desc: 'Circular progress to next anniversary', icon: '💍', enabled: true },
  { id: 'weather', name: 'Weather', desc: 'Current conditions + temperature', icon: '☁️', enabled: true },
];

export function useWidgetStore() {
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getJSON<Record<string, boolean>>(STORAGE_KEY).then((stored) => {
      if (stored) {
        setWidgets(DEFAULTS.map((w) => ({ ...w, enabled: stored[w.id] ?? w.enabled })));
      }
      setLoaded(true);
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
      const stateMap = Object.fromEntries(next.map((w) => [w.id, w.enabled]));
      setJSON(STORAGE_KEY, stateMap);
      return next;
    });
  }, []);

  return { widgets, loaded, toggle };
}
