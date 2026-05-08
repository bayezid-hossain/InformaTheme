# Changelog

All notable changes to InformaTheme will be documented in this file.

## [Unreleased]

### Added
- Redesigned native lockscreen To-Do cards (`buildTodoCard` in `LockscreenActivity.kt`) with a horizontal row layout containing a countdown bubble, vertical text stack for label/due-date, and centered complete button.
- Exact countdown mathematical calculations implemented on Home screen lists, Dates screen lists, Lockscreen Preview, and Lockscreen Kotlin overlay.
- Added a safe date parsing utility `safeFormatDate` to `HistoryScreen.tsx` to prevent crashes, restructured items to use Click-to-Restore with confirmation prompts, and stripped redundant icons.
- Set default modal selected category to `'todo'` and implemented backdate warning.
- Replaced Days Since/Elapsed counters on the Dates screen with Target Time and live-calculated Remaining Time.
- Rewrote `handleEditPreset` in `WallpapersScreen.tsx` using `FileSystem.copyAsync` to copy local assets safely instead of `downloadAsync` (which fails on local resource schemes). Resolves preset cropping/filtering under both debug and release builds.
- Created `run_release.bat` script to automate building and wirelessly/wired installing the compiled Release APK to any connected ADB device with absolute-path resolution of `adb.exe`.
- Generated and integrated 3 stunning, high-vibrancy abstract nature wallpapers matching the color profiles of Royal Amethyst, Rose Quartz, and Glassmorphism themes.

### Added
- Removed Drawer navigation and replaced with Stack navigation. Removed mock Status Bar elements. Overhauled InformaAlert to Industrial Urgency design. Fixed Android permissions (LockscreenPackage registration and FSI Notification Channel). Implemented WindowManager LockscreenService overlay triggered on SCREEN_OFF. Enforced permission checks at startup.

### Added
- useKeyboardVisible hook (keyboardDidShow/Hide, prevents snappy close on modal)
- DateStoreContext: shared provider so date adds instantly reflect on all screens
- OnboardingScreen redesigned: per-step accent colors, Step 4 two-permission grant UI with checkmarks and FSI hint text
- HomeScreen redesigned: greeting header + avatar, Active Theme dark-green card, Anchor Dates with DAYS LEFT + type colors, dashed add row, Quick Actions 2×2 with colored icon badges
- DatesScreen: KeyboardAvoidingView bottom sheet with conditional padding, type-specific color badges, drag handle, uses DateStoreContext
- usePermissions: FSI fallback chain (MANAGE_APP_USE_FULL_SCREEN_INTENT → APP_NOTIFICATION_SETTINGS → APPLICATION_DETAILS_SETTINGS)
- storage.ts: generic AsyncStorage helpers (getJSON/setJSON/removeKey)
- useDateStore: anchor dates CRUD persisted in AsyncStorage, delete with Alert confirm, empty state
- useWidgetStore: widget enabled states persisted in AsyncStorage
- backgroundTask.ts: expo-task-manager MILESTONE_REFRESH task registered at app boot
- HomeScreen: lockscreen activation toggle (LockscreenModule.startOverlay/stopOverlay, isOverlayActive, live perm check → Settings redirect)
- SettingsScreen: live permission badges (overlay + FSI) with tap-to-open-Settings, warning banner when missing
- DatesScreen: persistence via useDateStore, delete button + Alert confirm, empty state
- WidgetsScreen: persistence via useWidgetStore (toggle state survives restarts)

### Changed
- OnboardingScreen: real permission flow — opens Settings, waits for AppState resume, auto-advances when granted, skip-for-now fallback

### Changed
- HomeScreen updated with LockscreenPreview phone mockup

### Added
- Fonts loaded: SirinStencil, SpaceGrotesk, SpaceMono via expo-google-fonts

### Added
- Kotlin stubs: LockscreenActivity, LockscreenModule, LockscreenPackage, LockscreenService, LockscreenReceiver

### Added
- useBattery hook (expo-battery), usePermissions hook (overlay + FSI, AppState re-check, persistent asking)

### Added
- dateCalc utils (liveAge, totalDays, nextBirthday, progressToNextBirthday, anniversaryProgress)

### Added
- GlassBubble, Clock (Sirin Stencil/SpaceMono/SpaceGrotesk), ProgressRing (SVG), BatteryWidget (Reanimated), MilestoneBubble, LockscreenPreview components

### Added
- Generated premium icons and splash screen, organized Design folder structure following Reverse Alarm patterns

### Added
- Drawer navigation with 5 routes (Home, Dates, Widgets, Wallpapers, Settings)
- ThemeContext with darkPremium / warmLight / glassmorphism variants, live switching
- AppStatusBar (live clock), TopBar (hamburger + back), DrawerContent (active-state highlighting)
- OnboardingScreen: 4-step flow with permission cards, progress dots, AsyncStorage gate
- HomeScreen: greeting, theme chip switcher, anchor dates with day counts, quick action grid
- DatesScreen: filterable anchor dates list, live-age calc, add-date modal
- WidgetsScreen: 8 toggleable widgets with summary counter
- WallpapersScreen: 6 built-in gradient wallpapers + custom upload slot
- SettingsScreen: 3-section menu (Account, Permissions, App)
- Initial project setup
- Project initialized with Expo blank-typescript template
- NativeWind v4 configured (tailwind.config.js, babel.config.js, metro.config.js)
- Folder structure: src/{components,screens,hooks,services,native,utils,theme}, plugins/, android-src-staging/
- Theme tokens: darkPremium, warmLight, glassmorphism (src/theme/colors.ts)
- Tooling scripts: connect.bat, run.bat, build.bat, prebuild.bat/js, release.bat/js, add-changelog.js
- Config plugin: plugins/withInformaThemeModule.js
- app.json configured for com.informatheme.app, targetSdkVersion 35, lockscreen permissions
