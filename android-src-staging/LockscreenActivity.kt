package com.informatheme.app

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.LayerDrawable
import android.net.Uri
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
    private val batteryBoltTexts = mutableListOf<TextView>()
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
        val defaultWp       = "wp_" + variant.replace("(?<=.)[A-Z]".toRegex(), "_$0").lowercase()
        val wallpaper       = prefs.getString("wallpaper", defaultWp) ?: defaultWp
        val wallpaperFilter = prefs.getString("wallpaper_filter", "original") ?: "original"
        val bgColor     = parseColor(prefs.getString("bg",     "#0d0f12"), "#0d0f12")
        val bg1Color    = parseColor(prefs.getString("bg1",    "#13161c"), "#13161c")
        val bg2Color    = parseColor(prefs.getString("bg2",    "#1a1e27"), "#1a1e27")
        val accentColor = parseColor(prefs.getString("accent", "#4ade80"), "#4ade80")
        val textColor   = parseColor(prefs.getString("text",   "#e8ecf2"), "#e8ecf2")
        val text2Color  = parseColor(prefs.getString("text2",  "#8892a4"), "#8892a4")
        val text3Color  = parseColor(prefs.getString("text3",  "#4a5568"), "#4a5568")
        val tagline     = prefs.getString("tagline", "BEST YEARS AHEAD") ?: "BEST YEARS AHEAD"
        val weather     = prefs.getString("weather", "") ?: ""
        val datesJson   = prefs.getString("dates", "[]") ?: "[]"
        val widgetsJson = prefs.getString("widgets", "[\"clock\",\"battery\",\"milestone\",\"anniversary\",\"birthday\",\"weather\"]") ?: "[\"clock\",\"battery\",\"milestone\",\"anniversary\",\"birthday\",\"weather\"]"
        val fontId      = prefs.getString("font_id", "stencil") ?: "stencil"
        val fontSettingsJson = prefs.getString("font_settings", "") ?: ""
        val fontSettingsMap  = parseFontSettings(fontSettingsJson)
        setContentView(buildOverlayView(variant, bgColor, bg1Color, bg2Color,
            textColor, text2Color, text3Color, accentColor, tagline, weather, datesJson, widgetsJson, wallpaper, wallpaperFilter, fontId, fontSettingsMap))
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
        batteryTexts.forEach { it.text = "$batteryLevel%" }
        batteryBoltTexts.forEach { it.text = if (isCharging) " ⚡" else "" }
        val batteryPillStr = "BATTERY $batteryLevel%${if (isCharging) " ⚡" else ""}"
        batteryPillViews.forEach { it.text = batteryPillStr }
        bottomChargingIconView?.text = if (isCharging) "⚡ $batteryLevel%" else "$batteryLevel%"
        batteryFillViews.forEach { fill ->
            val lp = fill.layoutParams as FrameLayout.LayoutParams
            lp.width = (batteryLevel * (dp(80) - dp(4)) / 100)
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
        batteryBoltTexts.clear()
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
                
                val daysUntilNext = TimeUnit.MILLISECONDS.toDays(next.timeInMillis - now.timeInMillis).toInt()

                val originalDateStr = SimpleDateFormat("MMM d, yyyy", Locale.getDefault()).format(cal.time)
                result.add(DateEntry(label, type, icon, daysSince, years, months, daysRemainder, daysUntilNext, nextMonths, nextDays, originalDateStr))
            }
        } catch (e: Exception) { Log.e("LockscreenActivity", "parseDatesJson: ${e.message}") }
        return result
    }

    // ── Main UI builder ───────────────────────────────────────────────────────

    private fun loadClockTypeface(fontId: String): Typeface {
        val assetFile = when (fontId) {
            "mono"     -> "fonts/SpaceMono_700Bold.ttf"
            "modern"   -> "fonts/SpaceGrotesk_700Bold.ttf"
            "bebas"    -> "fonts/BebasNeue_400Regular.ttf"
            "orbitron" -> "fonts/Orbitron_700Bold.ttf"
            "playfair" -> "fonts/PlayfairDisplay_700Bold.ttf"
            "raleway"  -> "fonts/Raleway_300Light.ttf"
            "josefin"  -> "fonts/JosefinSans_600SemiBold.ttf"
            else       -> "fonts/SirinStencil_400Regular.ttf"
        }
        return try {
            Typeface.createFromAsset(assets, assetFile)
        } catch (_: Exception) {
            Typeface.create("sans-serif-condensed", Typeface.BOLD)
        }
    }

    data class FontCategorySetting(val fontId: String = "modern", val sizeOffset: Int = 0)

    private fun parseFontSettings(json: String): Map<String, FontCategorySetting> {
        val result = mutableMapOf<String, FontCategorySetting>()
        if (json.isEmpty()) return result
        try {
            val obj = org.json.JSONObject(json)
            for (key in listOf("clock", "birthday", "anniversary", "milestone", "others")) {
                if (obj.has(key)) {
                    val cat = obj.getJSONObject(key)
                    result[key] = FontCategorySetting(
                        fontId = cat.optString("fontId", "modern"),
                        sizeOffset = cat.optInt("sizeOffset", 0)
                    )
                }
            }
        } catch (e: Exception) {
            Log.e("LockscreenActivity", "parseFontSettings: ${e.message}")
        }
        return result
    }

    private fun buildOverlayView(
        variant: String, bgColor: Int, bg1Color: Int, bg2Color: Int,
        textColor: Int, text2Color: Int, text3Color: Int,
        accentColor: Int, tagline: String, weather: String, datesJson: String, widgetsJson: String,
        wallpaper: String, wallpaperFilter: String = "original", fontId: String = "stencil",
        fontSettingsMap: Map<String, FontCategorySetting> = emptyMap()
    ): View {
        val enabledWidgets = mutableSetOf<String>()
        try {
            val arr = JSONArray(widgetsJson)
            for (i in 0 until arr.length()) enabledWidgets.add(arr.getString(i))
        } catch (_: Exception) {
            enabledWidgets.addAll(listOf("clock", "battery", "milestone", "anniversary", "birthday", "weather"))
        }

        // Per-category fonts
        val bdSetting  = fontSettingsMap["birthday"]  ?: FontCategorySetting()
        val annSetting = fontSettingsMap["anniversary"] ?: FontCategorySetting()
        val msSetting  = fontSettingsMap["milestone"] ?: FontCategorySetting()
        val otSetting  = fontSettingsMap["others"]    ?: FontCategorySetting()
        val bdTypeface  = loadClockTypeface(bdSetting.fontId)
        val annTypeface = loadClockTypeface(annSetting.fontId)
        val msTypeface  = loadClockTypeface(msSetting.fontId)
        val otTypeface  = loadClockTypeface(otSetting.fontId)

        val ctx = this
        val MP  = ViewGroup.LayoutParams.MATCH_PARENT
        val WC  = ViewGroup.LayoutParams.WRAP_CONTENT

        val density = resources.displayMetrics.density
        val root = FrameLayout(ctx).apply {
            isClickable = true; isFocusable = true
        }

        val isCustomUri = wallpaper.startsWith("file://") || wallpaper.startsWith("content://") || wallpaper.startsWith("/")
        val resId = if (!isCustomUri) resources.getIdentifier(wallpaper, "drawable", packageName) else 0

        val isLight = variant == "warmLight" || variant == "softSage"
        when {
            resId != 0 -> {
                root.addView(ImageView(ctx).apply {
                    setImageResource(resId)
                    scaleType = ImageView.ScaleType.CENTER_CROP
                    layoutParams = FrameLayout.LayoutParams(MP, MP)
                })
                root.addView(View(ctx).apply {
                    setBackgroundColor(if (isLight) Color.argb(30, 255, 255, 255) else Color.argb(120, 0, 0, 0))
                    layoutParams = FrameLayout.LayoutParams(MP, MP)
                })
                            }
            isCustomUri -> {
                // Add placeholder immediately so overlay appears without blocking main thread
                val wallpaperIv = ImageView(ctx).apply {
                    scaleType = ImageView.ScaleType.CENTER_CROP
                    layoutParams = FrameLayout.LayoutParams(MP, MP)
                    setBackgroundColor(bgColor)
                }
                root.addView(wallpaperIv)
                val dimView = View(ctx).apply {
                    setBackgroundColor(if (isLight) Color.argb(30, 255, 255, 255) else Color.argb(100, 0, 0, 0))
                    layoutParams = FrameLayout.LayoutParams(MP, MP)
                }
                root.addView(dimView)
                filterOverlayColor(wallpaperFilter)?.let { (color, opacity) ->
                    root.addView(View(ctx).apply {
                        val alpha = (opacity * 255).toInt()
                        setBackgroundColor(Color.argb(alpha, Color.red(color), Color.green(color), Color.blue(color)))
                        layoutParams = FrameLayout.LayoutParams(MP, MP)
                    })
                }
                // Decode bitmap on background thread — no main-thread stall
                val capturedUri = wallpaper
                Thread {
                    val bmp = loadBitmapFromUri(capturedUri)
                    if (bmp != null) {
                        handler.post { wallpaperIv.setImageBitmap(bmp) }
                    }
                }.start()
            }
            else -> {
                root.background = GradientDrawable(GradientDrawable.Orientation.TL_BR, intArrayOf(bgColor, bg1Color, bg2Color))
                            }
        }

        batteryTexts.clear()
        batteryFillViews.clear()
        val sh = resources.displayMetrics.heightPixels
        val screenHeightDp = sh / density
        val scale = (screenHeightDp / 850f).coerceIn(0.7f, 1.0f)
        fun dpScale(v: Int) = (v * density * scale).toInt()

        val scroll = ScrollView(ctx).apply {
            layoutParams = FrameLayout.LayoutParams(MP, MP)
            setPadding(0, dpScale(52), 0, dpScale(60))
            isVerticalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
        }
        val content = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(MP, WC)
        }



        // Tagline & Clock
        if (enabledWidgets.contains("clock")) {
            val dateFmt = SimpleDateFormat("EEE MM-dd", Locale.getDefault())
            content.addView(TextView(ctx).apply {
                text = "${dateFmt.format(Date()).uppercase()} ▼ $tagline ▼"
                setTextColor(textColor); textSize = (10f + otSetting.sizeOffset) * scale; letterSpacing = 0.15f
                gravity = Gravity.CENTER
                if (otTypeface != null) setTypeface(otTypeface, Typeface.BOLD) else setTypeface(typeface, Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dpScale(2) }
            })

            val clockContainer = LinearLayout(ctx).apply {
                orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_HORIZONTAL or Gravity.BOTTOM
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dpScale(20) }
                
                val clockSetting = fontSettingsMap["clock"]
                val clockFontId = clockSetting?.fontId ?: fontId
                val clockSizeOff = clockSetting?.sizeOffset ?: 0
                val clockTypeface = loadClockTypeface(clockFontId)
                // Hour:Minute
                addView(TextView(ctx).apply {
                    text = SimpleDateFormat("h:mm", Locale.getDefault()).format(Date())
                    setTextColor(textColor); textSize = (78f + clockSizeOff) * scale
                    typeface = clockTypeface
                    gravity = Gravity.CENTER
                    letterSpacing = 0.02f
                    layoutParams = LinearLayout.LayoutParams(WC, WC)
                }.also { clockTextView = it })

                // AM/PM
                addView(TextView(ctx).apply {
                    text = SimpleDateFormat("a", Locale.getDefault()).format(Date())
                    setTextColor(textColor); textSize = (18f + clockSizeOff) * scale; alpha = 0.8f
                    typeface = clockTypeface
                    layoutParams = LinearLayout.LayoutParams(WC, WC).apply { 
                        marginStart = dpScale(4); bottomMargin = dpScale(12) 
                    }
                })
            }
            content.addView(clockContainer)
        }

        // Date carousels
        val dates         = parseDatesJson(datesJson)
        val birthdays     = dates.filter { it.type == "birthday" }
        val anniversaries = dates.filter { it.type == "anniversary" }
        val milestones    = dates.filter { it.type == "milestone" }

        if (enabledWidgets.contains("birthday") && birthdays.isNotEmpty())
            content.addView(buildCarousel(
                birthdays.mapIndexed { i, it -> buildBirthdayCard(ctx, it, accentColor, bg1Color, textColor, text2Color, text3Color, variant, i == 0, bdTypeface, bdSetting.sizeOffset) },
                sizeOffset = bdSetting.sizeOffset
            ))

        if (enabledWidgets.contains("anniversary") && anniversaries.isNotEmpty())
            content.addView(buildCarousel(
                anniversaries.mapIndexed { i, it -> buildAnniversaryCard(ctx, it, accentColor, bg1Color, textColor, text3Color, variant, i == 0, annTypeface, annSetting.sizeOffset) },
                narrow = false,
                sizeOffset = annSetting.sizeOffset
            ))

        if (enabledWidgets.contains("milestone") && milestones.isNotEmpty())
            content.addView(buildCarousel(
                milestones.mapIndexed { i, it -> buildMilestoneCard(ctx, it, accentColor, bg1Color, textColor, text2Color, text3Color, variant, i == 0, msTypeface, msSetting.sizeOffset) },
                sizeOffset = msSetting.sizeOffset
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
                    bottomMargin = dpScale(16); marginStart = dpScale(20); marginEnd = dpScale(20)
                }
            }
            col.addView(TextView(ctx).apply {
                text = "UPCOMING EVENTS"; setTextColor(text2Color); textSize = (11f + otSetting.sizeOffset) * scale; letterSpacing = 0.05f
                if (otTypeface != null) setTypeface(otTypeface, Typeface.BOLD) else setTypeface(typeface, Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dpScale(10) }
            })
            upcoming.forEach { d ->
                val emoji = if (d.type == "birthday") "🎂" else "💍"
                val tFace = if (d.type == "birthday") bdTypeface else annTypeface
                val sOff  = if (d.type == "birthday") bdSetting.sizeOffset else annSetting.sizeOffset
                col.addView(buildPill(ctx, "${d.label}: ${d.daysUntilNext} Days $emoji", textColor, variant, bg1Color, tFace, sOff).apply {
                    (layoutParams as LinearLayout.LayoutParams).bottomMargin = dpScale(6)
                })
            }
            content.addView(col)
        }

        // Quote
        val quotes = arrayOf("Every day counts.", "Time reveals what matters.",
            "The present is a gift.", "Growth takes patience.", "Moments become memories.")
        content.addView(TextView(ctx).apply {
            text = "\"${quotes[Calendar.getInstance().get(Calendar.DAY_OF_YEAR) % quotes.size]}\""
            setTextColor(text3Color); textSize = (13f + otSetting.sizeOffset) * scale; gravity = Gravity.CENTER
            if (otTypeface != null) setTypeface(otTypeface, Typeface.ITALIC) else setTypeface(typeface, Typeface.ITALIC)
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply {
                topMargin = dpScale(4); bottomMargin = dpScale(20)
                marginStart = dpScale(20); marginEnd = dpScale(20)
            }
        })

        // Pills
        val pillsCol = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply {
                bottomMargin = dpScale(16); marginStart = dpScale(20); marginEnd = dpScale(20)
            }
        }
        val dayOfWeek = SimpleDateFormat("EEEE", Locale.getDefault()).format(Date()).uppercase()
        val todayStr = "TODAY, $dayOfWeek"
        pillsCol.addView(buildPill(ctx, todayStr, textColor, variant, bg1Color, otTypeface, otSetting.sizeOffset).apply {
            (layoutParams as LinearLayout.LayoutParams).bottomMargin = dpScale(8)
        })
        if (enabledWidgets.contains("weather") && weather.isNotEmpty()) 
            pillsCol.addView(buildPill(ctx, weather, textColor, variant, bg1Color, otTypeface, otSetting.sizeOffset))
        content.addView(pillsCol)

        // Unlock slider
        content.addView(LinearLayout(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply {
                marginStart = dpScale(20); marginEnd = dpScale(20)
            }
            addView(buildUnlockSlider(ctx, accentColor, text3Color, variant, otTypeface, otSetting.sizeOffset))
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

    private fun buildCarousel(cards: List<View>, narrow: Boolean = false, sizeOffset: Int = 0): View {
        val MP  = ViewGroup.LayoutParams.MATCH_PARENT
        val WC  = ViewGroup.LayoutParams.WRAP_CONTENT
        val screenW = resources.displayMetrics.widthPixels
        val sidePad = dp(20)
        val gap     = dp(12)
        val density = resources.displayMetrics.density
        // narrow = show 2 per view (anniversary circles); wide = single card with peek
        val cardW = if (narrow) {
            (screenW - sidePad * 2 - gap) / 2
        } else {
            val baseW = dp(260) + (sizeOffset * 8 * density).toInt()
            minOf(baseW, screenW - sidePad * 2 - dp(12))
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

    private fun cardBackground(bg1Color: Int, highlightColor: Int? = null, isLight: Boolean = false): LayerDrawable {
        val r = Color.red(bg1Color); val g = Color.green(bg1Color); val b = Color.blue(bg1Color)
        val grad = GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            intArrayOf(Color.argb(55, r, g, b), Color.argb(35, r, g, b))
        ).apply { cornerRadius = dp(20).toFloat() }

        val border = GradientDrawable().apply {
            setColor(Color.TRANSPARENT)
            cornerRadius = dp(20).toFloat()
            val strokeAlpha = if (isLight) 30 else 45
            val sc = if (isLight) Color.argb(strokeAlpha, 0, 0, 0) else Color.argb(strokeAlpha, 255, 255, 255)
            setStroke(dp(1), sc)
        }
        return LayerDrawable(arrayOf(grad, border))
    }

    private fun buildBirthdayCard(
        ctx: Context, bd: DateEntry,
        accentColor: Int, bg1Color: Int,
        textColor: Int, text2Color: Int, text3Color: Int,
        variant: String,
        isHighlighted: Boolean = false,
        catTypeface: Typeface? = null,
        catSizeOffset: Int = 0
    ): View {
        val MP = ViewGroup.LayoutParams.MATCH_PARENT
        val WC = ViewGroup.LayoutParams.WRAP_CONTENT
        
        val scaledOffset = catSizeOffset.toFloat()
        val density = resources.displayMetrics.density
        val svgW = dp(150) + (scaledOffset * 10 * density).toInt()
        val svgH = dp(60) + (scaledOffset * 4 * density).toInt()

        val root = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(14), dp(14), dp(14))
            background = cardBackground(bg1Color, if (isHighlighted) accentColor else null, variant == "warmLight" || variant == "softSage")
        }

        // Top Row: Icon on left, Label on right
        val header = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(12) }
        }

        // Icon Bubble
        val ar = Color.red(accentColor); val ag = Color.green(accentColor); val ab = Color.blue(accentColor)
        val bubble = FrameLayout(ctx).apply {
            val size = dp(34)
            layoutParams = LinearLayout.LayoutParams(size, size).apply { marginEnd = dp(10) }
            background = GradientDrawable().apply {
                setColor(Color.argb(35, ar, ag, ab))
                cornerRadius = size / 2f
                setStroke(dp(1), Color.argb(65, ar, ag, ab))
            }
            addView(TextView(ctx).apply {
                text = "🎂"
                textSize = 14f
                gravity = Gravity.CENTER
                layoutParams = FrameLayout.LayoutParams(MP, MP)
            })
        }
        header.addView(bubble)

        val titleCol = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, WC, 1f)
        }
        titleCol.addView(TextView(ctx).apply {
            text = bd.label
            setTextColor(textColor); textSize = 13.5f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface else setTypeface(typeface, Typeface.BOLD)
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
        })
        titleCol.addView(TextView(ctx).apply {
            text = "Age: ${bd.years}y ${bd.months}m ${bd.daysRemainder}d"
            setTextColor(text2Color); textSize = 11f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface
        })
        header.addView(titleCol)
        root.addView(header)

        // Center Semi-Circular Gauge Arc
        val progress = (365f - (bd.daysUntilNext?.toFloat() ?: 0f)) / 365f
        val gaugeContainer = FrameLayout(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(MP, svgH).apply { topMargin = dp(4) }
        }
        
        class SemiCircleGauge(context: Context) : View(context) {
            override fun onDraw(canvas: Canvas) {
                val strokeW = 4f * density
                val r = height - strokeW - (8f * density)
                val cx = width / 2f
                val cy = height - strokeW - (2f * density)
                
                val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    style = Paint.Style.STROKE; strokeWidth = strokeW
                    color = Color.argb(20, 255, 255, 255); strokeCap = Paint.Cap.ROUND
                }
                val fgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    style = Paint.Style.STROKE; strokeWidth = strokeW
                    color = accentColor; strokeCap = Paint.Cap.ROUND
                }
                val dotPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    style = Paint.Style.FILL; color = Color.WHITE
                }

                val rect = RectF(cx - r, cy - r, cx + r, cy + r)
                canvas.drawArc(rect, 180f, 180f, false, bgPaint)
                val sweep = progress * 180f
                canvas.drawArc(rect, 180f, sweep, false, fgPaint)
                
                val theta = Math.PI - (progress * Math.PI)
                val dotX = cx + r * Math.cos(theta)
                val dotY = cy - r * Math.sin(theta)
                canvas.drawCircle(dotX.toFloat(), dotY.toFloat(), 3f * density, dotPaint)
            }
        }

        val gaugeView = SemiCircleGauge(ctx).apply {
            layoutParams = FrameLayout.LayoutParams(svgW, svgH).apply { gravity = Gravity.CENTER }
        }
        gaugeContainer.addView(gaugeView)

        val textOverlay = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            layoutParams = FrameLayout.LayoutParams(MP, WC).apply { gravity = Gravity.BOTTOM; bottomMargin = dp(1) }
        }
        textOverlay.addView(TextView(ctx).apply {
            text = "${bd.daysUntilNext ?: 0} Days"
            setTextColor(textColor); textSize = 14f + (catSizeOffset * 0.7f)
            gravity = Gravity.CENTER
            if (catTypeface != null) typeface = catTypeface else setTypeface(typeface, Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(MP, WC)
        })
        textOverlay.addView(TextView(ctx).apply {
            text = "Next Birthday"
            setTextColor(text3Color); textSize = 8f + (catSizeOffset * 0.5f)
            gravity = Gravity.CENTER
            if (catTypeface != null) typeface = catTypeface
            layoutParams = LinearLayout.LayoutParams(MP, WC)
        })
        gaugeContainer.addView(textOverlay)
        root.addView(gaugeContainer)

        return root
    }

    private fun buildAnniversaryCard(
        ctx: Context, ann: DateEntry,
        accentColor: Int, bg1Color: Int,
        textColor: Int, text3Color: Int,
        variant: String,
        isHighlighted: Boolean = false,
        catTypeface: Typeface? = null,
        catSizeOffset: Int = 0
    ): View {
        val MP = ViewGroup.LayoutParams.MATCH_PARENT
        val WC = ViewGroup.LayoutParams.WRAP_CONTENT
        
        val scaledOffset = catSizeOffset.toFloat()
        val density = resources.displayMetrics.density
        val ringSize = dp(54) + (scaledOffset * 2 * density).toInt()

        val root = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(14), dp(14), dp(14))
            background = cardBackground(bg1Color, if (isHighlighted) accentColor else null, variant == "warmLight" || variant == "softSage")
        }

        val sublabel = if (ann.years >= 1) "${ann.years}y" else "${ann.daysSince}d"
        val prog = (ann.daysSince % 365).toFloat() / 365f

        // Progress ring on left
        val ring = buildCircleRing(ctx, ringSize, prog, accentColor, sublabel, "", textColor, catTypeface, catSizeOffset).apply {
            layoutParams = LinearLayout.LayoutParams(WC, WC).apply { marginEnd = dp(14) }
        }
        root.addView(ring)

        // Text details on right
        val details = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, WC, 1f)
        }
        details.addView(TextView(ctx).apply {
            text = ann.label
            setTextColor(textColor); textSize = 13.5f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface else setTypeface(typeface, Typeface.BOLD)
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
        })
        details.addView(TextView(ctx).apply {
            text = "Since ${ann.originalDateStr}"
            setTextColor(text3Color); textSize = 10f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply { topMargin = dp(2) }
        })
        ann.daysUntilNext?.let { until ->
            details.addView(TextView(ctx).apply {
                text = "Next: ${ann.nextMonths}m ${ann.nextDays}d ($until d)"
                setTextColor(text3Color); textSize = 9.5f + catSizeOffset
                if (catTypeface != null) typeface = catTypeface
                layoutParams = LinearLayout.LayoutParams(MP, WC).apply { topMargin = dp(2) }
            })
        }
        root.addView(details)

        return root
    }

    private fun buildMilestoneCard(
        ctx: Context, ms: DateEntry,
        accentColor: Int, bg1Color: Int,
        textColor: Int, text2Color: Int, text3Color: Int,
        variant: String,
        isHighlighted: Boolean = false,
        catTypeface: Typeface? = null,
        catSizeOffset: Int = 0
    ): View {
        val MP   = ViewGroup.LayoutParams.MATCH_PARENT
        val WC   = ViewGroup.LayoutParams.WRAP_CONTENT
        val prog = (ms.daysSince % 365).toFloat() / 365f
        val percent = (prog * 100).toInt().coerceIn(0, 100)

        val scaledOffset = catSizeOffset.toFloat()
        val density = resources.displayMetrics.density
        val barWidth = dp(110) + (scaledOffset * 4 * density).toInt()

        val root = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(14), dp(14), dp(14))
            background = cardBackground(bg1Color, if (isHighlighted) accentColor else null, variant == "warmLight" || variant == "softSage")
        }

        // Top Row: Icon on left, Label on right
        val topRow = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply { bottomMargin = dp(12) }
        }

        // Icon Bubble
        val ar = Color.red(accentColor); val ag = Color.green(accentColor); val ab = Color.blue(accentColor)
        val bubble = FrameLayout(ctx).apply {
            val size = dp(34)
            layoutParams = LinearLayout.LayoutParams(size, size)
            background = GradientDrawable().apply {
                setColor(Color.argb(35, ar, ag, ab))
                cornerRadius = size / 2f
                setStroke(dp(1), Color.argb(65, ar, ag, ab))
            }
            addView(TextView(ctx).apply {
                text = "⭐"
                textSize = 14f
                gravity = Gravity.CENTER
                layoutParams = FrameLayout.LayoutParams(MP, MP)
            })
        }
        topRow.addView(bubble)

        topRow.addView(TextView(ctx).apply {
            text = ms.label
            setTextColor(textColor); textSize = 13f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface else setTypeface(typeface, Typeface.BOLD)
            gravity = Gravity.END
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
            layoutParams = LinearLayout.LayoutParams(0, WC, 1f)
        })
        root.addView(topRow)

        // Bottom Row: Stat on left, Progress bar on right
        val bottomRow = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.BOTTOM
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply { topMargin = dp(4) }
        }

        // Left Column (Days)
        val leftCol = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, WC, 1f)
        }
        leftCol.addView(TextView(ctx).apply {
            text = "%,d".format(ms.daysSince)
            setTextColor(textColor); textSize = 22f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface else setTypeface(typeface, Typeface.BOLD)
        })
        leftCol.addView(TextView(ctx).apply {
            text = "Days Ago"
            setTextColor(text2Color); textSize = 11f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply { topMargin = dp(1) }
        })
        bottomRow.addView(leftCol)

        // Right Column (Progress)
        val rightCol = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(barWidth, WC)
        }

        // Slim Progress Bar
        val progressBar = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(MP, dp(5)).apply { bottomMargin = dp(4) }
            addView(View(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(0, MP, prog).apply { marginEnd = dp(1) }
                background = GradientDrawable().apply { setColor(accentColor); cornerRadius = 2.5f * density }
            })
            addView(View(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(0, MP, 1f - prog)
                background = GradientDrawable().apply {
                    setColor(Color.argb(20, 255, 255, 255)); cornerRadius = 2.5f * density
                }
            })
        }
        rightCol.addView(progressBar)

        rightCol.addView(TextView(ctx).apply {
            text = "Annual Cycle: $percent%"
            setTextColor(text3Color); textSize = 8.5f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface
            gravity = Gravity.END
        })
        rightCol.addView(TextView(ctx).apply {
            text = "${ms.nextMonths}m ${ms.nextDays}d left"
            setTextColor(text3Color); textSize = 8.5f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface
            gravity = Gravity.END
        })
        bottomRow.addView(rightCol)
        root.addView(bottomRow)

        return root
    }

    // ── Widgets ───────────────────────────────────────────────────────────────

    private fun buildCircleRing(
        ctx: Context, sizePx: Int, progress: Float,
        accentColor: Int, centerText: String, label: String, textColor: Int,
        catTypeface: Typeface? = null, catSizeOffset: Int = 0
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
            textSize = sizePx * 0.20f + (catSizeOffset * 1.5f)
            if (catTypeface != null) typeface = catTypeface else typeface = Typeface.create("sans-serif", Typeface.BOLD)
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
            text = "♥"
            setTextColor(accentColor)
            textSize = 10f + catSizeOffset
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(2) }
        })
        container.addView(TextView(ctx).apply {
            text = label
            setTextColor(Color.argb(160, Color.red(textColor), Color.green(textColor), Color.blue(textColor)))
            textSize = 9f + catSizeOffset; gravity = Gravity.CENTER
            if (catTypeface != null) typeface = catTypeface
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(3) }
        })
        return container
    }

    private fun buildUnlockSlider(ctx: Context, accentColor: Int, text3Color: Int, variant: String, catTypeface: Typeface? = null, catSizeOffset: Int = 0): View {
        val MP = ViewGroup.LayoutParams.MATCH_PARENT
        val WC = ViewGroup.LayoutParams.WRAP_CONTENT
        return LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(MP, WC).apply { topMargin = dp(12); bottomMargin = dp(12) }
            addView(View(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(0, dp(1), 1f)
                val isLight = variant == "warmLight" || variant == "softSage"
                setBackgroundColor(if (isLight) Color.argb(60, 0, 0, 0) else Color.argb(120, 255, 255, 255))
            })
            addView(FrameLayout(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(dp(80), dp(36)).apply { marginStart = dp(8) }
                background = GradientDrawable().apply {
                    setColor(Color.argb(80, 0, 0, 0))
                    setStroke(dp(1), Color.argb(100, 255, 255, 255))
                    cornerRadius = dp(8).toFloat()
                }
                val fill = View(ctx).apply {
                    layoutParams = FrameLayout.LayoutParams(
                        (batteryLevel * (dp(80) - dp(4)) / 100), dp(32)
                    ).apply { gravity = Gravity.START or Gravity.CENTER_VERTICAL; marginStart = dp(2) }
                    background = GradientDrawable().apply { setColor(accentColor); cornerRadius = dp(6).toFloat() }
                }
                batteryFillViews.add(fill)
                addView(fill)
                addView(TextView(ctx).apply {
                    text = if (isCharging) "⚡ $batteryLevel%" else "$batteryLevel%"
                    setTextColor(Color.WHITE); gravity = Gravity.CENTER; textSize = 12f + catSizeOffset
                    if (catTypeface != null) typeface = catTypeface else setTypeface(typeface, Typeface.BOLD)
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

    private fun buildPill(ctx: Context, textStr: String, textColor: Int, variant: String, bg1Color: Int, catTypeface: Typeface? = null, catSizeOffset: Int = 0): View =
        TextView(ctx).apply {
            text = textStr; setTextColor(textColor); textSize = 10f + catSizeOffset
            if (catTypeface != null) typeface = catTypeface else setTypeface(typeface, Typeface.BOLD)
            setPadding(dp(12), dp(6), dp(12), dp(6))
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            val isLight = variant == "warmLight" || variant == "softSage"
            if (isLight) {
                background = cardBackground(bg1Color, null, true)
            } else {
                background = GradientDrawable().apply {
                    setColor(Color.argb(100, 0, 0, 0))
                    cornerRadius = dp(16).toFloat()
                    setStroke(dp(1), Color.argb(60, 255, 255, 255))
                }
            }
        }

    private fun buildBatteryWidget(ctx: Context, accentColor: Int, catTypeface: Typeface? = null, catSizeOffset: Int = 0): View {
        val WC = ViewGroup.LayoutParams.WRAP_CONTENT
        return LinearLayout(ctx).apply {
            layoutParams = LinearLayout.LayoutParams(WC, WC)
            orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL
            
            addView(TextView(ctx).apply {
                text = "$batteryLevel%"
                setTextColor(Color.WHITE); textSize = 11f + catSizeOffset
                if (catTypeface != null) typeface = catTypeface else setTypeface(typeface, Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(WC, WC)
            }.also { batteryTexts.add(it) })
            
            addView(TextView(ctx).apply {
                text = if (isCharging) " ⚡" else ""
                setTextColor(accentColor); textSize = 11f; setTypeface(typeface, Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(WC, WC)
            }.also { batteryBoltTexts.add(it) })
        }
    }


    private fun loadBitmapFromUri(uri: String): Bitmap? {
        return try {
            val sw = resources.displayMetrics.widthPixels
            val sh = resources.displayMetrics.heightPixels
            when {
                uri.startsWith("file://") -> {
                    val path = uri.removePrefix("file://")
                    val opts = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                    BitmapFactory.decodeFile(path, opts)
                    opts.inSampleSize = calcSampleSize(opts, sw, sh)
                    opts.inJustDecodeBounds = false
                    BitmapFactory.decodeFile(path, opts)
                }
                uri.startsWith("content://") -> {
                    contentResolver.openInputStream(Uri.parse(uri))?.use { BitmapFactory.decodeStream(it) }
                }
                else -> {
                    val opts = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                    BitmapFactory.decodeFile(uri, opts)
                    opts.inSampleSize = calcSampleSize(opts, sw, sh)
                    opts.inJustDecodeBounds = false
                    BitmapFactory.decodeFile(uri, opts)
                }
            }
        } catch (e: Exception) {
            Log.e("LockscreenActivity", "loadBitmapFromUri failed: ${e.message}")
            null
        }
    }

    private fun calcSampleSize(opts: BitmapFactory.Options, reqW: Int, reqH: Int): Int {
        val h = opts.outHeight; val w = opts.outWidth
        var sample = 1
        if (h > reqH || w > reqW) {
            val halfH = h / 2; val halfW = w / 2
            while (halfH / sample >= reqH && halfW / sample >= reqW) sample *= 2
        }
        return sample
    }

    private fun filterOverlayColor(filterId: String): Pair<Int, Float>? = when (filterId) {
        "warm"   -> Color.parseColor("#FF8C42") to 0.22f
        "cool"   -> Color.parseColor("#3B82F6") to 0.22f
        "dusk"   -> Color.parseColor("#7C3AED") to 0.28f
        "mono"   -> Color.parseColor("#1F2937") to 0.65f
        "forest" -> Color.parseColor("#15803D") to 0.28f
        "ocean"  -> Color.parseColor("#0369A1") to 0.28f
        "night"  -> Color.parseColor("#030712") to 0.55f
        "golden" -> Color.parseColor("#D97706") to 0.28f
        "rose"   -> Color.parseColor("#BE185D") to 0.22f
        else     -> null
    }

    private fun parseColor(hex: String?, fallback: String): Int =
        try { Color.parseColor(hex) } catch (_: Exception) { Color.parseColor(fallback) }
}
