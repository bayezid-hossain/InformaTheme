# InformaTheme — Claude Rules

## Project

Android lockscreen overlay app. Expo (CNG), NativeWind v4, old-arch RN bridge (Kotlin).  
Package: `com.informatheme.app`

## Rules

**Every plan must be fully executed before closing the task, and documented in PROGRESS.md with:**
- Date
- Plan summary
- Steps completed
- Any deviations from the plan

## Tooling

| Script | Purpose |
|--------|---------|
| `connect.bat` | ADB wireless connect (reads/saves `connect_config.txt`) |
| `run.bat` | `expo run:android` or `expo start` |
| `build.bat` | Gradle `assembleDebug` / `assembleRelease` |
| `prebuild.bat` / `prebuild.js` | `expo prebuild --clean` + sync staging sources |
| `release.bat` / `release.js` | Bump patch in `app.json`, update CHANGELOG, git tag + push |
| `add-changelog.js` | Add entry to `[Unreleased]` section of CHANGELOG.md |

## Key Paths

- Native sources (Kotlin): `android-src-staging/`
- Config plugin: `plugins/withInformaThemeModule.js`
- Theme tokens: `src/theme/colors.ts`
- Screen components: `src/screens/`
- Shared components: `src/components/`
