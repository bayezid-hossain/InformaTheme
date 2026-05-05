import { useEffect, useState, useCallback } from 'react';
import { Platform, Linking, NativeModules, AppState, PermissionsAndroid } from 'react-native';

const { LockscreenModule } = NativeModules;
const PKG = 'com.informatheme.app';

export interface PermissionState {
  overlay: boolean;
  fullScreenIntent: boolean;
  notifications: boolean;
  loading: boolean;
}

export function usePermissions() {
  const [state, setState] = useState<PermissionState>({
    overlay: false,
    fullScreenIntent: false,
    notifications: false,
    loading: true,
  });

  const check = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setState({ overlay: true, fullScreenIntent: true, notifications: true, loading: false });
      return;
    }
    try {
      const overlay = LockscreenModule ? await LockscreenModule.checkOverlayPermission() : false;
      const fsi     = LockscreenModule ? await LockscreenModule.checkFullScreenIntentPermission() : false;
      const androidVersion = parseInt(Platform.Version.toString(), 10);
      const notifications = androidVersion >= 33
        ? await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
        : true;
      setState({ overlay, fullScreenIntent: fsi, notifications, loading: false });
    } catch {
      setState({ overlay: false, fullScreenIntent: false, notifications: false, loading: false });
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
    Linking.sendIntent('android.settings.action.MANAGE_APP_USE_FULL_SCREEN_INTENT', [
      { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
    ]).catch(() =>
      Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
        { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
      ]).catch(() =>
        Linking.sendIntent('android.settings.APPLICATION_DETAILS_SETTINGS', [
          { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
        ]).catch(() => Linking.openSettings()),
      ),
    );
  }

  async function requestNotifications(): Promise<void> {
    const androidVersion = parseInt(Platform.Version.toString(), 10);
    if (Platform.OS !== 'android' || androidVersion < 33) {
      setState((s) => ({ ...s, notifications: true }));
      return;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      // Denied or never-ask-again — open settings so user can enable manually
      openNotificationSettings();
    }
    check();
  }

  function openNotificationSettings() {
    Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
      { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
    ]).catch(() => Linking.openSettings());
  }

  return {
    ...state,
    check,
    openOverlaySettings,
    openFSISettings,
    requestNotifications,
    openNotificationSettings,
  };
}
