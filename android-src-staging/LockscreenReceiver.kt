package com.informatheme.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class LockscreenReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            "android.intent.action.LOCKED_BOOT_COMPLETED" -> {
                // Check if overlay was enabled before reboot
                val prefs = context.getSharedPreferences(
                    LockscreenService.PREFS_NAME, Context.MODE_PRIVATE
                )
                val enabled = prefs.getBoolean("overlay_enabled", false)
                if (enabled) {
                    startOverlayService(context)
                }
            }
        }
    }

    companion object {
        fun startOverlayService(context: Context) {
            val serviceIntent = Intent(context, LockscreenService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}
