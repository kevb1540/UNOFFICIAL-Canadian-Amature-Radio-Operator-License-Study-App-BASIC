// ©️ Kevin W. Brown 2026
package ca.kevin.maplewave;

import android.app.Activity;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONObject;

/** Uses installed English voices only. No cloud synthesis or text uploads. */
final class LessonSpeech {
    interface Events {
        void speech(String id, String event, String message);
        void boundary(String id, int start, int end);
        void voicesChanged();
    }
    private final Activity activity;
    private final Events events;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final AudioManager audio;
    private final Map<String, Voice> voices = new HashMap<>();
    private final AudioAttributes attributes = new AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build();
    private TextToSpeech engine;
    private AudioFocusRequest focus;
    private String currentId = "";
    private boolean ready = false, destroyed = false;
    private volatile String catalogue = "{\"ready\":false,\"voices\":[],\"error\":\"\"}";

    LessonSpeech(Activity activity, Events events) {
        this.activity = activity;
        this.events = events;
        this.audio = (AudioManager) activity.getSystemService(Activity.AUDIO_SERVICE);
        engine = new TextToSpeech(activity, status -> main.post(() -> initialize(status)));
    }

    private void initialize(int status) {
        if (destroyed) return;
        if (status != TextToSpeech.SUCCESS) {
            publish("The phone’s speech engine could not start. Install or enable an English speech engine in phone voice settings.");
            return;
        }
        ready = true;
        engine.setAudioAttributes(attributes);
        engine.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { event(id, "start", ""); }
            @Override public void onDone(String id) { event(id, "done", ""); }
            @Override public void onError(String id) { event(id, "error", "The phone’s speech engine could not read this passage."); }
            @Override public void onError(String id, int code) {
                event(id, "error", "The phone’s speech engine could not read this passage. Check the installed voice data and try again.");
            }
            @Override public void onRangeStart(String id, int start, int end, int frame) {
                main.post(() -> {
                    if (!destroyed && id.equals(currentId) && start >= 0 && end > start) events.boundary(id, start, end);
                });
            }
        });
        refresh();
    }

    private void event(String id, String kind, String message) {
        main.post(() -> {
            if (destroyed || !id.equals(currentId)) return;
            if (!kind.equals("start")) { currentId = ""; releaseFocus(); }
            events.speech(id, kind, message);
        });
    }

    void refresh() {
        if (destroyed || !ready) return;
        voices.clear();
        try {
            Set<Voice> available = engine.getVoices();
            if (available != null) for (Voice voice : available) {
                Set<String> features = voice.getFeatures();
                if ("en".equals(voice.getLocale().getLanguage()) && !voice.isNetworkConnectionRequired()
                    && (features == null || !features.contains("notInstalled"))) voices.put(voice.getName(), voice);
            }
            publish("");
        } catch (RuntimeException error) {
            publish("Could not list installed voices. Open phone voice settings, then refresh voices.");
        }
    }

    private void publish(String error) {
        try {
            JSONObject result = new JSONObject();
            JSONArray entries = new JSONArray();
            ArrayList<Voice> sorted = new ArrayList<>(voices.values());
            Collections.sort(sorted, Comparator.comparing(Voice::getName));
            for (Voice voice : sorted) {
                JSONObject item = new JSONObject();
                item.put("id", voice.getName()); item.put("name", voice.getName());
                item.put("language", voice.getLocale().toLanguageTag());
                item.put("offline", true); entries.put(item);
            }
            result.put("ready", ready || !error.isEmpty()); result.put("voices", entries); result.put("error", error);
            catalogue = result.toString();
        } catch (Exception ignored) {
            catalogue = "{\"ready\":true,\"voices\":[],\"error\":\"Could not read voice information.\"}";
        }
        events.voicesChanged();
    }

    String catalogue() { return catalogue; }

    void speak(String text, String voiceName, double rate, String id) {
        if (destroyed || id == null || id.length() > 100) return;
        stop();
        if (!ready || text == null || text.length() > TextToSpeech.getMaxSpeechInputLength()
            || Double.isNaN(rate) || Double.isInfinite(rate) || rate < 0.5 || rate > 2) {
            events.speech(id, "error", "The speech engine is not ready. Check your reading voice in Settings."); return;
        }
        Voice voice = voices.get(voiceName);
        if (voice == null || engine.setVoice(voice) != TextToSpeech.SUCCESS) {
            events.speech(id, "error", "The selected voice is unavailable. Choose an installed voice in Settings."); return;
        }
        focus = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
            .setAudioAttributes(attributes).setOnAudioFocusChangeListener(change -> {
                if (change == AudioManager.AUDIOFOCUS_LOSS || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                    String interrupted = currentId; stop();
                    if (!interrupted.isEmpty()) events.speech(interrupted, "error", "Reading stopped because another app needs the audio.");
                }
            }, main).build();
        if (audio.requestAudioFocus(focus) != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
            releaseFocus(); events.speech(id, "error", "Audio is in use. Try reading again in a moment."); return;
        }
        engine.setSpeechRate((float) rate); engine.setPitch(1.0f);
        currentId = id;
        if (engine.speak(text, TextToSpeech.QUEUE_FLUSH, new Bundle(), id) == TextToSpeech.ERROR) {
            currentId = ""; releaseFocus(); events.speech(id, "error", "The speech engine could not start reading.");
        }
    }

    private void releaseFocus() {
        if (focus != null) { audio.abandonAudioFocusRequest(focus); focus = null; }
    }
    void stop() { currentId = ""; if (engine != null) engine.stop(); releaseFocus(); }
    void openSettings() {
        stop();
        try { activity.startActivity(new Intent("com.android.settings.TTS_SETTINGS")); }
        catch (RuntimeException missing) {
            try { activity.startActivity(new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA)); }
            catch (RuntimeException ignored) { events.speech("", "error", "Open Android Settings → Accessibility → Text-to-speech to install English voices."); }
        }
    }
    void shutdown() { destroyed = true; stop(); if (engine != null) engine.shutdown(); }
}
