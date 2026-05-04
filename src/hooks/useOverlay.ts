import { useState, useEffect, useCallback } from 'react';
import { NativeModules, AppState } from 'react-native';
import { AnchorDate } from './useDateStore';
import { ThemeColors } from '../theme/colors';

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

  const syncData = useCallback(async (colors: ThemeColors, dates: AnchorDate[]) => {
    if (!LockscreenModule?.syncOverlayData) return;
    setSyncing(true);
    try {
      const themeJson = JSON.stringify({
        bg: colors.bg,
        accent: colors.accent,
        text: colors.text,
        text2: colors.text2,
        text3: colors.text3,
      });
      const datesJson = JSON.stringify(dates);
      await LockscreenModule.syncOverlayData(themeJson, datesJson);
    } catch (e) {
      console.error('[useOverlay] syncData failed:', e);
    }
    setSyncing(false);
  }, []);

  const start = useCallback(async (colors: ThemeColors, dates: AnchorDate[]) => {
    if (!LockscreenModule) return;
    try {
      // Sync data first
      await syncData(colors, dates);
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

  const toggle = useCallback(async (colors: ThemeColors, dates: AnchorDate[]) => {
    if (active) {
      await stop();
    } else {
      await start(colors, dates);
    }
  }, [active, start, stop]);

  return { active, syncing, start, stop, toggle, syncData, checkStatus };
}
