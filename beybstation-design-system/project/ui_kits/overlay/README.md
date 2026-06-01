# OBS Overlay · Beybstation

Livestream overlay used in OBS. Camera feed sits underneath; the overlay HTML is a Browser Source on top.

## Layout

- **Bottom banner** — full-width strip showing every match in the current round, scores live.
- **Right rail** — current round name + the active match (zoomed up).
- **Top-left tag** — Beybstation lockup + "LIVE" badge.

## Files

- `index.html` — 1920×1080 demo. The camera area is a placeholder block. Overlay elements have transparent backgrounds so they composite cleanly.
- `overlay.jsx` — overlay components.
- `demo-data.jsx` — fake live data the overlay reads. In production this comes from the admin app's API.

## Sizing

Designed for **1920×1080** (16:9, OBS default). Use a Browser Source at full canvas. The overlay HTML body has `background: transparent` — set "Transparent background" in OBS source properties.

## Driving with real data

The brief calls for an API exposing tournament state. The shape this overlay expects:

```json
{
  "tournament": "Beybstation #2",
  "roundLabel": "Round 1",
  "activeMatch": { "idx": 3, "a": "Player 7", "b": "Player 8", "scoreA": 2, "scoreB": 1 },
  "matches": [
    { "idx": 1, "a": "Player 1", "b": "Player 2", "scoreA": 4, "scoreB": 1, "done": true },
    ...
  ]
}
```

Today the demo reads from `demo-data.jsx`. Swap in `fetch()` + polling once the API exists.
