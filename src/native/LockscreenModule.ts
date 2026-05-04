import { NativeModules, Platform } from 'react-native';

interface LockscreenModuleInterface {
  startOverlay(): Promise<void>;
  stopOverlay(): Promise<void>;
  isOverlayActive(): Promise<boolean>;
  checkOverlayPermission(): Promise<boolean>;
  checkFullScreenIntentPermission(): Promise<boolean>;
}

const { LockscreenModule } = NativeModules;

const stub: LockscreenModuleInterface = {
  startOverlay: () => Promise.resolve(),
  stopOverlay: () => Promise.resolve(),
  isOverlayActive: () => Promise.resolve(false),
  checkOverlayPermission: () => Promise.resolve(false),
  checkFullScreenIntentPermission: () => Promise.resolve(false),
};

export default (Platform.OS === 'android' && LockscreenModule
  ? (LockscreenModule as LockscreenModuleInterface)
  : stub);
