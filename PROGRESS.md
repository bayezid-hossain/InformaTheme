# InformaTheme — Progress Log

---

## 2026-05-03 — Project Initialization

**Plan:** Initialize Expo project with tooling scripts, NativeWind config, folder structure, config plugin, and meta files.

**Steps completed:**
1. Expo blank-typescript scaffold initialized via `create-expo-app@latest` (temp dir, then copied)
2. Dependencies installed: nativewind, tailwindcss, react-native-reanimated, expo-blur, expo-battery, expo-task-manager, expo-secure-store, react-native-svg, lucide-react-native, date-fns, expo-font
3. NativeWind v4 configured: tailwind.config.js, babel.config.js, metro.config.js, global.css, App.tsx updated
4. Folder structure created: src/{components,screens/[6 screens],hooks,services,native,utils,theme}, plugins/, android-src-staging/
5. app.json updated: name=InformaTheme, package=com.informatheme.app, targetSdkVersion=35, lockscreen permissions, plugin registered
6. Theme tokens created: src/theme/colors.ts (darkPremium, warmLight, glassmorphism)
7. Tooling scripts created: connect.bat, run.bat, build.bat, prebuild.bat, prebuild.js, release.bat, release.js, add-changelog.js
8. Config plugin created: plugins/withInformaThemeModule.js (copy sources, manifest patch for LockscreenActivity, build.gradle deps, ProGuard rules)
9. Meta files created: CHANGELOG.md, CLAUDE.md, PROGRESS.md

**Deviations:**
- Used NativeWind v4.2.3 (installed by `npx expo install`) — plan said v5, but v5 is not yet stable for Expo 54 / RN 0.81
- `expo-background-task` not installed separately — covered by `expo-task-manager` in Expo 54
- `newArchEnabled: false` initially set — corrected in next session (see below)
- Init done via temp dir `InformaTheme-init` then file copy (create-expo-app refused to run in non-empty dir)

---

## 2026-05-04 — Fix new arch + first successful build

**Plan:** Fix reanimated v4 new-arch requirement and get app running on device.

**Steps completed:**
1. `newArchEnabled` set to `true` in: android/gradle.properties, app.json, plugins/withInformaThemeModule.js
2. `npx expo run:android` — BUILD SUCCESSFUL (7m 33s), APK installed on Pixel 7

**Warnings (non-blocking):**
- `ReactNativeHost` deprecation in MainApplication.kt (auto-generated, harmless)
- Gradle 9.0 deprecation warnings (Gradle 8.x, no action needed)

**Deviations:** None.

---

## 2026-05-04 — Full app UI (navigation + all screens)

**Plan:** Build drawer navigation, shared components, and all 6 screens.

**Steps completed:**
1. Installed: `@react-navigation/native`, `@react-navigation/drawer`, `@react-navigation/native-stack`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `@react-native-async-storage/async-storage`
2. Theme system: `src/theme/colors.ts` (ThemeColors interface, darkPremium/warmLight/glassmorphism), `src/hooks/useTheme.ts` (context), `src/hooks/useThemeProvider.ts`
3. Shared components: `AppStatusBar` (live clock, signal icons), `TopBar` (hamburger/back + title), `DrawerContent` (5-item drawer with active highlight)
4. Navigator: `src/navigation/AppNavigator.tsx` — drawer with 5 routes, custom DrawerContent
5. Screens:
   - `OnboardingScreen` — 4-step flow, progress dots, permission cards, skip to main after finish
   - `HomeScreen` — greeting, theme switcher card, anchor dates with day counts, quick actions grid
   - `DatesScreen` — anchor dates list, type filter chips, add-date modal, live age calc
   - `WidgetsScreen` — 8 toggleable widgets, active count summary, toggle switches
   - `WallpapersScreen` — 6 built-in gradient wallpapers + upload slot, single-select
   - `SettingsScreen` — 3-section menu (Account, Permissions, App)
6. `App.tsx` wired: GestureHandlerRootView + SafeAreaProvider + ThemeContext + onboarding gate (AsyncStorage)
7. tsc: clean

**Deviations:**
- ThemeColors exported as interface (not `typeof darkPremium`) to allow cross-theme Record assignment

---

## 2026-05-04 — Components, fonts, permissions, Kotlin stubs

**Plan:** Build all reusable components, date utils, hooks, lockscreen preview, native bridge stubs, font loading, and full permission flow.

