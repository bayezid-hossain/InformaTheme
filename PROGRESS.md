# InformaTheme — Progress Log

---

## 2026-05-07 (session 5) — Crop: top/bottom context visibility

**Plan:** Add top/bottom dim panels to crop view so user can see what's being cut vertically (same as existing left/right panels).

**Steps completed:**
1. Added `VERT_MARGIN = 52` constant — pixels of image context shown above/below the crop frame.
2. Recalculated `CROP_DISP_H = min(SCREEN_W * CROP_ASPECT, MAX_CROP_H - 2*VERT_MARGIN)` so the crop frame always fits inside the container with margin on all sides.
3. Added `CONTAINER_H = CROP_DISP_H + 2*VERT_MARGIN` and `SIDE_MARGIN = (SCREEN_W - CROP_DISP_W) / 2`.
4. Updated crop view container to use `CONTAINER_H`.
5. Added top and bottom dim panels (matching left/right style).
6. Updated crop frame border to be positioned at `left: SIDE_MARGIN, top: VERT_MARGIN, width: CROP_DISP_W, height: CROP_DISP_H`.
7. Crop math in `handleApplyCrop` unchanged — `cx/cy` calculation is frame-relative and still correct.

**Deviations:** None.

---

## 2026-05-07 (session 4) — ThemeScreen no-scroll layout

**Plan:** Reorganize ThemeScreen so the preview is always visible. Replace single vertical scroll with three horizontal tabs (Themes / Fonts / Palette) below the preview.

**Steps completed:**
1. Rewrote `ThemeScreen.tsx`: removed outer `ScrollView`; preview always visible at top (38% screen height, scale calculated from available space).
2. Three-tab bar (Themes / Fonts / Palette) replaces the stacked sections.
3. Themes tab: horizontal `ScrollView` of theme cards.
4. Fonts tab: category row + font picker + size stepper — all fits vertically without scrolling.
5. Palette tab: 4-swatch color grid.
6. No vertical scrolling anywhere — preview stays on screen while user tweaks any setting.

**Deviations:** None.

---

## 2026-05-07 (session 3) — Fix font reactivity in preview; improve native card design

**Plan:** Font changes for birthday/anniversary/milestone not reflecting in JS theme preview. Native card boxes look plain. Fix both.

**Steps completed:**
1. `MilestoneBubble.tsx`: removed `fontFamily`/`sizeOffset` props; component now calls `useFontSettings()` directly for 'birthday' category — same reactive pattern as Clock.
2. `MilestoneCard.tsx`: same pattern for 'milestone' category.
3. `LockscreenPreview.tsx` / `AnniversaryCard`: same pattern for 'anniversary' category. Dropped unused `bdFont`/`annFont`/`msFont` variables and stale prop passing.
4. Native `cardBackground()`: replaced flat `Color.argb(180)` with top-to-bottom gradient (`210→170` alpha), `cornerRadius` 16→20dp, border alpha 30→70 for dark themes / 40 for light. Returns `LayerDrawable` (gradient + border). Updated all 4 call sites with `isLight` flag.
5. Synced `LockscreenActivity.kt` staging → production.

**Deviations:** None.

---

## 2026-05-07 (session 2) — Remove duplicate widgets; fix font propagation to overlay

**Plan:** Remove duplicate battery+weather from top of lockscreen (JS + native). Fix font applying to all card texts in native (synthetic BOLD was overriding custom font). Wire fontSettings to native overlay via AppNavigator.

**Steps completed:**
1. Removed unused `BatteryWidget` import from `LockscreenPreview.tsx` (top row already deleted in prior session).
2. Removed "Top row: Battery & Weather" block from `android-src-staging/LockscreenActivity.kt`.
3. Fixed synthetic BOLD on custom fonts in native: `setTypeface(catTypeface, Typeface.BOLD)` → `typeface = catTypeface` for all card builder TextViews (birthday label, milestone day count, time elapsed, annual cycle, next event, battery widget text, pill text).
4. Updated `AppNavigator.tsx`: imported `useFontSettings`, added `fontSettings` to syncData call and dependency array so native overlay always gets current per-category font settings.
5. Synced `android-src-staging/LockscreenActivity.kt` → production `android/app/…/LockscreenActivity.kt`.

**Deviations:** None.

---

## 2026-05-07 — Font system, UI cleanup

**Plan:** Font picker (8 fonts) in ThemeScreen + Settings. Clock uses selected font. Native overlay respects font. Remove "›" from Active Theme in Settings. Change "Edit" → "Change" in HomeScreen.

