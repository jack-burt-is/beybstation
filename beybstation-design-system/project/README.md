# BEYBSTATION DESIGN SYSTEM

> Beyblade tournament + underground rave. Sheffield. 90s arcade meets warehouse party. **Loud, neon, slightly tacky on purpose.**

This system is the visual + interaction kit for everything Beybstation puts on a screen — the live tournament results page the audience watches, the admin-only tournament setup app run from an iPad behind the decks, and the OBS overlay that bottoms-out the livestream.

---

## Index

| File / folder | What's in it |
| --- | --- |
| `README.md` | This. Context, content rules, visual foundations, iconography. |
| `colors_and_type.css` | All CSS custom properties: palette, type scale, spacing, radii, shadows, glows. **Import this in any artifact.** |
| `SKILL.md` | Agent-skill manifest so this folder is portable to Claude Code. |
| `fonts/` | Webfont notes (we're CDN-loading via Google Fonts for now). |
| `assets/` | Logos, icon references, brand imagery. |
| `preview/` | Design-system cards that populate the Design System tab. |
| `ui_kits/admin/` | iPad/tablet tournament-admin app — login, home, tournament setup, bracket, match scoring. |
| `ui_kits/results/` | Public live-results page (read-only, the screen visitors land on). |
| `ui_kits/overlay/` | OBS livestream overlay — bottom banner + side rail. |
| `reference/` | Source PDF wireframes for the screen flow. |

---

## The brand in one paragraph

Beybstation is a beyblade tournament that doubles as a rave. 16 players, single elimination, first-to-4-points per match, projected on a big screen while a DJ plays. **The visual language is mid-90s tournament arcade, leaked Saturday-morning-cartoon trading card energy, with rave neon on top.** Black, neon pink, off-white. Flames and lightning are fair game. Shadows are hard. Corners are sharp. Type is loud. **If a designer says it's too much, we add one more sticker.**

---

## Sources we were given

- `uploads/logo.png` — original low-res Beybstation lockup (kept for reference; client supplied a hi-res replacement, now live as `assets/logo-original.png`).
- `uploads/Beybstation Logo.png` — hi-res hand-off from client (1345×1093, transparent PNG).
- `uploads/Beybstation tournament.pdf` — single wide-format wireframe board covering the full admin screen flow (landing → admin login → home → create tournament → bracket states 0/1/2 → match score entry → next-round generation → bracket / score-counter / livestream layout). Extracted into `reference/wireframes-text.txt`.
- Instagram: <https://www.instagram.com/beyb_station> — referenced for vibe only; we did not scrape it. If the client wants direct visual continuity with the IG feed, please attach screenshots.

---

## CONTENT FUNDAMENTALS

How copy is written for Beybstation.

### Voice
**Hype-MC at a tournament, not a corporate event page.** It's the voice of someone with a microphone shouting over the music. Short. Loud. Slightly unhinged in a friendly way. Uses tournament-game vocabulary unironically: *match*, *round*, *bracket*, *finish*, *winner*, *bout*, *arena*.

### Casing & punctuation
- **UPPERCASE** for all display type, headings, buttons, navigation labels, scoreboards.
- Sentence case is fine for body / instructional copy ("Enter password…", "Once a player has 4 points, you can finish the match.").
- Em dashes and ellipses are encouraged. Exclamation marks one at a time, used like rare loot.
- No corporate hedging. No "We're excited to…". No "elevate your…". No "powered by".

### I vs you
**"You"** addresses the admin/operator directly in-product ("You can edit names until the round starts."). **"We"** is the Beybstation crew when speaking publicly ("We're back. Sheffield. 8pm."). Avoid "I".

### Examples — use this voice

| ✅ Beybstation | ❌ Not Beybstation |
| --- | --- |
| ROUND 1. LET'S GO. | Welcome to Round 1 |
| FINISH MATCH | Submit Score |
| GENERATE ROUND 2 | Proceed to Next Stage |
| Shuffle the matchups | Randomise opponent allocation |
| 16 spinners. One winner. | A single-elimination beyblade competition |
| Admin only. Password up. | Authorised personnel — please log in |
| BEYBSTATION #2 | Beybstation Event 2 |

### Numerals
Always numerals, never spelled out. **"4 points"** not "four points". Scores rendered in chunky monospace CRT font, never bracketed (it's `4 - 1`, not `(4-1)`).

### Emoji
**No emoji.** This is a brand thing. We use icons, sticker-style graphics, and SVG marks instead. The exception is if a real emoji is being recontextualised as artwork (e.g. a giant 🔥 used as a poster element) — but never inline in body copy.

---

## VISUAL FOUNDATIONS

### Colors

Three-color core: **black, neon pink, off-white.** Plus a tight set of accents (cyan for winners, yellow/orange/red for flame/hazard moments, acid green sparingly).

- **Black (`--bey-black` `#0A0A0F`)** is the default background. The void. Almost everything sits on black.
- **Neon pink (`--bey-pink` `#FF1E8E`)** is the single hero color. Used for: primary buttons, accent borders, the active state, glow effects, "live" indicators. **Don't dilute it — it's either full-strength or it's not there.**
- **Off-white (`--bey-white` `#FAF7F2`)** is warm, slightly bone-coloured. Pure `#FFFFFF` should be avoided — it feels too clinical for this brand.
- **Cyan (`--bey-cyan` `#00F0FF`)** is the second neon, reserved for winners, highlights, and "next round" energy. Pink + cyan together = peak rave.
- **Flame palette** (yellow → orange → red) appears as accent illustrations, gradients, and the "live now" badge. Not for primary UI.

### Type

- **Display:** Bungee + Bungee Shade — chunky, blocky, slightly cartoonish. Heavy use of `text-transform: uppercase`.
- **Body:** Space Grotesk — clean grotesk for readability under the noise.
- **Mono / techno:** Major Mono Display for lowercase art-school labels and kickers.
- **CRT / scoreboard:** VT323 — pixel-terminal font for live scores, match clocks, the OBS overlay.

Tracking is wide on small labels (`letter-spacing: 0.18em` on kickers); tight on big display words. Line-height on display type is **0.95** — letters touch.

### Backgrounds
- Primary surface is **flat black** with subtle CSS noise overlay (`.bey-noise`) and optional CRT scanlines (`.bey-scanlines`).
- Big poster moments use **full-bleed neon pink** with the logo center-set.
- Pattern elements: diagonal hazard stripes (yellow/black), checkered finish-line bands, beyblade arena top-down circles.
- **No gradients except** the flame gradient (yellow→orange→red→pink) and pink→cyan rave fade. Otherwise: solid colors only.

### Spacing & layout
- Layout grid is loose, not pristine. **Slight rotations** (`transform: rotate(-1.5deg)`) on stickers/badges. Things can overlap.
- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96` (px).
- Fixed elements: status/header bar pinned top; round-tab nav sits directly under. On match-entry screens, the score numbers anchor center.

### Animation
- **Snap, don't ease.** 80–160ms transitions. No long drawn-out fades.
- Hover = `glow-pink` shadow turns on instantly + 1px upward translate.
- Press = scale `0.97` for 80ms + shadow collapses.
- Live indicators **blink** (1s steady pulse) rather than fade smoothly.
- Spinning beyblade graphic on loading states — physical rotation, not skeleton shimmer.
- Bracket reveals: each match slot snap-flips in sequence (no stagger easing — discrete steps).

### Hover / press states
- **Hover** on primary button: background lightens to `--bey-pink-hot`, gains `--glow-pink` outer glow, translates `-2px` up. Shadow stays.
- **Press**: scale 0.97, shadow collapses to `2px 2px 0`, color drops to `--bey-pink-deep`.
- **Disabled**: 30% opacity, no shadow, no hover.

### Borders, shadows, capsules
- **Hard offset shadows** are the signature — `6px 6px 0 var(--bey-black)` on pink elements; `6px 6px 0 var(--bey-pink)` on white elements. No blur, no soft drop-shadows. The aesthetic is "sticker on a poster".
- **Neon glow shadows** (blurred) are reserved for the live/active state and for scores: `0 0 24px rgba(255,30,142,0.6)`.
- Borders are chunky — **2–5px solid**, not 1px hairlines.
- Inner shadows are not used.
- **Capsules / pills** appear on tags and round-status chips; otherwise sharp rectangles.

### Corner radii
- Default is **`0` — sharp corners**.
- Pills use `999px` (round-status chips, "LIVE" badges).
- Soft 4–8px radii only on form inputs and the player-name slots, to read as "card-like" without losing edge.

### Cards
A card is: **solid dark surface (`--bg-card`) + 2px neon-pink border + 6px hard black offset shadow + sharp corners.** That's the recipe. On hover, the shadow shifts to `8px 8px 0` and the card translates `-2px -2px`.

### Transparency & blur
- **No glassmorphism.** No backdrop-blur. The brand is solid colour blocks.
- Limited transparency: scanline overlay (4% white), noise overlay (8%), match-row hover highlight (10% pink).
- Modals dim the underlying page with `rgba(10,10,15,0.85)` — opaque enough to kill it.

### Imagery vibe
- **High-contrast, oversaturated, slightly grainy.** Action shots of beyblades mid-spin, crowd shots with motion blur, neon-lit close-ups.
- Photography is warm-leaning (magenta + amber cast).
- B&W is acceptable for archival / past-tournament imagery, but with heavy grain.
- Never use stock-photo-looking imagery. Phone-flash event photography is the target reference.

### Layout rules
- Header always 56–80px tall, black background, pink hairline border-bottom or pink full-bleed.
- Round tabs are inline horizontal pills, active = pink fill + black text + glow.
- Bracket rows are full-width on tablet/desktop, stacked on mobile.
- Score-entry screen uses the full viewport — player names left + right, gigantic centered scores, big +/- buttons.

---

## ICONOGRAPHY

Beybstation does NOT have its own icon set. We use a small, opinionated mix:

1. **Custom brand marks** (in `assets/`):
   - `logo-original.png` — the supplied hi-res lockup (1345×1093 transparent PNG, drop-shadow only — no border, no `image-rendering: pixelated`).
   - `logo-mark.svg` — extracted/simplified spinner mark for use as a favicon, loading indicator, and watermark on the overlay.
   - `flame.svg`, `lightning.svg`, `star-burst.svg` — sticker-style decorative SVGs used as accent graphics.
2. **System UI icons** — we use **[Lucide](https://lucide.dev)** via CDN for utility icons (home, arrow-left, plus, minus, shuffle, edit, x, eye, check). Stroke weight 2, sharp corners, no fills. **This is a substitution — flag this with the client; if they want a custom icon set drawn for the brand we should commission it.**
3. **Emoji** — not used.
4. **Unicode** — chunky chars like `×`, `→`, `▲ ▼`, `■` are acceptable as decorative dividers / score-stepper arrows in the CRT font, especially in the OBS overlay where they read as terminal characters.

Lucide CDN reference:
```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="home"></i>
<script>lucide.createIcons();</script>
```

---

## CAVEATS / OPEN QUESTIONS

- **Logo is low-resolution.** ~~All preview cards use it but it pixelates above ~150px.~~ **Resolved — hi-res lockup landed (`assets/logo-original.png`, 1345×1093). Logo now displays at natural aspect ratio with no border or pixelated rendering.**
- **Fonts are Google-CDN'd**, not bundled. Bungee/Bungee Shade are SIL Open Font Licence so this is fine for production too, but if we want offline kits we should download the woff2s into `fonts/`.
- **Iconography is Lucide-substituted** — no bespoke set yet.
- **No photography assets provided** — UI kits use placeholder blocks where event imagery would go.
- Instagram feed not scraped; vibe inferred from brief.
