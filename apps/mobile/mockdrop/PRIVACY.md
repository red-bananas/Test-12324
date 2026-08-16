# Privacy Policy — Mock GPS

**Last updated:** 2026-08-16

Mock GPS : Change Location supplies Android test locations only after you select it under Developer Options. We do not operate accounts, ads, or a developer backend in v1.

## Play Store URL (use this in Google Play Console)

```
https://red-bananas.github.io/Test-12324/privacy/mock-gps.html
```

Do **not** use GitHub `blob/` links — Play's crawler often returns 404 for them.

Published HTML: [docs/privacy/mock-gps.html](../../../docs/privacy/mock-gps.html) (deployed via [`.github/workflows/pages.yml`](../../../.github/workflows/pages.yml) on push to `main`).

## Data we collect

None on developer servers. The app stores saved places, recent places, session duration, and active-session state locally in SharedPreferences. Search results are cached on-device for up to 24 hours (max 100 queries). Map tiles may be cached in app storage while viewing the map.

## Network

- **OpenStreetMap** (`tile.openstreetmap.org`) — map tiles as you pan/zoom.
- **Photon** (`photon.komoot.io`) — place search and reverse lookup from text/coordinates you enter.
- **Android Geocoder** — fallback if Photon is unavailable.

## Location permission

- **Foreground location** — only when you tap the GPS button on the map. Not retained as a mock location unless you start a session.
- **Background location** — never requested.
- Persistent notification while a mock session is active; Stop removes test providers.

## Other permissions

Mock location (Developer Options), notifications, foreground service, internet.

## Third-party services

Phase 1: no ads, no analytics SDK. Map/search use OSM, Photon, and optional device Geocoder.

## Contact

Open an issue on [red-bananas/Test-12324](https://github.com/red-bananas/Test-12324) or contact via the Play Store listing.