**Steps completed:**
1. Downloaded 5 new TTF fonts (BebasNeue, Orbitron, PlayfairDisplay, Raleway, JosefinSans) to `assets/fonts/` and `android/app/src/main/assets/fonts/`.
2. Copied SpaceMono_700Bold.ttf and SpaceGrotesk_700Bold.ttf from node_modules to both font directories.
3. Created `src/constants/fonts.ts` — FontId type, FONTS array (8 entries with clockSize/clockTracking), getFontDef helper.
4. Updated `useTheme.ts` — added fontId/setFontId to context interface.
5. Updated `useThemeProvider.ts` — fontId state persisted to AsyncStorage (`theme_font`).
6. Updated `App.tsx` — 5 new fonts loaded via useFonts with require() from assets/fonts/.
7. Updated `Clock.tsx` — reads fontId from useTheme, applies fontFamily/fontWeight/clockSize/clockTracking dynamically.
8. Updated `ThemeScreen.tsx` — added horizontal "Clock Font" strip between Palette and Available Themes; shows "12:34" preview in each font.
9. Updated `SettingsScreen.tsx` — removed "›" from Active Theme row; Font Style row now shows current font name and navigates to ThemeScreen.
10. Updated `HomeScreen.tsx` — "Edit" button → "Change".
11. Updated `useOverlay.ts` — fontId added as 8th param of syncData, written to themeJson as `fontId`.
12. Updated `AppNavigator.tsx` — passes fontId to overlay.syncData.
13. Updated `android-src-staging/LockscreenModule.kt` — persists `font_id` from themeJson to SharedPreferences.
14. Updated `android-src-staging/LockscreenActivity.kt` — reads `font_id` from prefs, added `loadClockTypeface()` helper, clock + AM/PM TextViews use selected typeface.
15. Synced both Kotlin files to production `android/app/src/main/java/com/informatheme/app/`.

**Deviations:** None.

---

## 2026-05-06 — Wallpaper system: device gallery, crop, filters, preview

**Plan:** Implement full custom wallpaper workflow — pick from device gallery, crop to phone aspect ratio, apply color filters, preview on lockscreen, persist selection.

**Steps completed:**
1. Installed `expo-image-picker` + `expo-image-manipulator` packages.
2. `src/constants/wallpaperFilters.ts` (new) — 10 filter presets (original/warm/cool/dusk/mono/forest/ocean/night/golden/rose) with color overlay values and `getFilterOverlay()` helper.
3. `src/hooks/useThemeProvider.ts` — Added `CustomWallpaper` type (`{uri, filter}`), `customWallpaper` state, AsyncStorage persistence via `custom_wallpaper` key, `setCustomWallpaper()` setter.
4. `src/hooks/useTheme.ts` — Extended `ThemeContextValue` interface with `customWallpaper` + `setCustomWallpaper`.
5. `src/components/LockscreenPreview.tsx` — Added optional `wallpaperUri` and `filterOverlay` props; renders `Image` instead of `LinearGradient` when URI provided, overlays filter color on top.
6. `src/screens/wallpapers/WallpaperEditorScreen.tsx` (new) — Three-mode editor: Crop (pan + pinch gesture on image inside fixed 9:19.5 frame), Filter (10 preset thumbnails), Preview (scaled LockscreenPreview). Crop applies via `expo-image-manipulator`. Apply saves to `customWallpaper`.
7. `src/screens/wallpapers/WallpapersScreen.tsx` — Added "Choose from Gallery" button (launches ImagePicker → WallpaperEditorScreen), custom wallpaper active card with Edit/Remove actions, filter overlay rendered on custom thumbnail.
8. `src/navigation/AppNavigator.tsx` — Added `WallpaperEditor` stack route; included `customWallpaper.uri` in overlay `syncData` when set (native side will need separate update to load from file path vs assets).

**Deviations:** None.

---

## 2026-05-06 — Native overlay: custom wallpaper file URI + filter rendering + photo permission

**Plan:** Wire the full custom wallpaper pipeline end-to-end: pass filter through JS→native sync, render bitmap from file URI in LockscreenActivity, apply color filter overlay, add media library permission to onboarding + settings.

**Steps completed:**
1. `src/hooks/useOverlay.ts` — Added `wallpaperFilter?` param to `syncData`; included `wallpaperFilter` key in themeJson.
2. `src/navigation/AppNavigator.tsx` — Passes `customWallpaper.filter` as 7th arg to `syncData`.
3. `android-src-staging/LockscreenModule.kt` + `android/.../LockscreenModule.kt` — Stores `wallpaper_filter` from themeJson to SharedPreferences.
4. `android-src-staging/LockscreenActivity.kt` + `android/.../LockscreenActivity.kt`:
   - Added imports: `Bitmap`, `BitmapFactory`, `Uri`.
   - Reads `wallpaper_filter` from SharedPreferences; passes to `buildOverlayView`.
   - Wallpaper loading: detects `file://` / `content://` / absolute path URIs; loads `Bitmap` via `BitmapFactory.decodeFile` (with `inSampleSize` sampling to screen resolution) or `contentResolver.openInputStream`; falls back to gradient on failure.
   - Applies reduced dim overlay (alpha 120) + color filter overlay for custom photos.
   - Asset wallpapers: unchanged behavior (alpha 160 dim, no filter).
   - Added helpers: `loadBitmapFromUri`, `calcSampleSize`, `filterOverlayColor` (10 filter presets matching JS constants).
