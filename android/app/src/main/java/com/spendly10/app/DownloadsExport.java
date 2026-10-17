package com.spendly10.app;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "DownloadsExport")
public class DownloadsExport extends Plugin {

    @PluginMethod
    public void saveCsv(PluginCall call) {
        String filename = call.getString("filename", "spendly-export.csv");
        String data = call.getString("data");
        if (data == null) {
            call.reject("No data to export");
            return;
        }

        try {
            byte[] bytes = data.getBytes("UTF-8");

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                saveWithMediaStore(filename, bytes);
            } else {
                saveLegacy(filename, bytes);
            }

            JSObject result = new JSObject();
            result.put("path", filename);
            call.resolve(result);
        } catch (Exception e) {
            String reason = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            call.reject("Could not save to Downloads: " + reason);
        }
    }

    private void saveWithMediaStore(String filename, byte[] bytes) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();

        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
        values.put(MediaStore.Downloads.MIME_TYPE, "text/csv");
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            throw new Exception("MediaStore insert failed");
        }

        try (OutputStream out = resolver.openOutputStream(uri)) {
            if (out == null) {
                throw new Exception("Could not open output stream");
            }
            out.write(bytes);
        }

        values.clear();
        values.put(MediaStore.Downloads.IS_PENDING, 0);
        resolver.update(uri, values, null, null);
    }

    @SuppressWarnings("deprecation")
    private void saveLegacy(String filename, byte[] bytes) throws Exception {
        File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new Exception("Downloads folder not available");
        }
        try (FileOutputStream out = new FileOutputStream(new File(dir, filename))) {
            out.write(bytes);
        }
    }
}
