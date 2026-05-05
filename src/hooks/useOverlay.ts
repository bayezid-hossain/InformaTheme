import { useCallback, useEffect, useState } from 'react';
import { AppState, NativeModules } from 'react-native';
import { ThemeColors } from '../theme/colors';
import { AnchorDate } from './useDateStore';

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

  const syncData = useCallback(async (variant: string, colors: ThemeColors, dates: AnchorDate[], weather?: string, widgets?: string[]) => {
    if (!LockscreenModule?.syncOverlayData) return;
    console.log('[useOverlay] syncData called with variant:', variant);
    setSyncing(true);
    try {
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
        weather: weather || 'WEATHER 22°C (Bhaluka)',
        widgets: widgets || ['clock', 'milestone', 'anniversary', 'birthday', 'weather']
      });
      const datesJson = JSON.stringify(dates);
      await LockscreenModule.syncOverlayData(themeJson, datesJson);
    } catch (e) {
      console.error('[useOverlay] syncData failed:', e);
    }
    setSyncing(false);
  }, []);

  const start = useCallback(async (variant: string, colors: ThemeColors, dates: AnchorDate[]) => {
    if (!LockscreenModule) return;
    try {
      // Sync data first
      await syncData(variant, colors, dates);
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

  const toggle = useCallback(async (variant: string, colors: ThemeColors, dates: AnchorDate[]) => {
    if (active) {
      await stop();
    } else {
      await start(variant, colors, dates);
    }
  }, [active, start, stop]);

  return { active, syncing, start, stop, toggle, syncData, checkStatus };
}