5. `src/hooks/usePermissions.ts` — Added `mediaLibrary` state; checks via `ImagePicker.getMediaLibraryPermissionsAsync()`; added `requestMediaLibrary()`.
6. `src/screens/onboarding/OnboardingScreen.tsx` — Added photo library permission card (optional, labelled) in the permissions step with Grant/✓ UI.
7. `src/screens/settings/SettingsScreen.tsx` — Added photo library permission row with `permBadge`, tapping grants permission via `ImagePicker.requestMediaLibraryPermissionsAsync`.

**Deviations:** None.

---

## 2026-05-05 — Fix lockscreen prevents phone from locking (SCREEN_ON trigger)

**Plan:** Direct `startActivity()` on `SCREEN_OFF` + `FLAG_TURN_SCREEN_ON` caused screen to wake immediately after locking — phone never truly locked. Fix: trigger on `ACTION_SCREEN_ON` instead (screen goes off = phone locks normally; overlay launches when user presses power to wake).

**Steps completed:**
1. `LockscreenService.kt` — Changed trigger from `ACTION_SCREEN_OFF` → `ACTION_SCREEN_ON`.
2. `LockscreenActivity.kt` — Removed `setTurnScreenOn(true)` and `FLAG_TURN_SCREEN_ON`. Kept `setShowWhenLocked(true)` and `FLAG_SHOW_WHEN_LOCKED`.
3. `plugins/withInformaThemeModule.js` — Removed `android:turnScreenOn="true"` from `LockscreenActivity` manifest attrs.

**Deviations:** None.

---

## 2026-05-05 — Fix vibration: replace FSI notification with direct Activity launch

**Plan:** Logs confirmed Android 15 OEM overrides `enableVibration(false)` on `IMPORTANCE_HIGH` channels (`vibration=true` stored despite our code). Only fix: eliminate the FSI notification entirely and launch `LockscreenActivity` directly via `startActivity()` from the foreground service. App has `SYSTEM_ALERT_WINDOW` — Android exempts such apps from background activity launch restrictions on API 29+.

**Steps completed:**
1. `LockscreenService.kt` — Removed entire FSI channel + FSI notification path. `showLockscreenActivity()` now calls `startActivity()` with `FLAG_ACTIVITY_NEW_TASK | SINGLE_TOP | NO_ANIMATION`. `dismissLockscreen()` broadcasts `ACTION_DISMISS` only (no `nm().cancel()`). Foreground service channel stays `IMPORTANCE_LOW` (no vibration). Logging preserved.

**Deviations:** None.

---

## 2026-05-05 — Lockscreen UX Polish (vibration, dim, layout)

**Plan:** Remove FSI notification vibration, add auto-dim after 7s inactivity, redesign lockscreen layout to match design mockup with dynamic data only.

**Steps completed:**
1. `LockscreenService.kt` — Changed `FSI_CHANNEL_ID` to `informatheme_fsi_v2` (forces fresh channel creation), added `enableVibration(false)` + `vibrationPattern = longArrayOf(0L)` + `enableLights(false)` to FSI channel. Added `.setVibrate(longArrayOf(0L))` to notification builder.
2. `LockscreenActivity.kt` — Added `dimHandler`/`dimRunnable` that sets `window.screenBrightness = 0.02f` after 7 000 ms. Any touch calls `undim()` which restores brightness and resets the timer. Scheduled in `onResume`, cleared in `onPause`/`onDestroy`.
3. `LockscreenActivity.kt` — Full layout rewrite:
   - Battery row (centered, dynamic %)
   - Tagline row (dynamic date + theme tagline)
   - Large clock (dynamic)
   - Birthday card (left) + circle rings for anniversaries / first milestone (right) — all dynamic from dates JSON
   - Milestone linear bars below (label, "X Days Ago", progress bar showing year-cycle %, digit-spaced day count)
   - Upcoming chips (≤ 30 days, dynamic)
   - Rotating quote
   - TODAY + WEATHER pills (hour dynamic, weather from prefs)
   - Unlock slider
   - Fixed bottom bar (phone | home bar | camera)
4. Removed all hardcoded sample strings ("Current Goal: Make memories.", static battery pill, etc.)

**Deviations:** None.

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
