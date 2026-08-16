# Mock GPS : Change Location — Play Store checklist

## Privacy policy (Play Console)

```
https://red-bananas.github.io/Test-12324/privacy/mock-gps.html
```

Paste that URL in **Play Console → App content → Privacy policy**.

- Source HTML: `docs/privacy/mock-gps.html`
- Markdown source: [PRIVACY.md](./PRIVACY.md)
- Do **not** use a `github.com/.../blob/...` link — use the `github.io` URL above

- Category: Tools
- Short description: Drop a test-location pin with safe auto-stop controls.
- Target audience: Android developers, QA teams, and users testing location-aware apps.
- Data safety: no collected or shared data; network is used for map tiles and place search only.
- Ads / analytics / account: none.
- Prominent disclosure: Mock GPS supplies Android test locations only after the user selects it under Developer Options.
- Foreground-service declaration: `specialUse` — user-initiated mock-location sessions with a persistent notification and immediate Stop action.
- Before publishing: replace the privacy contact placeholder, add final screenshots, complete the foreground-service video/declaration, and run the closed-testing track.

Mock GPS must not claim to bypass fraud checks, game protections, employer controls, or platform detection. Store copy should emphasize legitimate app testing and privacy testing.
