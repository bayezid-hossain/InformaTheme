package com.informatheme.app

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.LayerDrawable
import android.util.Log
import android.util.TypedValue
import android.view.*
import android.widget.*
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.TimeUnit

class LockscreenActivity : Activity() {

    companion object {
        const val ACTION_DISMISS = "com.informatheme.app.DISMISS_LOCKSCREEN"
    }

    private var clockTextView: TextView? = null
    private var ampmTextView: TextView? = null
    private val handler = Handler(Looper.getMainLooper())
    private val timeFormat = SimpleDateFormat("hh:mm", Locale.getDefault())
    private val ampmFormat = SimpleDateFormat("a", Locale.getDefault())
    private var dismissReceiver: BroadcastReceiver? = null

    private var batteryLevel: Int = 100
    private var isCharging: Boolean = false
    private var batteryFillView: View? = null
    private var batteryText: TextView? = null

    private var dataReceiver: BroadcastReceiver? = null
    private var batteryReceiver: BroadcastReceiver? = null

    private val clockUpdater = object : Runnable {
        override fun run() {
            clockTextView?.text = timeFormat.format(Date())
            ampmTextView?.text = ampmFormat.format(Date()).uppercase()
            handler.postDelayed(this, 30_000)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        applyLockscreenFlags()
        
        Log.d("LockscreenActivity", "onCreate initializing battery")
        // Initial battery state
        val ifilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        val batteryStatus = registerReceiver(null, ifilter)
        batteryStatus?.let { intent ->
            val level = intent.getIntExtra("level", -1)
            val scale = intent.getIntExtra("scale", -1)
            batteryLevel = (level * 100 / scale.toFloat()).toInt()
            val status = intent.getIntExtra("status", -1)
            isCharging = status == android.os.BatteryManager.BATTERY_STATUS_CHARGING ||
                         status == android.os.BatteryManager.BATTERY_STATUS_FULL
        }

        refreshUI()
        handler.postDelayed(clockUpdater, 30_000)
        registerReceivers()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        Log.d("LockscreenActivity", "onNewIntent: refreshing UI")
        refreshUI()
    }

    private fun refreshUI() {
        val prefs = getSharedPreferences(LockscreenService.PREFS_NAME, Context.MODE_PRIVATE)
        val variant     = prefs.getString("variant",  "darkPremium") ?: "darkPremium"
        val bgColor     = parseColor(prefs.getString("bg",     "#0d0f12"), "#0d0f12")
        val bg1Color    = parseColor(prefs.getString("bg1",    "#13161c"), "#13161c")
        val bg2Color    = parseColor(prefs.getString("bg2",    "#1a1e27"), "#1a1e27")
        val accentColor = parseColor(prefs.getString("accent", "#4ade80"), "#4ade80")
        val textColor   = parseColor(prefs.getString("text",   "#e8ecf2"), "#e8ecf2")
        val text2Color  = parseColor(prefs.getString("text2",  "#8892a4"), "#8892a4")
        val text3Color  = parseColor(prefs.getString("text3",  "#4a5568"), "#4a5568")
        val tagline     = prefs.getString("tagline", "BEST YEARS AHEAD") ?: "BEST YEARS AHEAD"
        val weather     = prefs.getString("weather", "WEATHER 22°C (Bhaluka)") ?: "WEATHER 22°C (Bhaluka)"
        val datesJson   = prefs.getString("dates", "[]") ?: "[]"

        Log.d("LockscreenActivity", "refreshUI: variant=$variant, bg=$bgColor")

        setContentView(buildOverlayView(variant, bgColor, bg1Color, bg2Color, textColor, text2Color, text3Color, accentColor, tagline, weather, datesJson))
        updateBatteryUI() // Ensure battery UI matches initial state
    }

    private fun applyLockscreenFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }
        window.addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
    }

    private fun registerReceivers() {
        // Dismiss / Present
        dismissReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                when (intent.action) {
                    Intent.ACTION_USER_PRESENT -> finishAndRemoveTask()
                    ACTION_DISMISS            -> finishAndRemoveTask()
                }
            }
        }
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_USER_PRESENT)
            addAction(ACTION_DISMISS)
        }

        // Data Update
        dataReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                if (intent.action == "com.informatheme.app.DATA_UPDATED") {
                    Log.d("LockscreenActivity", "Broadcast received: DATA_UPDATED")
                    refreshUI()
                }
            }
        }
        val dataFilter = IntentFilter("com.informatheme.app.DATA_UPDATED")

        // Battery
        batteryReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                if (intent.action == Intent.ACTION_BATTERY_CHANGED) {
                    val level = intent.getIntExtra("level", -1)
                    val scale = intent.getIntExtra("scale", -1)
                    batteryLevel = (level * 100 / scale.toFloat()).toInt()
                    
                    val status = intent.getIntExtra("status", -1)
                    isCharging = status == android.os.BatteryManager.BATTERY_STATUS_CHARGING ||
                                 status == android.os.BatteryManager.BATTERY_STATUS_FULL
                    
                    updateBatteryUI()
                }
            }
        }
        val batteryFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(dismissReceiver, filter, Context.RECEIVER_EXPORTED)
            registerReceiver(dataReceiver, dataFilter, Context.RECEIVER_EXPORTED)
            registerReceiver(batteryReceiver, batteryFilter, Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(dismissReceiver, filter)
            registerReceiver(dataReceiver, dataFilter)
            registerReceiver(batteryReceiver, batteryFilter)
        }
    }

    private fun updateBatteryUI() {
        batteryFillView?.let { fill ->
            val lp = fill.layoutParams as FrameLayout.LayoutParams
            lp.width = (batteryLevel * (dp(45) - dp(4)) / 100)
            fill.layoutParams = lp
        }
        batteryText?.text = "$batteryLevel%${if (isCharging) " ⚡" else ""}"
    }

    private fun dp(v: Int): Int = (v * resources.displayMetrics.density).toInt()

    private inner class SwipeDismissTouchListener : View.OnTouchListener {
        private var startX = 0f
        private var startY = 0f
        private val swipeThreshold = 150

        override fun onTouch(v: View, event: MotionEvent): Boolean {
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    startX = event.rawX
                    startY = event.rawY
                    return true
                }
                MotionEvent.ACTION_UP -> {
                    val deltaX = event.rawX - startX
                    val deltaY = event.rawY - startY
                    if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
                        finishAndRemoveTask()
                        return true
                    }
                }
            }
            return false
        }
    }

    @Suppress("OVERRIDE_DEPRECATION", "MissingSuperCall")
    override fun onBackPressed() { /* block back key on lockscreen */ }

    override fun onDestroy() {
        handler.removeCallbacks(clockUpdater)
        clockTextView = null
        ampmTextView  = null
        batteryFillView = null
        batteryText = null
        
        try { unregisterReceiver(dismissReceiver) } catch (_: Exception) {}
        try { unregisterReceiver(dataReceiver) } catch (_: Exception) {}
        try { unregisterReceiver(batteryReceiver) } catch (_: Exception) {}
        
        super.onDestroy()
    }

    // ── UI builder ────────────────────────────────────────────────────────────

    @Suppress("DEPRECATION")
    private fun buildOverlayView(
        variant: String, bgColor: Int, bg1Color: Int, bg2Color: Int,
        textColor: Int, text2Color: Int, text3Color: Int,
        accentColor: Int, tagline: String, weather: String, datesJson: String
    ): View {
        val ctx = this
        val density = resources.displayMetrics.density
        fun dp(v: Int) = (v * density).toInt()

        val root = FrameLayout(ctx).apply {
            background = GradientDrawable(GradientDrawable.Orientation.TL_BR, intArrayOf(bgColor, bg1Color, bg2Color))
            isClickable = true
            isFocusable  = true
            setOnTouchListener(SwipeDismissTouchListener())
        }

        // Background shapes
        addBackgroundShapes(ctx, root, variant, density)

        val scroll = ScrollView(ctx).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            setPadding(dp(24), dp(64), dp(24), dp(40))
            isVerticalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
        }

        val content = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }

        // Battery row
        val batteryRow = LinearLayout(ctx).apply {
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(16) }
        }
        batteryRow.addView(buildBatteryWidget(ctx, density, accentColor))
        content.addView(batteryRow)

        // Date tagline
        val dateFormat = SimpleDateFormat("EEE MM-dd", Locale.getDefault())
        content.addView(TextView(ctx).apply {
            text = "${dateFormat.format(Date()).uppercase()} \u25BC $tagline \u25BC"
            setTextColor(textColor)
            textSize     = 10f
            letterSpacing = 0.15f
            gravity      = Gravity.CENTER
            setTypeface(typeface, Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(12) }
        })

        // Clock
        val clockTv = TextView(ctx).apply {
            text     = timeFormat.format(Date())
            setTextColor(textColor)
            textSize = 80f
            typeface = Typeface.create("sans-serif-condensed-light", Typeface.NORMAL)
            gravity  = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(20) }
        }
        clockTextView = clockTv
        content.addView(clockTv)

        // Anchor dates / Milestones
        try {
            val arr = JSONArray(datesJson)
            for (i in 0 until arr.length()) {
                val obj     = arr.getJSONObject(i)
                val label   = obj.optString("label",   "")
                val dateISO = obj.optString("dateISO", "")
                val type    = obj.optString("type",    "")
                if (label.isEmpty() || dateISO.isEmpty()) continue
                content.addView(
                    buildDateCard(ctx, density, label, dateISO, type,
                        bgColor, textColor, text2Color, text3Color, accentColor)
                )
            }
        } catch (_: Exception) {}

        // Motivational quote
        val quotes = arrayOf(
            "Every day counts.",
            "Time reveals what matters.",
            "The present is a gift.",
            "Growth takes patience.",
            "Moments become memories."
        )
        content.addView(TextView(ctx).apply {
            text = "\"${quotes[Calendar.getInstance().get(Calendar.DAY_OF_YEAR) % quotes.size]}\""
            setTextColor(text3Color)
            textSize = 13f
            gravity  = Gravity.CENTER
            setTypeface(typeface, Typeface.ITALIC)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(24) }
        })

        // Unlock Slider
        content.addView(buildUnlockSlider(ctx, density, accentColor, textColor, text3Color))

        // Goal text
        content.addView(TextView(ctx).apply {
            text = "Current Goal: Make memories."
            setTextColor(text2Color)
            textSize = 11f
            setTypeface(typeface, Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(16) }
        })

        // Bottom Pills
        val bottomPills = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(24); bottomMargin = dp(40) }
        }
        val dayName = SimpleDateFormat("EEEE", Locale.getDefault()).format(Date()).uppercase()
        bottomPills.addView(buildPill(ctx, density, "TODAY, $dayName", textColor))
        
        // Dynamic Battery Pill
        bottomPills.addView(buildPill(ctx, density, "BATTERY $batteryLevel%", accentColor).apply {
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(8) }
            layoutParams = lp
        })

        bottomPills.addView(buildPill(ctx, density, weather, textColor).apply {
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(8) }
            layoutParams = lp
        })
        content.addView(bottomPills)

        scroll.addView(content)
        root.addView(scroll)

        // Swipe up → dismiss overlay
        root.setOnTouchListener(object : View.OnTouchListener {
            private var startY    = 0f
            private var startTime = 0L

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        startY    = event.rawY
                        startTime = System.currentTimeMillis()
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val dy = startY - event.rawY
                        val dt = System.currentTimeMillis() - startTime
                        if (dy > 200 && dt < 500) {
                            finishAndRemoveTask()
                            return true
                        }
                    }
                }
                return false
            }
        })

        return root
    }

    private fun buildUnlockSlider(ctx: Context, density: Float, accentColor: Int, textColor: Int, text3Color: Int): View {
        fun dp(v: Int) = (v * density).toInt()
        val layout = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(40) }
        }
        layout.addView(View(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(0, dp(1), 1f)
            setBackgroundColor(Color.argb(50, 255, 255, 255))
        })
        layout.addView(FrameLayout(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(dp(80), dp(36)).apply { marginStart = dp(8) }
            background = GradientDrawable().apply {
                setColor(accentColor)
                cornerRadius = dp(8).toFloat()
            }
            addView(TextView(ctx).apply {
                text = "⚡"
                gravity = Gravity.CENTER
                textSize = 18f
            })
        })
        layout.addView(View(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(dp(6), dp(20)).apply { marginStart = dp(8) }
            background = GradientDrawable().apply {
                setColor(text3Color)
                cornerRadius = dp(3).toFloat()
            }
        })
        return layout
    }

    private fun buildPill(ctx: Context, density: Float, textStr: String, textColor: Int): View {
        fun dp(v: Int) = (v * density).toInt()
        return TextView(ctx).apply {
            text = textStr
            setTextColor(textColor)
            textSize = 10f
            setTypeface(typeface, Typeface.BOLD)
            setPadding(dp(12), dp(6), dp(12), dp(6))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            background = GradientDrawable().apply {
                setColor(Color.argb(100, 0, 0, 0))
                cornerRadius = dp(16).toFloat()
                setStroke(dp(1), Color.argb(60, 255, 255, 255))
            }
        }
    }

    private fun addBackgroundShapes(ctx: Context, root: FrameLayout, variant: String, density: Float) {
        fun dp(v: Int) = (v * density).toInt()
        val screenW = resources.displayMetrics.widthPixels
        val screenH = resources.displayMetrics.heightPixels

        when (variant) {
            "deepForest", "softSage" -> {
                // Trees / Waves
                root.addView(View(ctx).apply {
                    layoutParams = FrameLayout.LayoutParams(dp(80), dp(350)).apply {
                        gravity = Gravity.BOTTOM or Gravity.START
                        leftMargin = dp(-20); bottomMargin = dp(-50)
                    }
                    background = GradientDrawable().apply {
                        setColor(Color.argb(80, 0, 0, 0))
                        cornerRadius = dp(40).toFloat()
                    }
                })
                root.addView(View(ctx).apply {
                    layoutParams = FrameLayout.LayoutParams(dp(70), dp(400)).apply {
                        gravity = Gravity.BOTTOM or Gravity.START
                        leftMargin = dp(80); bottomMargin = dp(-20)
                    }
                    background = GradientDrawable().apply {
                        setColor(Color.argb(100, 0, 0, 0))
                        cornerRadius = dp(35).toFloat()
                    }
                })
            }
            "midnightStars", "oceanDive" -> {
                // Central circle
                root.addView(View(ctx).apply {
                    val size = (screenW * 0.6).toInt()
                    layoutParams = FrameLayout.LayoutParams(size, size).apply {
                        gravity = Gravity.CENTER
                    }
                    background = GradientDrawable().apply {
                        setColor(Color.argb(90, 0, 0, 0))
                        cornerRadius = (size / 2).toFloat()
                    }
                })
            }
            "warmEarth" -> {
                // Large warm circles
                root.addView(View(ctx).apply {
                    val size = (screenW * 1.2).toInt()
                    layoutParams = FrameLayout.LayoutParams(size, size).apply {
                        gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                        topMargin = (screenH * 0.35).toInt()
                    }
                    background = GradientDrawable().apply {
                        setColor(Color.argb(90, 0, 0, 0))
                        cornerRadius = (size / 2).toFloat()
                    }
                })
            }
        }
    }

    private fun buildBatteryWidget(ctx: Context, density: Float, accentColor: Int): View {
        fun dp(v: Int) = (v * density).toInt()
        val layout = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        // Battery text
        batteryText = TextView(ctx).apply {
            text = "100%"
            setTextColor(Color.WHITE)
            textSize = 10f
            setTypeface(typeface, Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { marginEnd = dp(8) }
        }
        layout.addView(batteryText)

        // Cable
        layout.addView(View(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(dp(20), dp(2))
            setBackgroundColor(Color.argb(120, 255, 255, 255))
        })
        // Battery body
        val body = FrameLayout(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(dp(45), dp(20)).apply { marginStart = dp(4); marginEnd = dp(4) }
            background = GradientDrawable().apply {
                setStroke(dp(1), Color.argb(150, 255, 255, 255))
                cornerRadius = dp(4).toFloat()
            }
        }
        val fill = View(ctx).apply {
            layoutParams = FrameLayout.LayoutParams(dp(41), dp(16)).apply { 
                gravity = Gravity.START or Gravity.CENTER_VERTICAL
                marginStart = dp(2)
            }
            background = GradientDrawable().apply {
                setColor(accentColor)
                cornerRadius = dp(2).toFloat()
            }
        }
        batteryFillView = fill
        body.addView(fill)
        layout.addView(body)
        
        // Nub
        layout.addView(View(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(dp(3), dp(8))
            background = GradientDrawable().apply {
                setColor(Color.argb(150, 255, 255, 255))
                cornerRadius = dp(1).toFloat()
            }
        })
        return layout
    }

    private fun buildDateCard(
        ctx: Context, density: Float,
        label: String, dateISO: String, type: String,
        bgColor: Int, textColor: Int, text2Color: Int, text3Color: Int, accentColor: Int
    ): View {
        fun dp(v: Int) = (v * density).toInt()

        val cal   = Calendar.getInstance()
        val parts = dateISO.split("-", "T")
        if (parts.size >= 3) {
            cal.set(
                parts[0].toInt(),
                parts[1].toInt() - 1,
                parts[2].substring(0, minOf(2, parts[2].length)).toInt()
            )
        }

        val now       = Calendar.getInstance()
        val daysSince = TimeUnit.MILLISECONDS.toDays(now.timeInMillis - cal.timeInMillis)
        var years     = now.get(Calendar.YEAR)  - cal.get(Calendar.YEAR)
        var months    = now.get(Calendar.MONTH) - cal.get(Calendar.MONTH)
        if (months < 0) { years--; months += 12 }

        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(12) }
            background = GradientDrawable().apply {
                setColor(Color.argb(30, 0, 0, 0)) // Translucent black
                cornerRadius = dp(24).toFloat()
                setStroke(dp(1), Color.argb(25, 255, 255, 255)) // Subtle border
            }
        }

        // Label row
        card.addView(TextView(ctx).apply {
            text = label
            setTextColor(textColor)
            textSize = 15f
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
        })
        card.addView(TextView(ctx).apply {
            text = "${years}y ${months}m ${daysSince % 30}d old"
            setTextColor(text2Color)
            textSize = 12f
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = dp(8) }
        })

        // Progress row (approximation of ring)
        val progressContainer = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        progressContainer.addView(View(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(0, dp(4), 1f).apply { marginEnd = dp(8) }
            background = GradientDrawable().apply {
                setColor(Color.argb(40, 255, 255, 255))
                cornerRadius = dp(2).toFloat()
            }
        })
        progressContainer.addView(TextView(ctx).apply {
            text = String.format("%,d DAYS", daysSince)
            setTextColor(accentColor)
            textSize = 10f
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
        })
        card.addView(progressContainer)

        return card
    }

    private fun parseColor(hex: String?, fallback: String): Int =
        try { Color.parseColor(hex) } catch (_: Exception) { Color.parseColor(fallback) }

    private fun adjustAlpha(color: Int, factor: Float): Int {
        val alpha = (Color.alpha(color) * factor).toInt().coerceIn(0, 255)
        return Color.argb(alpha, Color.red(color), Color.green(color), Color.blue(color))
    }
}
