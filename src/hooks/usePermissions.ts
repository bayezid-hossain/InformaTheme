import { useEffect, useState, useCallback } from 'react';
import { Platform, Linking, NativeModules, AppState } from 'react-native';

const { LockscreenModule } = NativeModules;
const PKG = 'com.informatheme.app';

export interface PermissionState {
  overlay: boolean;
  fullScreenIntent: boolean;
  loading: boolean;
}

export function usePermissions() {
  const [state, setState] = useState<PermissionState>({ overlay: false, fullScreenIntent: false, loading: true });

  const check = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setState({ overlay: true, fullScreenIntent: true, loading: false });
      return;
    }
    try {
      const overlay = LockscreenModule ? await LockscreenModule.checkOverlayPermission() : false;
      const fsi = LockscreenModule ? await LockscreenModule.checkFullScreenIntentPermission() : false;
      setState({ overlay, fullScreenIntent: fsi, loading: false });
    } catch {
      setState({ overlay: false, fullScreenIntent: false, loading: false });
    }
  }, []);

  useEffect(() => {
    check();
    if (LockscreenModule?.setupNotificationChannel) {
      LockscreenModule.setupNotificationChannel();
    }
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') check();
    });
    return () => sub.remove();
  }, [check]);

  function openOverlaySettings() {
    Linking.sendIntent('android.settings.action.MANAGE_OVERLAY_PERMISSION', [
      { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
    ]).catch(() => Linking.openSettings());
  }

  function openFSISettings() {
    // Try dedicated FSI settings page (API 34+, Pixel/stock Android)
    Linking.sendIntent('android.settings.action.MANAGE_APP_USE_FULL_SCREEN_INTENT', [
      { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
    ]).catch(() =>
      // Try app notification settings (shows Notifications page, user taps "Allow full-screen displays")
      Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
        { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
      ]).catch(() =>
        // Final fallback: app info page
        Linking.sendIntent('android.settings.APPLICATION_DETAILS_SETTINGS', [
          { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
        ]).catch(() => Linking.openSettings()),
      ),
    );
  }

  return { ...state, check, openOverlaySettings, openFSISettings };
}
