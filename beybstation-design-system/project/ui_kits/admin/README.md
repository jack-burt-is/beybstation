# Admin UI Kit · Beybstation Tournament

The tablet/mobile-first admin app used during the event by the operator. Single elimination, 16 players, first-to-4-points per match.

## Screens covered (matches the wireframe PDF)

1. **Landing** — choose: view live results, or admin
2. **Login** — password gate
3. **Home** — pick an existing tournament or create new
4. **Create new tournament** — name + edit 16 player names
5. **Tournament view (state 0)** — pre-Round-1, edit players only
6. **Tournament view (state 1)** — round generated, can shuffle/reorder
7. **Tournament view (state 2)** — round in progress, scores update live
8. **Match score entry** — gigantic CRT score, +/- and tap-to-edit, finish

## Files

- `index.html` — mounts the full interactive prototype
- `app.jsx` — top-level screen/state router
- `components.jsx` — Button, Input, Card, Header, RoundTabs, MatchRow, PlayerSlot, Badge, ScoreStepper
- `data.jsx` — fake tournament state + bracket helpers

## Run

Open `index.html`. Use the in-product navigation. State is in-memory; refresh resets it.

## Notes

- Designed for **1024×768** iPad landscape primary; reflows down to 360px.
- All copy follows the voice rules in `../../README.md` (UPPERCASE for actions, sentence case for help text, no emoji).
- Icons are Lucide via CDN.
