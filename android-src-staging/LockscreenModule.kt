package com.informatheme.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

class LockscreenModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "LockscreenModule"

    private val CHANNEL_ID = "informatheme_alerts"

    // ── Overlay lifecycle ─────────────────────────────────────────────────────

    @ReactMethod
    fun startOverlay(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(LockscreenService.PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean("overlay_enabled", true).apply()

            LockscreenReceiver.startOverlayService(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_OVERLAY_ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopOverlay(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(LockscreenService.PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean("overlay_enabled", false).apply()

            val intent = Intent(reactContext, LockscreenService::class.java)
            reactContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_OVERLAY_ERROR", e.message)
        }
    }

    @ReactMethod
    fun isOverlayActive(promise: Promise) {
        promise.resolve(LockscreenService.isRunning)
    }

    // ── Sync data for native overlay rendering ────────────────────────────────

    @ReactMethod
    fun syncOverlayData(themeJson: String, datesJson: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(LockscreenService.PREFS_NAME, Context.MODE_PRIVATE)
            val theme = JSONObject(themeJson)

            prefs.edit()
                .putString("variant", theme.optString("variant", "darkPremium"))
                .putString("bg", theme.optString("bg", "#0d0f12"))
                .putString("bg1", theme.optString("bg1", "#13161c"))
                .putString("bg2", theme.optString("bg2", "#1a1e27"))
                .putString("accent", theme.optString("accent", "#4ade80"))
                .putString("text", theme.optString("text", "#e8ecf2"))
                .putString("text2", theme.optString("text2", "#8892a4"))
                .putString("text3", theme.optString("text3", "#4a5568"))
                .putString("tagline", theme.optString("tagline", "BEST YEARS AHEAD"))
                .putString("weather", theme.optString("weather", ""))
                .putString("widgets", theme.optJSONArray("widgets")?.toString() ?: "[\"clock\",\"milestone\",\"anniversary\",\"birthday\",\"weather\"]")
                .putString("dates", datesJson)
                .apply()

            // Notify Activity to refresh if running
            val intent = Intent("com.informatheme.app.DATA_UPDATED")
            reactContext.sendBroadcast(intent)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SYNC_ERROR", e.message)
        }
    }

    // ── Permissions ───────────────────────────────────────────────────────────

    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        val granted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(reactContext)
        } else {
            true
        }
        promise.resolve(granted)
    }

    @ReactMethod
    fun checkFullScreenIntentPermission(promise: Promise) {
        val nm = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val granted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            nm.canUseFullScreenIntent()
        } else {
            true
        }
        promise.resolve(granted)
    }

    // ── Debug logs ────────────────────────────────────────────────────────────

    @ReactMethod
    fun getLogs(promise: Promise) {
        try {
            val file = File(reactContext.filesDir, LockscreenService.LOG_FILE)
            promise.resolve(if (file.exists()) file.readText() else "(no log file yet)")
        } catch (e: Exception) {
            promise.reject("LOG_ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearLogs(promise: Promise) {
        try {
            File(reactContext.filesDir, LockscreenService.LOG_FILE).delete()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("LOG_ERROR", e.message)
        }
    }

    @ReactMethod
    fun setupNotificationChannel(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "InformaTheme Alerts"
            val descriptionText = "Required for lockscreen milestones and urgent alerts"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
                setShowBadge(true)
            }
            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
            promise.resolve(true)
        } else {
            promise.resolve(true)
        }
    }
}
