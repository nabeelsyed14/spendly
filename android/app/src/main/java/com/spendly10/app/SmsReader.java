package com.spendly10.app;

import android.Manifest;
import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.Telephony;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(
    name = "SmsReader",
    permissions = @Permission(strings = { Manifest.permission.READ_SMS }, alias = "sms")
)
public class SmsReader extends Plugin {

    @PluginMethod
    public void hasPermission(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", getPermissionState("sms") == PermissionState.GRANTED);
        call.resolve(result);
    }

    @PluginMethod
    public void requestSmsPermission(PluginCall call) {
        requestPermissionForAlias("sms", call, "smsPermsCallback");
    }

    @PermissionCallback
    private void smsPermsCallback(PluginCall call) {
        if (getPermissionState("sms") == PermissionState.GRANTED) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        } else {
            call.reject("SMS permission denied");
        }
    }
    @PluginMethod
    public void readInbox(PluginCall call) {
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            call.reject("SMS permission not granted");
            return;
        }

        // Direction keywords only — sender IDs vary too much (numeric short
        // codes, new banks) to filter on. Extra recall words (transaction,
        // balance, ...) are safe: the JS parser still requires a real
        // debit/credit signal + amount and rejects OTP/promo, so false
        // positives never reach the review inbox.
        String[] keywords = {
            "debited", "credited", "spent", "paid",
            "received", "purchase", "withdrawn", "refund", "landed",
            "transaction", "balance", "transfer", "payment", "upi"
        };

        Long sinceObj = call.getLong("since");
        long since = sinceObj != null ? sinceObj : 0L;
        int limit = call.getInt("limit", 1500);

        StringBuilder selection = new StringBuilder("(");
        List<String> args = new ArrayList<>();
        for (int i = 0; i < keywords.length; i++) {
            if (i > 0) selection.append(" OR ");
            selection.append(Telephony.Sms.BODY).append(" LIKE ?");
            args.add("%" + keywords[i] + "%");
        }
        selection.append(") AND ").append(Telephony.Sms.DATE).append(" > ?");
        args.add(String.valueOf(since));

        JSArray messages = new JSArray();
        Cursor cursor = null;
        try {
            ContentResolver resolver = getContext().getContentResolver();
            Uri uri = Telephony.Sms.Inbox.CONTENT_URI;
            String[] projection = { Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE };
            cursor = resolver.query(
                uri, projection, selection.toString(),
                args.toArray(new String[0]), Telephony.Sms.DATE + " DESC");
            int count = 0;
            if (cursor != null) {
                int addressIdx = cursor.getColumnIndex(Telephony.Sms.ADDRESS);
                int bodyIdx = cursor.getColumnIndex(Telephony.Sms.BODY);
                int dateIdx = cursor.getColumnIndex(Telephony.Sms.DATE);
                while (cursor.moveToNext() && count < limit) {
                    JSObject msg = new JSObject();
                    msg.put("address", cursor.isNull(addressIdx) ? "" : cursor.getString(addressIdx));
                    msg.put("body", cursor.isNull(bodyIdx) ? "" : cursor.getString(bodyIdx));
                    msg.put("date", cursor.isNull(dateIdx) ? 0L : cursor.getLong(dateIdx));
                    messages.put(msg);
                    count++;
                }
            }
            JSObject result = new JSObject();
            result.put("messages", messages);
            result.put("inboxTotal", countInboxTotal(resolver));
            call.resolve(result);
        } catch (Exception e) {
            String reason = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            call.reject("Could not read SMS inbox: " + reason);
        } finally {
            if (cursor != null) cursor.close();
        }
    }

    // Total inbox rows, unfiltered — distinguishes "empty/RCS inbox" from
    // "filter matched nothing" when a scan comes back empty.
    private int countInboxTotal(ContentResolver resolver) {
        Cursor cursor = null;
        try {
            cursor = resolver.query(
                Telephony.Sms.Inbox.CONTENT_URI,
                new String[] { Telephony.Sms._ID },
                null, null, null);
            return cursor != null ? cursor.getCount() : -1;
        } catch (Exception e) {
            return -1;
        } finally {
            if (cursor != null) cursor.close();
        }
    }

    // Top sender addresses on this device so users can see what is actually
    // there (instead of guessing sender IDs). Most-recent 500, grouped here.
    @PluginMethod
    public void listSenders(PluginCall call) {
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            call.reject("SMS permission not granted");
            return;
        }
        int sample = call.getInt("limit", 500);
        java.util.Map<String, Integer> counts = new java.util.LinkedHashMap<>();
        java.util.Map<String, Integer> order = new java.util.LinkedHashMap<>();
        int seq = 0;
        Cursor cursor = null;
        try {
            ContentResolver resolver = getContext().getContentResolver();
            cursor = resolver.query(
                Telephony.Sms.Inbox.CONTENT_URI,
                new String[] { Telephony.Sms.ADDRESS },
                null, null, Telephony.Sms.DATE + " DESC");
            if (cursor != null) {
                int addressIdx = cursor.getColumnIndex(Telephony.Sms.ADDRESS);
                while (cursor.moveToNext() && seq < sample) {
                    String address = cursor.isNull(addressIdx) ? "" : cursor.getString(addressIdx);
                    counts.put(address, (counts.containsKey(address) ? counts.get(address) : 0) + 1);
                    if (!order.containsKey(address)) order.put(address, seq++);
                }
            }
            java.util.List<java.util.Map.Entry<String, Integer>> entries =
                new java.util.ArrayList<>(counts.entrySet());
            java.util.Collections.sort(entries, (a, b) -> {
                int cmp = b.getValue().compareTo(a.getValue());
                if (cmp != 0) return cmp;
                return order.get(a.getKey()).compareTo(order.get(b.getKey()));
            });
            JSArray senders = new JSArray();
            int shown = 0;
            for (java.util.Map.Entry<String, Integer> e : entries) {
                if (shown >= 20) break;
                JSObject o = new JSObject();
                o.put("address", e.getKey());
                o.put("count", e.getValue());
                senders.put(o);
                shown++;
            }
            JSObject result = new JSObject();
            result.put("senders", senders);
            result.put("inboxTotal", countInboxTotal(resolver));
            call.resolve(result);
        } catch (Exception e) {
            String reason = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            call.reject("Could not list senders: " + reason);
        } finally {
            if (cursor != null) cursor.close();
        }
    }

    // --- Notification queue bridge (SpendlyNotificationService) ---

    @PluginMethod
    public void isNotificationAccessGranted(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", isListenerEnabled());
        call.resolve(result);
    }

    private boolean isListenerEnabled() {
        try {
            String flat = android.provider.Settings.Secure.getString(
                getContext().getContentResolver(), "enabled_notification_listeners");
            if (flat == null || flat.isEmpty()) return false;
            android.content.ComponentName me = new android.content.ComponentName(
                getContext(), SpendlyNotificationService.class);
            return flat.contains(me.flattenToString());
        } catch (Exception e) {
            return false;
        }
    }

    @PluginMethod
    public void openNotificationAccessSettings(PluginCall call) {
        try {
            android.content.Intent intent = new android.content.Intent(
                "android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            String reason = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            call.reject("Could not open settings: " + reason);
        }
    }

    @PluginMethod
    public void drainNotifications(PluginCall call) {
        try {
            org.json.JSONArray items = SpendlyNotificationService.takeQueue(getContext());
            JSArray notifications = new JSArray();
            for (int i = 0; i < items.length(); i++) {
                org.json.JSONObject o = items.getJSONObject(i);
                JSObject n = new JSObject();
                n.put("pkg", o.optString("pkg", ""));
                n.put("app", o.optString("app", ""));
                n.put("text", o.optString("text", ""));
                n.put("time", o.optLong("time", 0L));
                notifications.put(n);
            }
            JSObject result = new JSObject();
            result.put("notifications", notifications);
            call.resolve(result);
        } catch (Exception e) {
            String reason = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            call.reject("Could not drain notifications: " + reason);
        }
    }
}