**Steps completed:**
1. Installed: `@expo-google-fonts/sirin-stencil`, `@expo-google-fonts/space-grotesk`, `@expo-google-fonts/space-mono`, `expo-battery`, `expo-linear-gradient`
2. `src/utils/dateCalc.ts` — liveAge, totalDays, daysUntilNextBirthday, progressToNextBirthday, anniversaryProgress
3. `src/hooks/useBattery.ts` — expo-battery level + charging state with event listeners
4. `src/hooks/usePermissions.ts` — overlay + FSI check via LockscreenModule, AppState re-check on foreground, openOverlaySettings / openFSISettings
5. Components: GlassBubble (BlurView + glass styles), Clock (stencil/mono/bold variants), ProgressRing (SVG + strokeDasharray), BatteryWidget (Reanimated width animation), MilestoneBubble (liveAge + rings), LockscreenPreview (phone frame + LinearGradient + all widgets)
6. Kotlin stubs in `android-src-staging/`: LockscreenActivity (WindowManager flags), LockscreenModule (startOverlay, checkOverlayPermission, checkFullScreenIntentPermission), LockscreenPackage, LockscreenService, LockscreenReceiver
7. `src/native/LockscreenModule.ts` — JS bridge with graceful stub fallback
8. App.tsx: useFonts loading (SirinStencil, SpaceGrotesk, SpaceMono), blocks render until fonts ready
9. HomeScreen: added LockscreenPreview phone mockup above theme switcher
10. OnboardingScreen: full permission flow — openOverlaySettings/openFSISettings, AppState listener auto-advances, "Open Settings Again" + "Skip for now" buttons
11. tsc: clean

