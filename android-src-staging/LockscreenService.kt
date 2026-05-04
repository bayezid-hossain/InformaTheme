package com.informatheme.app

import android.app.*
import android.content.*
import android.graphics.*
import android.os.*
import android.provider.Settings
import android.text.TextPaint
import android.util.TypedValue
import android.view.*
import android.widget.*
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.TimeUnit

class LockscreenService : Service() {

    companion object {
        const val CHANNEL_ID = "informatheme_overlay"
        const val NOTIFICATION_ID = 7701
        const val ACTION_STOP = "com.informatheme.app.STOP_OVERLAY"
        const val PREFS_NAME = "informatheme_prefs"
        var isRunning = false
    }

    private var overlayView: View? = null
    private var windowManager: WindowManager? = null
    private var screenReceiver: BroadcastReceiver? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
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
        removeOverlay()
        unregisterScreenReceiver()
        super.onDestroy()
    }

    // ── Notification ──────────────────────────────────────────────────────────

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Lockscreen Overlay",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps InformaTheme lockscreen running"
                setShowBadge(false)
            }
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val stopIntent = Intent(this, LockscreenService::class.java).apply {
            action = ACTION_STOP
        }
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

    // ── Screen ON/OFF Receiver ────────────────────────────────────────────────

    private fun registerScreenReceiver() {
        screenReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                when (intent.action) {
                    Intent.ACTION_SCREEN_OFF -> showOverlay()
                    Intent.ACTION_SCREEN_ON -> { /* Overlay is already there or was dismissed */ }
                    Intent.ACTION_USER_PRESENT -> removeOverlay()
                }
            }
        }
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_USER_PRESENT)
        }
        registerReceiver(screenReceiver, filter)
    }

    private fun unregisterScreenReceiver() {
        screenReceiver?.let {
            try { unregisterReceiver(it) } catch (_: Exception) {}
        }
        screenReceiver = null
    }

    // ── Overlay ───────────────────────────────────────────────────────────────

    private fun showOverlay() {
        if (overlayView != null) return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) return

        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        val accentColor = try { Color.parseColor(prefs.getString("accent", "#4ade80")) } catch (_: Exception) { Color.parseColor("#4ade80") }
        val bgColor = try { Color.parseColor(prefs.getString("bg", "#0d0f12")) } catch (_: Exception) { Color.parseColor("#0d0f12") }
        val textColor = try { Color.parseColor(prefs.getString("text", "#e8ecf2")) } catch (_: Exception) { Color.parseColor("#e8ecf2") }
        val text2Color = try { Color.parseColor(prefs.getString("text2", "#8892a4")) } catch (_: Exception) { Color.parseColor("#8892a4") }
        val text3Color = try { Color.parseColor(prefs.getString("text3", "#4a5568")) } catch (_: Exception) { Color.parseColor("#4a5568") }
        val datesJson = prefs.getString("dates", "[]") ?: "[]"

        val view = buildOverlayView(bgColor, textColor, text2Color, text3Color, accentColor, datesJson)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_SYSTEM_ALERT

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE.inv() and  // Make focusable for swipe
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            flags = WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
            gravity = Gravity.TOP or Gravity.START
        }

        try {
            windowManager?.addView(view, params)
            overlayView = view
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun removeOverlay() {
        overlayView?.let {
            try { windowManager?.removeView(it) } catch (_: Exception) {}
        }
        overlayView = null
    }

    @Suppress("DEPRECATION")
    private fun buildOverlayView(
        bgColor: Int, textColor: Int, text2Color: Int, text3Color: Int,
        accentColor: Int, datesJson: String
    ): View {
        val ctx = this
        val density = resources.displayMetrics.density
        fun dp(v: Int) = (v * density).toInt()

        // Root
        val root = FrameLayout(ctx).apply {
            setBackgroundColor(bgColor)
            isClickable = true
            isFocusable = true
        }

        // Scroll container
        val scroll = ScrollView(ctx).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            setPadding(dp(24), dp(60), dp(24), dp(40))
            isVerticalScrollBarEnabled = false
        }

        val content = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }

        // ─ Date tagline ─
        val dateFormat = SimpleDateFormat("EEEE, MMMM d", Locale.getDefault())
        val dateTagline = TextView(ctx).apply {
            text = dateFormat.format(Date()).uppercase()
            setTextColor(text3Color)
            textSize = 11f
            letterSpacing = 0.15f
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(8) }
        }
        content.addView(dateTagline)

        // ─ Clock ─
        val timeFormat = SimpleDateFormat("hh:mm", Locale.getDefault())
        val ampmFormat = SimpleDateFormat("a", Locale.getDefault())
        val clockRow = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(4) }
        }
        val clockText = TextView(ctx).apply {
            text = timeFormat.format(Date())
            setTextColor(textColor)
            textSize = 72f
            typeface = Typeface.create("sans-serif-light", Typeface.NORMAL)
            gravity = Gravity.CENTER
        }
        val ampmText = TextView(ctx).apply {
            text = ampmFormat.format(Date()).uppercase()
            setTextColor(text3Color)
            textSize = 16f
            gravity = Gravity.BOTTOM
            setPadding(dp(6), 0, 0, dp(14))
        }
        clockRow.addView(clockText)
        clockRow.addView(ampmText)
        content.addView(clockRow)

        // Separator
        val sep = View(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(dp(40), dp(2)).apply {
                gravity = Gravity.CENTER_HORIZONTAL
                topMargin = dp(12)
                bottomMargin = dp(20)
            }
            setBackgroundColor(accentColor)
        }
        content.addView(sep)

        // ─ Anchor Dates ─
        try {
            val arr = JSONArray(datesJson)
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                val label = obj.optString("label", "")
                val dateISO = obj.optString("dateISO", "")
                val type = obj.optString("type", "")
                val icon = obj.optString("icon", "📅")

                if (label.isEmpty() || dateISO.isEmpty()) continue

                val dateCard = buildDateCard(
                    ctx, density, label, dateISO, type, icon,
                    bgColor, textColor, text2Color, text3Color, accentColor
                )
                content.addView(dateCard)
            }
        } catch (_: Exception) {}

        // ─ Motivational quote ─
        val quotes = arrayOf(
            "Every day counts.",
            "Time reveals what matters.",
            "The present is a gift.",
            "Growth takes patience.",
            "Moments become memories."
        )
        val quoteText = TextView(ctx).apply {
            text = "\"${quotes[Calendar.getInstance().get(Calendar.DAY_OF_YEAR) % quotes.size]}\""
            setTextColor(text3Color)
            textSize = 13f
            gravity = Gravity.CENTER
            setTypeface(typeface, Typeface.ITALIC)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(24) }
        }
        content.addView(quoteText)

        // ─ Swipe to unlock label ─
        val swipeLabel = TextView(ctx).apply {
            text = "⬆  SWIPE UP TO UNLOCK"
            setTextColor(text3Color)
            textSize = 11f
            letterSpacing = 0.2f
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(40) }
        }
        content.addView(swipeLabel)

        scroll.addView(content)
        root.addView(scroll)

        // Swipe up gesture to dismiss
        root.setOnTouchListener(object : View.OnTouchListener {
            private var startY = 0f
            private var startTime = 0L

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        startY = event.rawY
                        startTime = System.currentTimeMillis()
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val dy = startY - event.rawY
                        val dt = System.currentTimeMillis() - startTime
                        if (dy > 200 && dt < 500) {
                            removeOverlay()
                            return true
                        }
                    }
                }
                return false
            }
        })

        // Update clock every minute
        val handler = Handler(Looper.getMainLooper())
        val clockUpdater = object : Runnable {
            override fun run() {
                if (overlayView == null) return
                clockText.text = timeFormat.format(Date())
                ampmText.text = ampmFormat.format(Date()).uppercase()
                handler.postDelayed(this, 30_000)
            }
        }
        handler.postDelayed(clockUpdater, 30_000)

        return root
    }

    private fun buildDateCard(
        ctx: Context, density: Float,
        label: String, dateISO: String, type: String, icon: String,
        bgColor: Int, textColor: Int, text2Color: Int, text3Color: Int, accentColor: Int
    ): View {
        fun dp(v: Int) = (v * density).toInt()

        val typeColor = when (type) {
            "birthday" -> Color.parseColor("#4ADE80")
            "anniversary" -> Color.parseColor("#F472B6")
            "milestone" -> Color.parseColor("#FBBF24")
            else -> accentColor
        }

        // Parse date
        val cal = Calendar.getInstance()
        val parts = dateISO.split("-", "T")
        if (parts.size >= 3) {
            cal.set(parts[0].toInt(), parts[1].toInt() - 1, parts[2].substring(0, minOf(2, parts[2].length)).toInt())
        }

        val now = Calendar.getInstance()
        val daysSince = TimeUnit.MILLISECONDS.toDays(now.timeInMillis - cal.timeInMillis)

        // Calculate live age
        var years = now.get(Calendar.YEAR) - cal.get(Calendar.YEAR)
        var months = now.get(Calendar.MONTH) - cal.get(Calendar.MONTH)
        if (months < 0) { years--; months += 12 }

        // Card container
        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(14), dp(16), dp(14))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(10) }

            // Rounded bg
            val gd = android.graphics.drawable.GradientDrawable().apply {
                setColor(adjustAlpha(textColor, 0.04f))
                cornerRadius = dp(16).toFloat()
                setStroke(dp(1), adjustAlpha(textColor, 0.07f))
            }
            background = gd
        }

        // Top row: icon + label + type badge
        val topRow = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(12) }
        }

        // Icon
        val iconView = TextView(ctx).apply {
            text = icon
            textSize = 22f
            layoutParams = LinearLayout.LayoutParams(dp(36), dp(36)).apply {
                marginEnd = dp(10)
            }
            gravity = Gravity.CENTER

            val iconBg = android.graphics.drawable.GradientDrawable().apply {
                setColor(adjustAlpha(typeColor, 0.12f))
                cornerRadius = dp(10).toFloat()
            }
            background = iconBg
        }
        topRow.addView(iconView)

        // Label column
        val labelCol = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        val labelText = TextView(ctx).apply {
            text = label
            setTextColor(textColor)
            textSize = 15f
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
        }
        val dateText = TextView(ctx).apply {
            val fmt = SimpleDateFormat("MMMM d, yyyy", Locale.getDefault())
            text = fmt.format(cal.time)
            setTextColor(text3Color)
            textSize = 11f
        }
        labelCol.addView(labelText)
        labelCol.addView(dateText)
        topRow.addView(labelCol)

        // Type badge
        val badge = TextView(ctx).apply {
            text = type.uppercase()
            setTextColor(typeColor)
            textSize = 9f
            letterSpacing = 0.1f
            setPadding(dp(8), dp(3), dp(8), dp(3))
            val badgeBg = android.graphics.drawable.GradientDrawable().apply {
                setColor(adjustAlpha(typeColor, 0.12f))
                cornerRadius = dp(6).toFloat()
            }
            background = badgeBg
        }
        topRow.addView(badge)

        card.addView(topRow)

        // Divider
        val divider = View(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(1)
            ).apply { bottomMargin = dp(10) }
            setBackgroundColor(adjustAlpha(textColor, 0.06f))
        }
        card.addView(divider)

        // Stats row
        val statsRow = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        // Days since
        val daysCol = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        daysCol.addView(TextView(ctx).apply {
            text = String.format("%,d", daysSince)
            setTextColor(textColor)
            textSize = 18f
            gravity = Gravity.CENTER
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
        })
        daysCol.addView(TextView(ctx).apply {
            text = "DAYS SINCE"
            setTextColor(text3Color)
            textSize = 9f
            letterSpacing = 0.1f
            gravity = Gravity.CENTER
        })
        statsRow.addView(daysCol)

        // Vertical divider
        statsRow.addView(View(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(dp(1), dp(28)).apply {
                marginStart = dp(8); marginEnd = dp(8)
            }
            setBackgroundColor(adjustAlpha(textColor, 0.06f))
        })

        // Live age
        val ageCol = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        ageCol.addView(TextView(ctx).apply {
            text = "${years}y ${months}m"
            setTextColor(textColor)
            textSize = 18f
            gravity = Gravity.CENTER
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
        })
        ageCol.addView(TextView(ctx).apply {
            text = "LIVE AGE"
            setTextColor(text3Color)
            textSize = 9f
            letterSpacing = 0.1f
            gravity = Gravity.CENTER
        })
        statsRow.addView(ageCol)

        card.addView(statsRow)
        return card
    }

    private fun adjustAlpha(color: Int, factor: Float): Int {
        val alpha = (Color.alpha(color) * factor).toInt().coerceIn(0, 255)
        return Color.argb(alpha, Color.red(color), Color.green(color), Color.blue(color))
    }
}
