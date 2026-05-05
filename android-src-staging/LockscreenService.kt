package com.informatheme.app

import android.app.*
import android.content.*
import android.os.*
import androidx.core.app.NotificationCompat
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class LockscreenService : Service() {

    companion object {
        const val CHANNEL_ID      = "informatheme_overlay"
        const val NOTIFICATION_ID = 7701
        const val ACTION_STOP     = "com.informatheme.app.STOP_OVERLAY"
        const val PREFS_NAME      = "informatheme_prefs"
        const val LOG_FILE        = "informatheme_debug.log"
        var isRunning = false

        fun writeLog(ctx: android.content.Context, msg: String) {
            try {
                val ts = SimpleDateFormat("MM-dd HH:mm:ss.SSS", Locale.getDefault()).format(Date())
                val line = "[$ts] $msg\n"
                android.util.Log.d("InformaTheme", msg)
                File(ctx.filesDir, LOG_FILE).appendText(line)
            } catch (_: Exception) {}
        }
    }

    private var screenReceiver: BroadcastReceiver? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        writeLog(this, "=== Service onCreate SDK=${Build.VERSION.SDK_INT} ===")
        createServiceChannel()
        startForeground(NOTIFICATION_ID, buildServiceNotification())
        registerScreenReceiver()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) { stopSelf(); return START_NOT_STICKY }
        return START_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        dismissLockscreen()
        unregisterScreenReceiver()
        super.onDestroy()
    }

    // ── Service channel (IMPORTANCE_LOW — silent, no vibration) ──────────────

    private fun createServiceChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                CHANNEL_ID, "Lockscreen Overlay", NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps InformaTheme lockscreen running"
                setShowBadge(false)
                enableVibration(false)
                setSound(null, null)
            }
            nm().createNotificationChannel(ch)
        }
    }

    private fun buildServiceNotification(): Notification {
        val stop = PendingIntent.getService(
            this, 0,
            Intent(this, LockscreenService::class.java).apply { action = ACTION_STOP },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("InformaTheme Active")
            .setContentText("Your lockscreen overlay is running")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .addAction(android.R.drawable.ic_delete, "Stop", stop)
            .build()
    }

    // ── Screen receiver ───────────────────────────────────────────────────────

    private fun registerScreenReceiver() {
        screenReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                when (intent.action) {
                    Intent.ACTION_SCREEN_ON    -> { writeLog(ctx, "SCREEN_ON → startActivity"); showLockscreenActivity() }
                    Intent.ACTION_USER_PRESENT -> { writeLog(ctx, "USER_PRESENT → dismissLockscreen"); dismissLockscreen() }
                }
            }
        }
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_USER_PRESENT)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
            registerReceiver(screenReceiver, filter, Context.RECEIVER_EXPORTED)
        else
            registerReceiver(screenReceiver, filter)
    }

    private fun unregisterScreenReceiver() {
        screenReceiver?.let { try { unregisterReceiver(it) } catch (_: Exception) {} }
        screenReceiver = null
    }

    // ── Launch lockscreen activity directly (no FSI notification = no vibration) ─

    private fun showLockscreenActivity() {
        writeLog(this, "showLockscreenActivity: startActivity SDK=${Build.VERSION.SDK_INT}")
        val intent = Intent(this, LockscreenActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_NO_ANIMATION
        }
        try {
            startActivity(intent)
            writeLog(this, "startActivity OK")
        } catch (e: Exception) {
            writeLog(this, "startActivity FAILED: ${e.message}")
        }
    }

    private fun dismissLockscreen() {
        sendBroadcast(Intent(LockscreenActivity.ACTION_DISMISS))
    }

    private fun nm() = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
}
