package com.spendly10.app;

import android.app.Notification;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

// Captures payment-app notifications (push/RCS-style alerts the SMS inbox
// never sees). System-bound and event-driven: no polling, no battery cost.
// Anything captured still goes through the same JS parser + human review.
public class SpendlyNotificationService extends NotificationListenerService {

    static final String PREFS = "spendly-notify-queue";
    static final String KEY_ITEMS = "items";
    static final int MAX_ITEMS = 200;

    // Curated payment/bank apps. Bank SMS covers everything else, so this
    // stays short on purpose — unknown apps fall back to the SMS path.
    static final Set<String> TRACKED_PACKAGES = new HashSet<>(Arrays.asList(
        "com.google.android.apps.nbu.paisa.user", // GPay
        "com.phonepe.app",
        "net.one97.paytm",
        "in.org.npci.upiapp", // BHIM
        "com.snapwork.hdfc", // HDFC Bank
        "com.icicibank.mobilebanking", // iMobile
        "com.sbi.SBIFreedomPlus", // YONO
        "com.axis.mobile", // Axis
        "com.kotak.mobilebanking" // Kotak
    ));

    // Same direction keywords as the SMS pre-filter — recall only; the JS
    // parser still requires amount + signal and rejects OTP/promo.
    static final String[] KEYWORDS = {
        "debited", "credited", "spent", "paid",
        "received", "purchase", "withdrawn", "refund", "landed",
        "transaction", "balance", "transfer", "payment", "upi"
    };

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String pkg = sbn.getPackageName();
        if (pkg == null || !TRACKED_PACKAGES.contains(pkg)) return;
        if (sbn.getNotification() == null) return;
        Bundle extras = sbn.getNotification().extras;
        if (extras == null) return;

        CharSequence titleCs = extras.getCharSequence(Notification.EXTRA_TITLE);
        CharSequence textCs = extras.getCharSequence(Notification.EXTRA_TEXT);
        String text = (titleCs != null ? titleCs.toString() + "\n" : "")
            + (textCs != null ? textCs.toString() : "");
        text = text.trim();
        if (text.isEmpty() || !containsKeyword(text)) return;

        enqueue(this, pkg, appLabel(pkg), text, sbn.getPostTime());
    }

    private static boolean containsKeyword(String text) {
        String lower = text.toLowerCase();
        for (String k : KEYWORDS) {
            if (lower.contains(k)) return true;
        }
        return false;
    }

    private String appLabel(String pkg) {
        try {
            PackageManager pm = getPackageManager();
            ApplicationInfo info = pm.getApplicationInfo(pkg, 0);
            CharSequence label = pm.getApplicationLabel(info);
            return label != null ? label.toString() : pkg;
        } catch (Exception e) {
            return pkg;
        }
    }

    static synchronized void enqueue(Context context, String pkg, String app, String text, long time) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            JSONArray items;
            try {
                items = new JSONArray(prefs.getString(KEY_ITEMS, "[]"));
            } catch (Exception e) {
                items = new JSONArray();
            }
            JSONObject o = new JSONObject();
            o.put("pkg", pkg);
            o.put("app", app);
            o.put("text", text);
            o.put("time", time);
            items.put(o);
            while (items.length() > MAX_ITEMS) items.remove(0);
            prefs.edit().putString(KEY_ITEMS, items.toString()).apply();
        } catch (Exception ignored) {
            // queue write must never crash the listener
        }
    }

    // Reads and clears the queue in one call.
    static synchronized JSONArray takeQueue(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        JSONArray items;
        try {
            items = new JSONArray(prefs.getString(KEY_ITEMS, "[]"));
        } catch (Exception e) {
            items = new JSONArray();
        }
        prefs.edit().remove(KEY_ITEMS).apply();
        return items;
    }
}
