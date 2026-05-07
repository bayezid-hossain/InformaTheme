import { useEffect, useState, useCallback } from 'react';
import { Platform, Linking, NativeModules, AppState, PermissionsAndroid } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { LockscreenModule } = NativeModules;
const PKG = 'com.informatheme.app';

export interface PermissionState {
  overlay: boolean;
  notifications: boolean;
  mediaLibrary: boolean;
  storage: boolean;
  loading: boolean;
}

export function usePermissions() {
  const [state, setState] = useState<PermissionState>({
    overlay: false,
    notifications: false,
    mediaLibrary: false,
    storage: false,
    loading: true,
  });

  const check = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setState({ overlay: true, notifications: true, mediaLibrary: true, storage: true, loading: false });
      return;
    }
    try {
      const overlay = LockscreenModule ? await LockscreenModule.checkOverlayPermission() : false;
      const androidVersion = parseInt(Platform.Version.toString(), 10);
      const notifications = androidVersion >= 33
        ? await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
        : true;
      const { status: mediaStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      const storage = androidVersion >= 33
        ? true
        : await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      setState({ overlay, notifications, mediaLibrary: mediaStatus === 'granted', storage, loading: false });
    } catch {
      setState({ overlay: false, notifications: false, mediaLibrary: false, storage: false, loading: false });
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
    if (LockscreenModule?.openOverlaySettings) {
      LockscreenModule.openOverlaySettings().catch(() => {
        Linking.sendIntent('android.settings.action.MANAGE_OVERLAY_PERMISSION', [
          { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
        ]).catch(() => Linking.openSettings());
      });
    } else {
      Linking.sendIntent('android.settings.action.MANAGE_OVERLAY_PERMISSION', [
        { key: 'android.provider.extra.APP_PACKAGE', value: PKG },
      ]).catch(() => Linking.openSettings());
    }
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
      openNotificationSettings();
    }
    check();
  }

  async function requestMediaLibrary(): Promise<void> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setState((s) => ({ ...s, mediaLibrary: status === 'granted' }));
  }

  async function requestStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    const androidVersion = parseInt(Platform.Version.toString(), 10);
    if (androidVersion >= 33) {
      setState((s) => ({ ...s, storage: true }));
      return true;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    const granted = result === PermissionsAndroid.RESULTS.GRANTED;
    setState((s) => ({ ...s, storage: granted }));
    return granted;
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
    requestNotifications,
    requestMediaLibrary,
    requestStoragePermission,
    openNotificationSettings,
  };
}
