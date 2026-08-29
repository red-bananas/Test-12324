# Privacy Policy — Future Alarm

**Last updated:** 2026-08-28

Future Alarm schedules and rings alarms **entirely on your device**. We do not sell alarm data or personal information. The optional voice-command feature processes a spoken command as described below.

## Play Store URL (use this in Google Play Console)

```
https://red-bananas.github.io/Test-12324/privacy/date-alarm.html
```

Do **not** use GitHub `blob/` links — Play's crawler often returns 404 for them.

Published HTML: [docs/privacy/date-alarm.html](../../../docs/privacy/date-alarm.html) (deployed via [`.github/workflows/pages.yml`](../../../.github/workflows/pages.yml) on push to `main`).

## Data we collect

None on developer-operated servers. Alarm schedules, ring history, and preferences are stored locally (SQLite and SharedPreferences). A direct-boot mirror may hold upcoming alarm details so alarms reschedule after reboot.

## Network

Core alarms work offline. If the user taps Voice command, Android's speech-recognition service converts the command to text. Depending on the phone, that speech service may process audio on-device or remotely. Future Alarm sends only the resulting text transcript—not recorded audio—to Google's Gemini Developer API through Firebase AI Logic so it can extract the requested alarm date, time, label, and recurrence. The result is validated locally and shown for confirmation before an alarm is saved.

Firebase App Check with Play Integrity sends app/device integrity information to Google to protect the Gemini endpoint from unauthorized use. Voice commands normally require internet access; manually created alarms do not.

## Permissions

Exact alarms, notifications, full-screen intent, foreground service, boot completed, wake lock, vibration, and set-alarm are used for scheduling and ringing alarms. Microphone access is requested only when the user starts a voice command. Internet access is used only for the optional voice-command processing and related integrity checks. No calendar, location, contacts, or broad storage permissions are requested.

## Third-party services

No ads, cloud alarm sync, or analytics SDK. The optional voice feature uses Android speech recognition, Firebase AI Logic, Firebase App Check, Google Play Integrity, and the Gemini Developer API.

## Contact

Open an issue on [red-bananas/Test-12324](https://github.com/red-bananas/Test-12324) or contact via the Play Store listing.
