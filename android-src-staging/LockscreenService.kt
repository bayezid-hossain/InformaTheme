package com.informatheme.app

import android.app.*
import android.content.*
import android.os.*
import androidx.core.app.NotificationCompat

class LockscreenService : Service() {

    companion object {
        const val CHANNEL_ID          = "informatheme_overlay"
        const val FSI_CHANNEL_ID      = "informatheme_fsi"
        const val NOTIFICATION_ID     = 7701
        const val FSI_NOTIFICATION_ID = 7702
        const val ACTION_STOP         = "com.informatheme.app.STOP_OVERLAY"
        const val PREFS_NAME          = "informatheme_prefs"
        var isRunning = false
    }

    private var screenReceiver: BroadcastReceiver? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        createServiceChannel()
        createFsiChannel()
        startForeground(NOTIFICATION_ID, buildServiceNotification())
        registerScreenReceiver()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }
        return START_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        dismissLockscreen()
        unregisterScreenReceiver()
        super.onDestroy()
    }

    // ── Notification channels ─────────────────────────────────────────────────

    private fun createServiceChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                CHANNEL_ID, "Lockscreen Overlay", NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps InformaTheme lockscreen running"
                setShowBadge(false)
            }
            notificationManager().createNotificationChannel(ch)
        }
    }

    private fun createFsiChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                FSI_CHANNEL_ID, "InformaTheme Lockscreen", NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description        = "Displays InformaTheme on the lockscreen"
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                setShowBadge(false)
            }
            notificationManager().createNotificationChannel(ch)
        }
    }

    // ── Persistent foreground notification ────────────────────────────────────

    private fun buildServiceNotification(): Notification {
        val stopIntent = Intent(this, LockscreenService::class.java).apply { action = ACTION_STOP }
        val stopPending = PendingIntent.getService(
            this, 0, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("InformaTheme Active")
            .setContentText("Your lockscreen overlay is running")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .addAction(android.R.drawable.ic_delete, "Stop", stopPending)
            .build()
    }

    // ── Screen receiver ───────────────────────────────────────────────────────

    private fun registerScreenReceiver() {
        screenReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                when (intent.action) {
                    Intent.ACTION_SCREEN_OFF  -> showLockscreenActivity()
                    Intent.ACTION_USER_PRESENT -> dismissLockscreen()
                }
            }
        }
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_USER_PRESENT)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(screenReceiver, filter, Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(screenReceiver, filter)
        }
    }

    private fun unregisterScreenReceiver() {
        screenReceiver?.let {
            try { unregisterReceiver(it) } catch (_: Exception) {}
        }
        screenReceiver = null
    }

    // ── FSI lockscreen ────────────────────────────────────────────────────────

    private fun showLockscreenActivity() {
        val activityIntent = Intent(this, LockscreenActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_NO_ANIMATION
        }
        val pendingIntent = PendingIntent.getActivity(
            this, FSI_NOTIFICATION_ID, activityIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, FSI_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setContentTitle("InformaTheme")
            .setContentText("Swipe up to unlock")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(pendingIntent, true)
            .setOngoing(true)
            .setAutoCancel(false)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()

        notificationManager().notify(FSI_NOTIFICATION_ID, notification)
    }

    private fun dismissLockscreen() {
        notificationManager().cancel(FSI_NOTIFICATION_ID)
        sendBroadcast(Intent(LockscreenActivity.ACTION_DISMISS))
    }

    private fun notificationManager() =
        getSystemService(NOTIFICATION_SERVICE) as NotificationManager
}
