package com.informatheme.app

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.*
import android.widget.*
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.TimeUnit

class LockscreenActivity : Activity() {

    companion object {
        const val ACTION_DISMISS = "com.informatheme.app.DISMISS_LOCKSCREEN"
        private const val DIM_DELAY = 7000L
    }

    private var clockTextView: TextView? = null
    private var bottomChargingIconView: TextView? = null
    private val handler = Handler(Looper.getMainLooper())
    private val timeFormat = SimpleDateFormat("hh:mm", Locale.getDefault())
    private var dismissReceiver: BroadcastReceiver? = null
    private var dataReceiver: BroadcastReceiver? = null
    private var batteryReceiver: BroadcastReceiver? = null

    private var batteryLevel: Int = 100
    private var isCharging: Boolean = false
    private val batteryFillViews = mutableListOf<View>()
    private val batteryTexts = mutableListOf<TextView>()
    private val batteryPillViews = mutableListOf<TextView>()

    private val clockUpdater = object : Runnable {
        override fun run() {
            clockTextView?.text = timeFormat.format(Date())
            handler.postDelayed(this, 30_000)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        applyLockscreenFlags()
        val batteryStatus = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        batteryStatus?.let {
            val level = it.getIntExtra("level", -1)
            val scale = it.getIntExtra("scale", -1)
            batteryLevel = (level * 100 / scale.toFloat()).toInt()
            val status = it.getIntExtra("status", -1)
            isCharging = status == android.os.BatteryManager.BATTERY_STATUS_CHARGING ||
                         status == android.os.BatteryManager.BATTERY_STATUS_FULL
        }
        refreshUI()
        handler.postDelayed(clockUpdater, 30_000)
        registerReceivers()
    }

    override fun onResume() {
        super.onResume()
    }

    override fun onPause() {
        super.onPause()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
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
        val widgetsJson = prefs.getString("widgets", "[\"clock\",\"milestone\",\"anniversary\",\"birthday\",\"weather\"]") ?: "[\"clock\",\"milestone\",\"anniversary\",\"birthday\",\"weather\"]"
        setContentView(buildOverlayView(variant, bgColor, bg1Color, bg2Color,
            textColor, text2Color, text3Color, accentColor, tagline, weather, datesJson, widgetsJson))
        updateBatteryUI()
    }

    private fun applyLockscreenFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED)
    }

    private fun registerReceivers() {
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
        dataReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                if (intent.action == "com.informatheme.app.DATA_UPDATED") refreshUI()
            }
        }
        batteryReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                if (intent.action != Intent.ACTION_BATTERY_CHANGED) return
                val level = intent.getIntExtra("level", -1)
                val scale = intent.getIntExtra("scale", -1)
                batteryLevel = (level * 100 / scale.toFloat()).toInt()
                val status = intent.getIntExtra("status", -1)
                isCharging = status == android.os.BatteryManager.BATTERY_STATUS_CHARGING ||
                             status == android.os.BatteryManager.BATTERY_STATUS_FULL
                updateBatteryUI()
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(dismissReceiver, filter, Context.RECEIVER_EXPORTED)
            registerReceiver(dataReceiver, IntentFilter("com.informatheme.app.DATA_UPDATED"), Context.RECEIVER_EXPORTED)
            registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED), Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(dismissReceiver, filter)
            registerReceiver(dataReceiver, IntentFilter("com.informatheme.app.DATA_UPDATED"))
            registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        }
    }

    private fun updateBatteryUI() {
        val batteryStr = "$batteryLevel%${if (isCharging) " ⚡" else ""}"
        batteryTexts.forEach { it.text = batteryStr }
        val batteryPillStr = "BATTERY $batteryLevel%${if (isCharging) " ⚡" else ""}"
        batteryPillViews.forEach { it.text = batteryPillStr }
        bottomChargingIconView?.text = if (isCharging) "⚡" else ""
        batteryFillViews.forEach { fill ->
            val lp = fill.layoutParams as FrameLayout.LayoutParams
            lp.width = (batteryLevel * (dp(45) - dp(4)) / 100)
            fill.layoutParams = lp
        }
    }

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    @Suppress("OVERRIDE_DEPRECATION", "MissingSuperCall")
    override fun onBackPressed() {}

    override fun onDestroy() {
        handler.removeCallbacks(clockUpdater)
        clockTextView = null
        bottomChargingIconView = null
        batteryFillViews.clear()
        batteryTexts.clear()
        batteryPillViews.clear()
        try { unregisterReceiver(dismissReceiver) } catch (_: Exception) {}
        try { unregisterReceiver(dataReceiver) }    catch (_: Exception) {}
        try { unregisterReceiver(batteryReceiver) } catch (_: Exception) {}
        super.onDestroy()
    }

    // ── Data parsing ──────────────────────────────────────────────────────────

    data class DateEntry(
        val label: String, val type: String, val icon: String,
        val daysSince: Long, val years: Int, val months: Int,
        val daysRemainder: Int, val daysUntilNext: Int?,
        val nextMonths: Int, val nextDays: Int, val originalDateStr: String
    )

    private fun parseDatesJson(json: String): List<DateEntry> {
        val result = mutableListOf<DateEntry>()
        try {
            val arr = JSONArray(json)
            for (i in 0 until arr.length()) {
                val obj     = arr.getJSONObject(i)
                val label   = obj.optString("label", "")
                val dateISO = obj.optString("dateISO", "")
                val type    = obj.optString("type", "milestone")
                val icon    = obj.optString("icon", "")
                if (label.isEmpty() || dateISO.isEmpty()) continue

                val cal   = Calendar.getInstance()
                val parts = dateISO.split("-", "T")
                if (parts.size >= 3) {
                    cal.set(parts[0].toInt(), parts[1].toInt() - 1,
                        parts[2].substring(0, minOf(2, parts[2].length)).toInt())
                    cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0)
                    cal.set(Calendar.SECOND, 0);      cal.set(Calendar.MILLISECOND, 0)
                }
                val now       = Calendar.getInstance()
                val daysSince = TimeUnit.MILLISECONDS.toDays(now.timeInMillis - cal.timeInMillis)
                var years     = now.get(Calendar.YEAR)  - cal.get(Calendar.YEAR)
                var months    = now.get(Calendar.MONTH) - cal.get(Calendar.MONTH)
                var daysRemainder = now.get(Calendar.DAY_OF_MONTH) - cal.get(Calendar.DAY_OF_MONTH)
                if (daysRemainder < 0) {
                    months--
                    val prevMonth = (now.clone() as Calendar).apply { add(Calendar.MONTH, -1) }
                    daysRemainder += prevMonth.getActualMaximum(Calendar.DAY_OF_MONTH)
                }
                if (months < 0) {
                    years--
                    months += 12
                }

                var nextMonths = 0
                var nextDays = 0
                val daysUntilNext: Int? = if (type != "milestone") {
                    val next = Calendar.getInstance().apply {
                        set(Calendar.MONTH, cal.get(Calendar.MONTH))
                        set(Calendar.DAY_OF_MONTH, cal.get(Calendar.DAY_OF_MONTH))
                        set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
                        set(Calendar.SECOND, 0);      set(Calendar.MILLISECOND, 0)
                    }
                    if (!next.after(now)) next.add(Calendar.YEAR, 1)
                    
                    // Calculate months and days for next event
                    nextMonths = next.get(Calendar.MONTH) - now.get(Calendar.MONTH)
                    nextDays = next.get(Calendar.DAY_OF_MONTH) - now.get(Calendar.DAY_OF_MONTH)
                    if (nextDays < 0) {
                        nextMonths--
                        val prevMonth = (next.clone() as Calendar).apply { add(Calendar.MONTH, -1) }
                        nextDays += prevMonth.getActualMaximum(Calendar.DAY_OF_MONTH)
                    }
                    if (nextMonths < 0) nextMonths += 12
                    
                    TimeUnit.MILLISECONDS.toDays(next.timeInMillis - now.timeInMillis).toInt()
                } else null

                val originalDateStr = SimpleDateFormat("MMM d, yyyy", Locale.getDefault()).format(cal.time)
                result.add(DateEntry(label, type, icon, daysSince, years, months, daysRemainder, daysUntilNext, nextMonths, nextDays, originalDateStr))
            }
        } catch (e: Exception) { Log.e("LockscreenActivity", "parseDatesJson: ${e.message}") }
        return result
    }

    // ── Main UI builder ───────────────────────────────────────────────────────

    private fun buildOverlayView(
        variant: String, bgColor: Int, bg1Color: Int, bg2Color: Int,
        textColor: Int, text2Color: Int, text3Color: Int,
        accentColor: Int, tagline: String, weather: String, datesJson: String, widgetsJson: String
    ): View {
        val enabledWidgets = mutableSetOf<String>()
        try {
            val arr = JSONArray(widgetsJson)
            for (i in 0 until arr.length()) enabledWidgets.add(arr.getString(i))
        } catch (_: Exception) {
            enabledWidgets.addAll(listOf("clock", "milestone", "anniversary", "birthday", "weather"))
        }

        val ctx = this
        val MP  = ViewGroup.LayoutParams.MATCH_PARENT
        val WC  = ViewGroup.LayoutParams.WRAP_CONTENT

        val root = FrameLayout(ctx).apply {
            background = GradientDrawable(GradientDrawable.Orientation.TL_BR,
                intArrayOf(bgColor, bg1Color, bg2Color))
            isClickable = true; isFocusable = true
        }

        batteryTexts.clear()
        batteryFillViews.clear()
        batteryPillViews.clear()

        addBackgroundShapes(ctx, root, variant, resources.displayMetrics.density)

        val scroll = ScrollView(ctx).apply {
            layoutParams = FrameLayout.LayoutParams(MP, MP)
            setPadding(0, dp(52), 0, dp(60))
            isVerticalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
        }
        val content = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(MP, WC)
        }

        // Battery
        if (enabledWidgets.contains("battery")) {
            content.addView(LinearLayout(ctx).apply {
                gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(10) }
                addView(buildBatteryWidget(ctx, accentColor))
            })
        }

        // Tagline & Clock
        if (enabledWidgets.contains("clock")) {
            val dateFmt = SimpleDateFormat("EEE MM-dd", Locale.getDefault())
            content.addView(TextView(ctx).apply {
                text = "${dateFmt.format(Date()).uppercase()} ▼ $tagline ▼"
                setTextColor(textColor); textSize = 10f; letterSpacing = 0.15f
                gravity = Gravity.CENTER; setTypeface(typeface, Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(2) }
            })

            content.addView(TextView(ctx).apply {
                text = timeFormat.format(Date())
                setTextColor(textColor); textSize = 80f
                typeface = Typeface.create("sans-serif-condensed-light", Typeface.NORMAL)
                gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(20) }
            }.also { clockTextView = it })
        }

        // Date carousels
        val dates         = parseDatesJson(datesJson)
        val birthdays     = dates.filter { it.type == "birthday" }
        val anniversaries = dates.filter { it.type == "anniversary" }
        val milestones    = dates.filter { it.type == "milestone" }

        if (enabledWidgets.contains("birthday") && birthdays.isNotEmpty())
            content.addView(buildCarousel(
                birthdays.map { buildBirthdayCard(ctx, it, accentColor, bg1Color, textColor, text2Color, text3Color) }
            ))

        if (enabledWidgets.contains("anniversary") && anniversaries.isNotEmpty())
            content.addView(buildCarousel(
                anniversaries.map { buildAnniversaryCard(ctx, it, accentColor, bg1Color, textColor, text3Color) },
                narrow = true
            ))

        if (enabledWidgets.contains("milestone") && milestones.isNotEmpty())
            content.addView(buildCarousel(
                milestones.map { buildMilestoneCard(ctx, it, accentColor, bg1Color, textColor, text2Color, text3Color) }
            ))

        // Upcoming chips ≤30 days
        val upcoming = dates.filter {
            it.daysUntilNext != null && it.daysUntilNext!! <= 30 && (
                (it.type == "birthday" && enabledWidgets.contains("birthday")) ||
                (it.type == "anniversary" && enabledWidgets.contains("anniversary"))
            )
        }
        if (upcoming.isNotEmpty()) {
            val col = LinearLayout(ctx).apply {
                orientation = LinearLayout.VERTICAL
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply {
                    bottomMargin = dp(16); marginStart = dp(20); marginEnd = dp(20)
                }
            }
            upcoming.forEach { d ->
                val emoji = if (d.type == "birthday") "🎂" else "💍"
                col.addView(buildPill(ctx, "${d.label}: ${d.daysUntilNext} Days $emoji", textColor).apply {
                    (layoutParams as LinearLayout.LayoutParams).bottomMargin = dp(6)
                })
            }
            content.addView(col)
        }

        // Quote
        val quotes = arrayOf("Every day counts.", "Time reveals what matters.",
            "The present is a gift.", "Growth takes patience.", "Moments become memories.")
        content.addView(TextView(ctx).apply {
            text = "\"${quotes[Calendar.getInstance().get(Calendar.DAY_OF_YEAR) % quotes.size]}\""
            setTextColor(text3Color); textSize = 13f; gravity = Gravity.CENTER
            setTypeface(typeface, Typeface.ITALIC)
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply {
                topMargin = dp(4); bottomMargin = dp(20)
                marginStart = dp(20); marginEnd = dp(20)
            }
        })

        // Pills
        val pillsCol = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply {
                bottomMargin = dp(16); marginStart = dp(20); marginEnd = dp(20)
            }
        }
        val dayOfWeek = SimpleDateFormat("EEEE", Locale.getDefault()).format(Date()).uppercase()
        val todayStr = "TODAY, $dayOfWeek"
        pillsCol.addView(buildPill(ctx, todayStr, textColor).apply {
            (layoutParams as LinearLayout.LayoutParams).bottomMargin = dp(8)
        })
        if (enabledWidgets.contains("weather") && weather.isNotEmpty()) pillsCol.addView(buildPill(ctx, weather, textColor))
        content.addView(pillsCol)

        // Unlock slider
        content.addView(LinearLayout(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply {
                marginStart = dp(20); marginEnd = dp(20)
            }
            addView(buildUnlockSlider(ctx, accentColor, text3Color))
        })

        scroll.addView(content)
        root.addView(scroll)

        // Touch: swipe-up dismiss
        scroll.setOnTouchListener(object : View.OnTouchListener {
            private var startY = 0f; private var startTime = 0L
            override fun onTouch(v: View, e: MotionEvent): Boolean {
                when (e.action) {
                    MotionEvent.ACTION_DOWN -> { startY = e.rawY; startTime = System.currentTimeMillis() }
                    MotionEvent.ACTION_UP -> {
                        val dy = startY - e.rawY
                        val dt = System.currentTimeMillis() - startTime
                        if (dy > 200 && dt < 500) { finishAndRemoveTask(); return true }
                    }
                }
                return false
            }
        })

        return root
    }

    // ── Card carousels ────────────────────────────────────────────────────────

    private fun buildCarousel(cards: List<View>, narrow: Boolean = false): View {
        val MP  = ViewGroup.LayoutParams.MATCH_PARENT
        val WC  = ViewGroup.LayoutParams.WRAP_CONTENT
        val screenW = resources.displayMetrics.widthPixels
        val sidePad = dp(20)
        val gap     = dp(12)
        // narrow = show 2 per view (anniversary circles); wide = single card with peek
        val cardW = if (narrow) {
            (screenW - sidePad * 2 - gap) / 2
        } else {
            screenW - sidePad * 2 - dp(24) // 24dp peek of next card
        }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(16) }
        }

        val hScroll = HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            clipToPadding = false
            setPadding(sidePad, 0, sidePad, 0)
            overScrollMode = View.OVER_SCROLL_NEVER
            layoutParams = LinearLayout.LayoutParams(MP, WC)
        }
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = ViewGroup.LayoutParams(WC, WC)
        }
        cards.forEachIndexed { i, card ->
            card.layoutParams = LinearLayout.LayoutParams(cardW, WC).apply {
                if (i < cards.size - 1) marginEnd = gap
            }
            row.addView(card)
        }
        hScroll.addView(row)
        container.addView(hScroll)

        // Dynamic Dots Indicator
        if (cards.size > 1) {
            val dotsRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { topMargin = dp(8) }
            }
            val dots = mutableListOf<View>()
            val dotActiveW = dp(14)
            val dotInactiveW = dp(6)
            val dotH = dp(6)

            fun updateDots(activeIndex: Int) {
                dots.forEachIndexed { idx, dot ->
                    val lp = dot.layoutParams as LinearLayout.LayoutParams
                    lp.width = if (idx == activeIndex) dotActiveW else dotInactiveW
                    dot.layoutParams = lp
                    dot.background = GradientDrawable().apply {
                        setColor(if (idx == activeIndex) Color.WHITE else Color.argb(100, 255, 255, 255))
                        cornerRadius = dp(3).toFloat()
                    }
                }
            }

            cards.forEachIndexed { i, _ ->
                val dot = View(this).apply {
                    layoutParams = LinearLayout.LayoutParams(dotInactiveW, dotH).apply {
                        if (i < cards.size - 1) marginEnd = dp(6)
                    }
                    background = GradientDrawable().apply {
                        setColor(Color.argb(100, 255, 255, 255))
                        cornerRadius = dp(3).toFloat()
                    }
                }
                dots.add(dot)
                dotsRow.addView(dot)
            }
            updateDots(0)
            container.addView(dotsRow)

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                hScroll.setOnScrollChangeListener { _, scrollX, _, _, _ ->
                    val index = Math.round(scrollX.toFloat() / (cardW + gap).toFloat())
                    val clamped = index.coerceIn(0, cards.size - 1)
                    updateDots(clamped)
                }
            }
        }

        return container
    }

    private fun cardBackground(bg1Color: Int): GradientDrawable = GradientDrawable().apply {
        setColor(Color.argb(180, Color.red(bg1Color), Color.green(bg1Color), Color.blue(bg1Color)))
        cornerRadius = dp(16).toFloat()
        setStroke(dp(1), Color.argb(30, 255, 255, 255))
    }

    private fun buildBirthdayCard(
        ctx: Context, bd: DateEntry,
        accentColor: Int, bg1Color: Int,
        textColor: Int, text2Color: Int, text3Color: Int
    ): View {
        val MP = ViewGroup.LayoutParams.MATCH_PARENT
        val WC = ViewGroup.LayoutParams.WRAP_CONTENT
        return LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
            background = cardBackground(bg1Color)

            addView(TextView(ctx).apply {
                text = "• Born ${bd.originalDateStr} (${"%,d".format(bd.daysSince)} days ago) ${bd.icon}"
                setTextColor(accentColor); textSize = 10.5f; letterSpacing = 0.03f
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(6) }
            })
            addView(TextView(ctx).apply {
                text = bd.label
                setTextColor(textColor); textSize = 15f
                setTypeface(typeface, Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(4) }
            })
            addView(TextView(ctx).apply {
                text = "Age: ${bd.years}y ${bd.months}m ${bd.daysRemainder}d"
                setTextColor(text2Color); textSize = 12f
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(8) }
            })
            // Divider
            addView(View(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(MP, dp(1)).apply { bottomMargin = dp(8) }
                setBackgroundColor(Color.argb(20, 255, 255, 255))
            })
            bd.daysUntilNext?.let { until ->
                addView(TextView(ctx).apply {
                    val labelPrefix = if (bd.type == "birthday") "Next Birthday" else "Next Event"
                    text = "$labelPrefix: ${bd.nextMonths}m ${bd.nextDays}d ($until Days)"
                    setTextColor(text3Color); textSize = 11f; letterSpacing = 0.05f
                    layoutParams = LinearLayout.LayoutParams(MP, WC)
                })
            }
        }
    }

    private fun buildAnniversaryCard(
        ctx: Context, ann: DateEntry,
        accentColor: Int, bg1Color: Int,
        textColor: Int, text3Color: Int
    ): View {
        val MP = ViewGroup.LayoutParams.MATCH_PARENT
        val WC = ViewGroup.LayoutParams.WRAP_CONTENT
        val circleSize = dp(76)
        val lbl  = if (ann.years >= 1) "${ann.years}y" else "${ann.daysSince}d"
        val prog = (ann.daysSince % 365).toFloat() / 365f

        return LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(12), dp(16), dp(12), dp(16))
            background = cardBackground(bg1Color)

            addView(buildCircleRing(ctx, circleSize, prog, accentColor, lbl, ann.label, textColor).apply {
                layoutParams = LinearLayout.LayoutParams(WC, WC).apply { gravity = Gravity.CENTER_HORIZONTAL }
            })
            ann.daysUntilNext?.let { until ->
                addView(View(ctx).apply {
                    layoutParams = LinearLayout.LayoutParams(MP, dp(1)).apply { topMargin = dp(10); bottomMargin = dp(8) }
                    setBackgroundColor(Color.argb(20, 255, 255, 255))
                })
                addView(TextView(ctx).apply {
                    text = "Since: ${ann.originalDateStr}"
                    setTextColor(text3Color); textSize = 8.5f; gravity = Gravity.CENTER
                    layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(2) }
                })
                addView(TextView(ctx).apply {
                    text = "Next: ${ann.nextMonths}m ${ann.nextDays}d"
                    setTextColor(text3Color); textSize = 9f; gravity = Gravity.CENTER
                    layoutParams = LinearLayout.LayoutParams(MP, WC)
                })
            }
        }
    }

    private fun buildMilestoneCard(
        ctx: Context, ms: DateEntry,
        accentColor: Int, bg1Color: Int,
        textColor: Int, text2Color: Int, text3Color: Int
    ): View {
        val MP   = ViewGroup.LayoutParams.MATCH_PARENT
        val WC   = ViewGroup.LayoutParams.WRAP_CONTENT
        val prog = (ms.daysSince % 365).toFloat() / 365f

        return LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
            background = cardBackground(bg1Color)

            addView(TextView(ctx).apply {
                text = "${ms.label} (${ms.originalDateStr}):"
                setTextColor(text2Color); textSize = 11f; letterSpacing = 0.05f
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(4) }
            })
            addView(TextView(ctx).apply {
                text = "${"%,d".format(ms.daysSince)} Days Ago"
                setTextColor(textColor); textSize = 22f
                setTypeface(typeface, Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(12) }
            })
            // Progress bar
            addView(LinearLayout(ctx).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                layoutParams = LinearLayout.LayoutParams(MP, WC)
                addView(View(ctx).apply {
                    layoutParams = LinearLayout.LayoutParams(0, dp(4), prog).apply { marginEnd = dp(1) }
                    background = GradientDrawable().apply { setColor(accentColor); cornerRadius = dp(2).toFloat() }
                })
                addView(View(ctx).apply {
                    layoutParams = LinearLayout.LayoutParams(0, dp(4), 1f - prog)
                    background = GradientDrawable().apply {
                        setColor(Color.argb(30, 255, 255, 255)); cornerRadius = dp(2).toFloat()
                    }
                })
                addView(TextView(ctx).apply {
                    text = "  " + ms.daysSince.toString().map { it }.joinToString(" ")
                    setTextColor(text3Color); textSize = 10f; setTypeface(typeface, Typeface.BOLD)
                    layoutParams = LinearLayout.LayoutParams(WC, WC).apply { marginStart = dp(8) }
                })
            })
        }
    }

    // ── Widgets ───────────────────────────────────────────────────────────────

    private fun buildCircleRing(
        ctx: Context, sizePx: Int, progress: Float,
        accentColor: Int, centerText: String, label: String, textColor: Int
    ): View {
        val strokeW  = sizePx * 0.13f
        val clamped  = progress.coerceIn(0f, 1f)
        val bgPaint  = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE; strokeWidth = strokeW
            color = Color.argb(40, 255, 255, 255); strokeCap = Paint.Cap.ROUND
        }
        val fgPaint  = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE; strokeWidth = strokeW
            color = accentColor; strokeCap = Paint.Cap.ROUND
        }
        val txtPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            textAlign = Paint.Align.CENTER; color = textColor
            textSize = sizePx * 0.20f
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
        }
        val container = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER_HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(sizePx + dp(8), ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        container.addView(object : View(ctx) {
            init { layoutParams = ViewGroup.LayoutParams(sizePx, sizePx) }
            override fun onDraw(canvas: Canvas) {
                val cx = width / 2f; val cy = height / 2f
                val r  = (width - strokeW) / 2f - 2f
                canvas.drawCircle(cx, cy, r, bgPaint)
                canvas.drawArc(RectF(cx - r, cy - r, cx + r, cy + r), -90f, clamped * 360f, false, fgPaint)
                canvas.drawText(centerText, cx, cy + txtPaint.textSize * 0.35f, txtPaint)
            }
        })
        container.addView(TextView(ctx).apply {
            text = label
            setTextColor(Color.argb(160, Color.red(textColor), Color.green(textColor), Color.blue(textColor)))
            textSize = 9f; gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(3) }
        })
        return container
    }

    private fun buildUnlockSlider(ctx: Context, accentColor: Int, text3Color: Int): View {
        val MP = ViewGroup.LayoutParams.MATCH_PARENT
        val WC = ViewGroup.LayoutParams.WRAP_CONTENT
        return LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply { topMargin = dp(12); bottomMargin = dp(12) }
            addView(View(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(0, dp(1), 1f)
                setBackgroundColor(Color.argb(50, 255, 255, 255))
            })
            addView(FrameLayout(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(dp(80), dp(36)).apply { marginStart = dp(8) }
                background = GradientDrawable().apply { setColor(accentColor); cornerRadius = dp(8).toFloat() }
                addView(TextView(ctx).apply {
                    text = if (isCharging) "⚡" else ""
                    gravity = Gravity.CENTER; textSize = 18f
                    layoutParams = FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
                    bottomChargingIconView = this
                })
            })
            addView(View(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(dp(6), dp(20)).apply { marginStart = dp(8) }
                background = GradientDrawable().apply { setColor(text3Color); cornerRadius = dp(3).toFloat() }
            })
        }
    }

    private fun buildPill(ctx: Context, textStr: String, textColor: Int): View =
        TextView(ctx).apply {
            text = textStr; setTextColor(textColor); textSize = 10f
            setTypeface(typeface, Typeface.BOLD)
            setPadding(dp(12), dp(6), dp(12), dp(6))
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            background = GradientDrawable().apply {
                setColor(Color.argb(100, 0, 0, 0)); cornerRadius = dp(16).toFloat()
                setStroke(dp(1), Color.argb(60, 255, 255, 255))
            }
        }

    private fun buildBatteryWidget(ctx: Context, accentColor: Int): View {
        val WC = ViewGroup.LayoutParams.WRAP_CONTENT
        return LinearLayout(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(WC, WC)
            orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL
            addView(TextView(ctx).apply {
                text = "$batteryLevel%${if (isCharging) " ⚡" else ""}"
                setTextColor(Color.WHITE); textSize = 10f; setTypeface(typeface, Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(WC, WC).apply { marginEnd = dp(8) }
            }.also { batteryTexts.add(it) })
            addView(View(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(dp(20), dp(2))
                setBackgroundColor(Color.argb(120, 255, 255, 255))
            })
            val body = FrameLayout(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(dp(45), dp(20)).apply { marginStart = dp(4); marginEnd = dp(4) }
                background = GradientDrawable().apply {
                    setStroke(dp(1), Color.argb(150, 255, 255, 255)); cornerRadius = dp(4).toFloat()
                }
            }
            val fill = View(ctx).apply {
                layoutParams = FrameLayout.LayoutParams(
                    (batteryLevel * (dp(45) - dp(4)) / 100), dp(16)
                ).apply { gravity = Gravity.START or Gravity.CENTER_VERTICAL; marginStart = dp(2) }
                background = GradientDrawable().apply { setColor(accentColor); cornerRadius = dp(2).toFloat() }
            }
            batteryFillViews.add(fill)
            body.addView(fill); addView(body)
            addView(View(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(dp(3), dp(8))
                background = GradientDrawable().apply {
                    setColor(Color.argb(150, 255, 255, 255)); cornerRadius = dp(1).toFloat()
                }
            })
        }
    }

    private fun addBackgroundShapes(ctx: Context, root: FrameLayout, variant: String, density: Float) {
        fun dp(v: Int) = (v * density).toInt()
        val sw = resources.displayMetrics.widthPixels
        val sh = resources.displayMetrics.heightPixels
        when (variant) {
            "deepForest", "softSage" -> {
                root.addView(View(ctx).apply {
                    layoutParams = FrameLayout.LayoutParams(dp(80), dp(350)).apply {
                        gravity = Gravity.BOTTOM or Gravity.START; leftMargin = dp(-20); bottomMargin = dp(-50)
                    }
                    background = GradientDrawable().apply { setColor(Color.argb(80,0,0,0)); cornerRadius = dp(40).toFloat() }
                })
                root.addView(View(ctx).apply {
                    layoutParams = FrameLayout.LayoutParams(dp(70), dp(400)).apply {
                        gravity = Gravity.BOTTOM or Gravity.START; leftMargin = dp(80); bottomMargin = dp(-20)
                    }
                    background = GradientDrawable().apply { setColor(Color.argb(100,0,0,0)); cornerRadius = dp(35).toFloat() }
                })
            }
            "midnightStars", "oceanDive" -> root.addView(View(ctx).apply {
                val size = (sw * 0.6).toInt()
                layoutParams = FrameLayout.LayoutParams(size, size).apply { gravity = Gravity.CENTER }
                background = GradientDrawable().apply { setColor(Color.argb(90,0,0,0)); cornerRadius = (size/2).toFloat() }
            })
            "warmEarth" -> root.addView(View(ctx).apply {
                val size = (sw * 1.2).toInt()
                layoutParams = FrameLayout.LayoutParams(size, size).apply {
                    gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL; topMargin = (sh * 0.35).toInt()
                }
                background = GradientDrawable().apply { setColor(Color.argb(90,0,0,0)); cornerRadius = (size/2).toFloat() }
            })
        }
    }

    private fun parseColor(hex: String?, fallback: String): Int =
        try { Color.parseColor(hex) } catch (_: Exception) { Color.parseColor(fallback) }
}
