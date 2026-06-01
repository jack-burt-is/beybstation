---
name: beybstation-design
description: Use this skill to generate well-branded interfaces and assets for Beybstation, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.

## Key files

- `README.md` — full brand context, content fundamentals (voice, casing, do/don't), visual foundations (color, type, spacing, shadows, animation), iconography rules.
- `colors_and_type.css` — all CSS custom properties. Import this in any artifact.
- `preview/` — visual cards documenting the design system pieces.
- `ui_kits/admin/` — full interactive recreation of the tournament admin app (tablet-first React/JSX prototype).
- `ui_kits/overlay/` — OBS livestream overlay.
- `assets/logo-original.png` — hi-res lockup (transparent PNG, 1345×1093).
- `reference/wireframes-text.txt` — original screen-flow brief.

## Quick brand summary

Beyblade tournament + underground rave in Sheffield. **Black, neon pink, off-white** with cyan/yellow/orange/red accents. **Bungee** display + **Space Grotesk** body + **VT323** for scores. Sharp corners, hard offset shadows (`6px 6px 0`), chunky 2–5px borders. No emoji. UPPERCASE for actions, sentence case for help text. Voice is hype-MC, not corporate — "ROUND 1. LET'S GO." not "Welcome to Round 1."