**Deviations:**
- `SpaceGrotesk_800ExtraBold` doesn't exist in package — used `SpaceGrotesk_700Bold` instead
- `add-changelog.js` creates duplicate `### Added` headers (cosmetic, doesn't affect functionality)

---

## 2026-05-03 — Persistence, live permissions, lockscreen activation, background task

**Plan:** Wire all screens with real data persistence, live permission status, lockscreen activation toggle, and background milestone task.

**Steps completed:**
1. `src/services/storage.ts` — generic AsyncStorage helpers (getJSON/setJSON/removeKey)
2. `src/hooks/useDateStore.ts` — anchor dates CRUD persisted in AsyncStorage key `anchor_dates`, defaults to 3 sample dates
3. `src/hooks/useWidgetStore.ts` — widget enabled states persisted in AsyncStorage key `widget_states`
4. `src/services/backgroundTask.ts` — expo-task-manager task `MILESTONE_REFRESH` defined at module level, imported in App.tsx before AppRegistry
5. `DatesScreen` — wired to useDateStore (load/add/delete), delete via Alert confirm, empty state placeholder
6. `WidgetsScreen` — wired to useWidgetStore (persisted toggles)
7. `SettingsScreen` — usePermissions wired: overlay + FSI rows show live granted/denied badges, tap row opens Settings if not granted, warning banner when permissions missing
8. `HomeScreen` — lockscreen activation toggle: checks perms, calls LockscreenModule.startOverlay()/stopOverlay(), isOverlayActive() on mount, shows state-appropriate CTA; anchor dates from useDateStore (live, first 3); redirects to Settings if perms missing
9. `App.tsx` — imports backgroundTask module at top to register task before AppRegistry
10. tsc: clean

**Deviations:** None.

---

## 2026-05-04 — Design match, instant refresh, keyboard fix, FSI fallback

**Plan:** Redesign OnboardingScreen + HomeScreen to match mockup exactly, fix date changes not reflecting instantly, fix keyboard hiding bottom sheet inputs, improve FSI permission fallback chain.

**Steps completed:**
1. `src/hooks/useKeyboardVisible.ts` — ported from poultry-solution pattern
2. `src/context/DateStoreContext.tsx` — DateStoreProvider wrapping single useDateStore instance; useDates() hook; fixes instant cross-screen refresh
3. `src/hooks/usePermissions.ts` — FSI fallback chain: MANAGE_APP_USE_FULL_SCREEN_INTENT → APP_NOTIFICATION_SETTINGS → APPLICATION_DETAILS_SETTINGS → openSettings(); overlay passes APP_PACKAGE extra
4. `OnboardingScreen` — redesigned: per-step accent colors (green/teal/purple/orange), Step 4 two independent Grant buttons + checkmarks + FSI hint text for missing settings page
5. `HomeScreen` — redesigned to match mockup: greeting header + avatar, Active Theme dark-green card, Anchor Dates with DAYS LEFT + type colors, dashed add row, Quick Actions 2×2 with icon badges; uses useDates() context
6. `DatesScreen` — useDates() context; KeyboardAvoidingView bottom sheet with conditional kbBehavior; type-specific color badges; drag handle
7. `App.tsx` — DateStoreProvider wraps navigation + onboarding
8. tsc: clean

**Deviations:** None.

---

## 2026-05-04 — UI Modernization, Native Overlay, Permission Fixes

**Plan:** Remove drawer navigation in favor of stack, remove mockup status bars, overhaul InformaAlert, fix native permission bugs, and implement the real WindowManager overlay.

**Steps completed:**
1. `src/navigation/AppNavigator.tsx` — Switched from Drawer to Stack navigation to remove sidebar.
2. `App.tsx` & `src/components/LockscreenPreview.tsx` — Hid system status bar and removed mock time/wifi components.
3. `src/components/InformaAlert.tsx` — Redesigned with Industrial Urgency theme (blur, uppercase Sirin Stencil, danger bar).
4. `android/app/src/main/java/com/informatheme/app/MainApplication.kt` & `plugins/withInformaThemeModule.js` — Manually registered `LockscreenPackage()` to fix "Required" overlay permission state.
5. `android-src-staging/LockscreenModule.kt` — Added `setupNotificationChannel` to fix Full Screen Intent missing settings toggle, called on mount in `usePermissions.ts`.
6. `android-src-staging/LockscreenService.kt` — Implemented full WindowManager overlay rendering theme colors and parsed dates from SharedPreferences. Changed trigger to `ACTION_SCREEN_OFF` to prevent flashing during unlock.
7. `src/hooks/useOverlay.ts` — Added JS syncData and toggle functions.
8. `App.tsx` — Enforces permission checks on startup by redirecting to `OnboardingScreen` step 3 if `overlay` or `fullScreenIntent` is missing, even if onboarded.

**Deviations:** None.

---

## 2026-05-05 — Fix overlay: FSI approach, native Activity, remove MainActivity showWhenLocked

**Plan:** Fix three root-cause bugs in the overlay system: (1) main RN app appearing as lockscreen overlay, (2) overlay going under keyguard / only visible briefly on unlock, (3) overlay only active while main app is in foreground.

**Root causes identified:**
- `MainActivity` had `android:showWhenLocked="true"` — caused the RN app itself to show over the keyguard when the app was in the foreground.
- `LockscreenService` used `TYPE_APPLICATION_OVERLAY` WindowManager with `FLAG_SHOW_WHEN_LOCKED`. On Android 12+ (targetSdk 35), this doesn't render above the keyguard. View goes below it. Explains "overlay visible for brief moment when unlocking."
- `LockscreenActivity` extended `ReactActivity("InformaTheme")` — showed the RN main app instead of the designed overlay UI.

**Steps completed:**
1. `android-src-staging/LockscreenActivity.kt` — Complete rewrite. Extends `Activity` (not ReactActivity). Builds native overlay UI (clock, date tagline, anchor date cards, quote, swipe-to-unlock). Registers receiver for `ACTION_USER_PRESENT` and `ACTION_DISMISS` broadcast. Clock updates every 30s. Swipe-up calls `finishAndRemoveTask()`. Back blocked.
2. `android-src-staging/LockscreenService.kt` — Removed WindowManager overlay entirely. `ACTION_SCREEN_OFF` → posts high-priority FSI notification (`CATEGORY_ALARM`, `setFullScreenIntent`) targeting `LockscreenActivity`. `ACTION_USER_PRESENT` → cancels FSI notification + broadcasts `ACTION_DISMISS`. Added `informatheme_fsi` channel (IMPORTANCE_HIGH).
3. `plugins/withInformaThemeModule.js` — Removed `showWhenLocked`/`turnScreenOn` from `MainActivity`. Added `taskAffinity=""`/`excludeFromRecents="true"` to `LockscreenActivity`.

**Deviations:** None.

---

## 2026-05-05 — Fix POST_NOTIFICATIONS, receiver crash, notifications permission flow

**Plan:** Fix "no overlay shown at all" regression caused by missing POST_NOTIFICATIONS permission and API 33+ registerReceiver crash.

**Root causes identified:**
- `POST_NOTIFICATIONS` never requested at runtime on Android 13+ → `NotificationManager.notify()` silently drops FSI notification → overlay never fires.
- `LockscreenActivity.registerDismissReceiver()` called `registerReceiver()` without export flag on API 33+ → `IllegalArgumentException` crash in `onCreate()` → activity never displays.
- `App.tsx` `missingPermissions` check excluded notifications → users could reach main app without granting notification permission.
- `LockscreenActivity` used `Theme.Translucent.NoTitleBar.Fullscreen` → keyguard/wallpaper could bleed through before background color painted.

**Steps completed:**
1. `app.json` — Added `android.permission.POST_NOTIFICATIONS` to permissions array.
2. `src/hooks/usePermissions.ts` — Added `notifications: boolean` to `PermissionState`. Check via `PermissionsAndroid.check(POST_NOTIFICATIONS)` on API 33+. Added `requestNotifications()` (runtime request with settings fallback) and `openNotificationSettings()`.
3. `src/screens/onboarding/OnboardingScreen.tsx` — Added Notifications permission card (Android 13+ only). Updated `handleCTA()`, `ctaLabel()`, `allGranted`, and `waiting` type to cover notifications.
4. `App.tsx` — Added `needsNotifPerm` check; `missingPermissions` now includes `perms.notifications` for Android 13+.
5. `android-src-staging/LockscreenActivity.kt` — Fixed `registerDismissReceiver()`: uses `RECEIVER_NOT_EXPORTED` on API 33+ (required because `ACTION_DISMISS` is a non-system broadcast).
6. `android-src-staging/LockscreenService.kt` — Fixed `registerScreenReceiver()`: uses `RECEIVER_EXPORTED` on API 33+ for system broadcast receiver.
7. `plugins/withInformaThemeModule.js` — Changed `LockscreenActivity` theme from `Theme.Translucent` to `Theme.Black.NoTitleBar.Fullscreen` to prevent keyguard bleed-through.

**Deviations:** None.
