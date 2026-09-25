const fs = require('fs');
const path = require('path');
const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');

const RECEIVER_CLASS = 'BootResumeReceiver';
const PACKAGE_NAME = 'net.naturlust.trailguide';

const RECEIVER_SOURCE = `package ${PACKAGE_NAME}

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.os.Build
import androidx.core.app.NotificationCompat
import java.io.File
import java.util.Locale

/**
 * Zeigt nach einem Geraete-Neustart eine Erinnerung, falls beim Herunterfahren
 * noch eine Aktivitaet lief - startet selbst KEIN Tracking und greift auf
 * keine Standortdaten zu, sondern liest nur den Status aus der lokalen
 * SQLite-Datenbank (read-only), um zu wissen, ob eine Erinnerung noetig ist.
 * Der Nutzer muss die App danach selbst wieder oeffnen, damit das Tracking
 * fortgesetzt wird - das haelt den Umfang der Boot-Berechtigung bewusst klein.
 */
class ${RECEIVER_CLASS} : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        if (!hasActiveHike(context)) return
        showResumeNotification(context)
    }

    private fun hasActiveHike(context: Context): Boolean {
        val dbFile = File(context.filesDir, "SQLite/naturlust_trail_guide.db")
        if (!dbFile.exists()) return false
        return try {
            SQLiteDatabase.openDatabase(dbFile.path, null, SQLiteDatabase.OPEN_READONLY).use { db ->
                db.rawQuery("SELECT COUNT(*) FROM hikes WHERE status = 'active'", null).use { cursor ->
                    cursor.moveToFirst() && cursor.getInt(0) > 0
                }
            }
        } catch (error: Exception) {
            false
        }
    }

    private fun showResumeNotification(context: Context) {
        val channelId = "ntg-boot-resume"
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Sicherheits-Hinweise", NotificationManager.IMPORTANCE_HIGH)
            manager.createNotificationChannel(channel)
        }

        val isGerman = Locale.getDefault().language == "de"
        val title = if (isGerman) "Aktivität läuft noch" else "Activity still running"
        val body = if (isGerman) {
            "Dein Gerät wurde neu gestartet. Öffne NaturlustTrailGuide wieder, um das Standort-Tracking fortzusetzen."
        } else {
            "Your device restarted. Open NaturlustTrailGuide again to resume location tracking."
        }

        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(context.applicationInfo.icon)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        manager.notify(1001, notification)
    }
}
`;

function withBootResumeReceiverManifest(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0];

    if (!application.receiver) {
      application.receiver = [];
    }

    const alreadyPresent = application.receiver.some(
      (entry) => entry.$ && entry.$['android:name'] === `.${RECEIVER_CLASS}`,
    );

    if (!alreadyPresent) {
      application.receiver.push({
        $: {
          'android:name': `.${RECEIVER_CLASS}`,
          'android:exported': 'true',
          'android:enabled': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } }],
          },
        ],
      });
    }

    return config;
  });
}

function withBootResumeReceiverSource(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const packagePath = PACKAGE_NAME.replace(/\./g, '/');
      const dir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        packagePath,
      );
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${RECEIVER_CLASS}.kt`), RECEIVER_SOURCE);
      return config;
    },
  ]);
}

function withBootResumeReceiver(config) {
  config = withBootResumeReceiverManifest(config);
  config = withBootResumeReceiverSource(config);
  return config;
}

module.exports = withBootResumeReceiver;
