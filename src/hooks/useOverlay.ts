import { useCallback, useEffect, useState } from 'react';
import { AppState, NativeModules } from 'react-native';
import { ThemeColors } from '../theme/colors';
import { AnchorDate } from './useDateStore';
import { totalDays, nextEventCountdown } from '../utils/dateCalc';

const { LockscreenModule } = NativeModules;

export function useOverlay() {
  const [active, setActive] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const running = LockscreenModule ? await LockscreenModule.isOverlayActive() : false;
      setActive(running);
    } catch {
      setActive(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') checkStatus();
    });
    return () => sub.remove();
  }, [checkStatus]);

  const syncData = useCallback(async (variant: string, colors: ThemeColors, dates: AnchorDate[], weather?: string, widgets?: string[], wallpaper?: string, wallpaperFilter?: string, fontId?: string, fontSettings?: any) => {
    if (!LockscreenModule?.syncOverlayData) return;
    console.log('[useOverlay] syncData called with variant:', variant, 'wallpaper:', wallpaper, 'filter:', wallpaperFilter);
    setSyncing(true);
    try {
      const wpName = wallpaper || `wp_${variant.replace(/([A-Z])/g, '_$1').toLowerCase()}`;
      const themeJson = JSON.stringify({
        variant,
        bg: colors.bg,
        bg1: colors.bg1,
        bg2: colors.bg2,
        accent: colors.accent,
        text: colors.text,
        text2: colors.text2,
        text3: colors.text3,
        tagline: colors.tagline || 'BEST YEARS AHEAD',
        weather: weather || '',
        widgets: widgets || ['clock', 'battery', 'todo', 'birthday', 'anniversary', 'milestone', 'weather'],
        wallpaper: wpName,
        wallpaperFilter: wallpaperFilter || 'original',
        fontId: fontId || 'stencil',
        fontSettings: fontSettings || null,
      });
      const sortedTodos = [...dates]
        .filter(d => d.type === 'todo')
        .sort((a, b) => {
          const daysA = nextEventCountdown(new Date(a.dateISO)).totalDays;
          const daysB = nextEventCountdown(new Date(b.dateISO)).totalDays;
          return daysA - daysB; // earliest todo first
        });

      const sortedBirthdays = [...dates]
        .filter(d => d.type === 'birthday')
        .sort((a, b) => {
          const daysA = nextEventCountdown(new Date(a.dateISO)).totalDays;
          const daysB = nextEventCountdown(new Date(b.dateISO)).totalDays;
          return daysA - daysB; // closest upcoming birthday first
        });

      const sortedAnniversaries = [...dates]
        .filter(d => d.type === 'anniversary')
        .sort((a, b) => {
          const daysA = nextEventCountdown(new Date(a.dateISO)).totalDays;
          const daysB = nextEventCountdown(new Date(b.dateISO)).totalDays;
          return daysA - daysB; // closest upcoming anniversary first
        });

      const sortedMilestones = [...dates]
        .filter(d => d.type === 'milestone')
        .sort((a, b) => {
          const daysA = totalDays(new Date(a.dateISO));
          const daysB = totalDays(new Date(b.dateISO));
          return daysA - daysB; // smallest days elapsed (most recent milestone) first
        });

      const sortedDates = [...sortedTodos, ...sortedBirthdays, ...sortedAnniversaries, ...sortedMilestones];
      const datesJson = JSON.stringify(sortedDates);
      await LockscreenModule.syncOverlayData(themeJson, datesJson);
    } catch (e) {
      console.error('[useOverlay] syncData failed:', e);
    }
    setSyncing(false);
  }, []);

  const start = useCallback(async (variant: string, colors: ThemeColors, dates: AnchorDate[], wallpaper?: string, wallpaperFilter?: string) => {
    if (!LockscreenModule) return;
    try {
      // Sync data first
      await syncData(variant, colors, dates, undefined, undefined, wallpaper, wallpaperFilter);
      // Then start
      await LockscreenModule.startOverlay();
      setActive(true);
    } catch (e) {
      console.error('[useOverlay] start failed:', e);
    }
  }, [syncData]);

  const stop = useCallback(async () => {
    if (!LockscreenModule) return;
    try {
      await LockscreenModule.stopOverlay();
      setActive(false);
    } catch (e) {
      console.error('[useOverlay] stop failed:', e);
    }
  }, []);

  const toggle = useCallback(async (variant: string, colors: ThemeColors, dates: AnchorDate[], wallpaper?: string, wallpaperFilter?: string) => {
    if (active) {
      await stop();
    } else {
      await start(variant, colors, dates, wallpaper, wallpaperFilter);
    }
  }, [active, start, stop]);

  return { active, syncing, start, stop, toggle, syncData, checkStatus };
}
