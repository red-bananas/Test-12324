# Future Alarm — Play Data Safety (v1)

Use with [PRIVACY.md](./PRIVACY.md) and the hosted policy at `https://red-bananas.github.io/Test-12324/privacy/date-alarm.html`.

Re-audit against the **signed release binary** before submission.

## Summary

| Area | Declaration |
|------|-------------|
| Developer-operated collection | **No** — no account, analytics SDK, ads, or developer backend |
| Optional voice feature | **Yes** — uses microphone, internet, Android speech recognition, Firebase AI Logic (Gemini), Firebase App Check, and Google Play Integrity |
| Core alarms (manual UI) | **No network** — schedules, history, and ringing stay on-device |

## Play Console answers (voice / Gemini)

When Play Console asks whether the app collects or shares user data, answer **Yes** because the optional voice-command flow processes user-provided speech.

### Data types to declare (optional voice command only)

| Data type | Collected | Shared | Purpose | Required? | Notes |
|-----------|-----------|--------|---------|-----------|-------|
| **Audio** | Yes | Yes (with Google speech-recognition provider as applicable) | App functionality | Optional | Microphone is used only after the user starts Voice command. Audio is converted to text; Future Alarm does not upload recorded audio files. |
| **Other user-generated content** (voice transcript / alarm command text) | Yes | Yes (with Google — Gemini via Firebase AI Logic) | App functionality | Optional | Only the text transcript is sent to Gemini to extract date, time, label, and recurrence. Not stored on developer servers. |
| **Device or other IDs** | Yes | Yes (with Google — Play Integrity / App Check) | Fraud prevention, security, compliance | Optional | Sent only to protect the Gemini endpoint; tied to voice-command use. |

### Handling practices (typical answers)

- **Encrypted in transit:** Yes  
- **Users can request deletion:** Data is not held on developer servers; uninstalling the app removes local alarm data. Voice processing is ephemeral on Google’s side per Google’s policies.  
- **Data is required:** No — voice is optional; manual alarm creation works offline  
- **Ephemeral processing:** Yes, where Play offers it for processing-only flows  

### Third parties involved in voice processing

- Google Android speech recognition (device or cloud, depending on phone)  
- Google Gemini Developer API (via Firebase AI Logic)  
- Firebase App Check  
- Google Play Integrity  

### Permissions aligned with declarations

- `RECORD_AUDIO` — voice command only  
- `INTERNET` — voice command + integrity checks only  
- Core alarm permissions (exact alarm, notifications, foreground service, boot, wake lock, vibration, set-alarm) — **not** data-collection permissions  

## What not to claim

- Do **not** mark the app as “no data collected” globally — voice/Gemini processing must be disclosed.  
- Do **not** claim “no internet” globally — `INTERNET` is in the release manifest for voice.  
- Do **not** omit microphone / audio / user-generated content for the optional voice feature.
