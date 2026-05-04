// Expo Config Plugin for InformaTheme
// Mirrors the withReverseAlarmModule.js pattern.
// Runs during `expo prebuild` to inject native Android files and patches.

const {
  withAppBuildGradle,
  withAndroidManifest,
  withDangerousMod,
  withGradleProperties,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = 'com.informatheme.app';
const PACKAGE_PATH = PACKAGE_NAME.replace(/\./g, '/');

// ─── Step 1: Copy android-src-staging → android/app/src/main/java/... ────────
function withCopyNativeSources(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const stagingDir = path.join(projectRoot, 'android-src-staging');
      const destDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        ...PACKAGE_PATH.split('/')
      );

      if (!fs.existsSync(stagingDir)) {
        console.warn('[withInformaThemeModule] android-src-staging not found, skipping copy.');
        return cfg;
      }

      copyDirRecursive(stagingDir, destDir);
      console.log('[withInformaThemeModule] Copied android-src-staging → android sources.');
      return cfg;
    },
  ]);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── Step 2: Patch AndroidManifest.xml ───────────────────────────────────────
function withAndroidManifestPatch(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;

    if (!manifest.manifest.$['xmlns:tools']) {
      manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const app = manifest.manifest.application[0];

    app.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';
    if (!app.$['tools:replace']) {
      app.$['tools:replace'] = 'android:appComponentFactory';
    } else if (!app.$['tools:replace'].includes('android:appComponentFactory')) {
      app.$['tools:replace'] += ',android:appComponentFactory';
    }

    // LockscreenActivity
    const activities = app.activity || [];
    const activityExists = (name) => activities.some((a) => a.$['android:name'] === name);

    if (!activityExists('.LockscreenActivity')) {
      activities.push({
        $: {
          'android:name': '.LockscreenActivity',
          'android:showWhenLocked': 'true',
          'android:turnScreenOn': 'true',
          'android:launchMode': 'singleInstance',
          'android:theme': '@android:style/Theme.Translucent.NoTitleBar.Fullscreen',
          'android:exported': 'false',
        },
      });
    }
    app.activity = activities;

    // MainActivity lockscreen flags
    const mainActivity = activities.find((a) => a.$['android:name'] === '.MainActivity');
    if (mainActivity) {
      mainActivity.$['android:showWhenLocked'] = 'true';
      mainActivity.$['android:turnScreenOn'] = 'true';
    }

    // Receivers
    const receivers = app.receiver || [];
    const receiverExists = (name) => receivers.some((r) => r.$['android:name'] === name);

    if (!receiverExists('.LockscreenReceiver')) {
      receivers.push({
        $: {
          'android:name': '.LockscreenReceiver',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
              { $: { 'android:name': 'android.intent.action.LOCKED_BOOT_COMPLETED' } },
            ],
          },
        ],
      });
    }
    app.receiver = receivers;

    // Services
    const services = app.service || [];
    const serviceExists = (name) => services.some((s) => s.$['android:name'] === name);

    if (!serviceExists('.LockscreenService')) {
      services.push({
        $: {
          'android:name': '.LockscreenService',
          'android:foregroundServiceType': 'specialUse',
          'android:exported': 'false',
        },
      });
    }
    app.service = services;

    return cfg;
  });
}

// ─── Step 3: Patch app/build.gradle ─────────────────────────────────────────
function withAppBuildGradlePatch(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;

    if (!gradle.includes('androidx.core:core-ktx')) {
      gradle = gradle.replace(
        /dependencies \{/,
        `dependencies {
    // InformaTheme
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.work:work-runtime-ktx:2.9.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'`
      );
    }

    cfg.modResults.contents = gradle;
    return cfg;
  });
}

// ─── Step 4: Patch gradle.properties ─────────────────────────────────────────
function withGradlePropertiesPatch(config) {
  return withGradleProperties(config, (cfg) => {
    const set = (key, value) => {
      const existing = cfg.modResults.find((i) => i.type === 'property' && i.key === key);
      if (!existing) {
        cfg.modResults.push({ type: 'property', key, value });
      } else {
        existing.value = value;
      }
    };

    set('android.enableJetifier', 'true');
    set('newArchEnabled', 'true');

    return cfg;
  });
}

// ─── Step 5: Patch MainApplication.kt ────────────────────────────────────────
function withMainApplicationPatch(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const mainAppPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        ...PACKAGE_PATH.split('/'),
        'MainApplication.kt'
      );

      if (!fs.existsSync(mainAppPath)) {
        console.warn('[withInformaThemeModule] MainApplication.kt not found, skipping patch.');
        return cfg;
      }

      let content = fs.readFileSync(mainAppPath, 'utf8');
      
      // Add manual package registration
      if (!content.includes('LockscreenPackage()')) {
        content = content.replace(
          /PackageList\(this\)\.packages\.apply \{/,
          `PackageList(this).packages.apply {\n              add(LockscreenPackage())`
        );
        fs.writeFileSync(mainAppPath, content, 'utf8');
        console.log('[withInformaThemeModule] Patched MainApplication.kt with LockscreenPackage.');
      }

      return cfg;
    },
  ]);
}

// ─── Step 6: Write ProGuard rules ────────────────────────────────────────────
function withProguardRules(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const proguardPath = path.join(projectRoot, 'android', 'app', 'proguard-rules.pro');
      const rules = `
# InformaTheme — keep native module classes
-keep class com.informatheme.app.LockscreenModule { *; }
-keep class com.informatheme.app.LockscreenActivity { *; }
-keep class com.informatheme.app.LockscreenService { *; }
-keep class com.informatheme.app.LockscreenReceiver { *; }
`;
      const existing = fs.existsSync(proguardPath) ? fs.readFileSync(proguardPath, 'utf8') : '';
      if (!existing.includes('InformaTheme')) {
        fs.appendFileSync(proguardPath, rules, 'utf8');
        console.log('[withInformaThemeModule] Appended ProGuard rules.');
      }
      return cfg;
    },
  ]);
}

// ─── Compose all steps ───────────────────────────────────────────────────────
module.exports = function withInformaThemeModule(config) {
  config = withCopyNativeSources(config);
  config = withAndroidManifestPatch(config);
  config = withAppBuildGradlePatch(config);
  config = withGradlePropertiesPatch(config);
  config = withMainApplicationPatch(config);
  config = withProguardRules(config);
  return config;
};
