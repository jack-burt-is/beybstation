# Fonts

Beybstation uses four typefaces, all available from **Google Fonts**. They're loaded by CDN in `colors_and_type.css`:

| Role | Family | Why |
| --- | --- | --- |
| Display | **Bungee** | Chunky uppercase block letters. SIL OFL. |
| Hero / poster | **Bungee Shade** | 3D drop-shadow variant. SIL OFL. |
| Mono / kicker | **Major Mono Display** | Art-school lowercase techno. SIL OFL. |
| CRT / scoreboard | **VT323** | Pixel-terminal mono. SIL OFL. |
| Body | **Space Grotesk** | Clean grotesk, readable. SIL OFL. |

All five fonts are **Open Font License**, safe for production redistribution.

## To bundle offline

Download the woff2 files from <https://fonts.google.com/> for each family and drop them in this folder, then swap the `@import` at the top of `colors_and_type.css` for local `@font-face` declarations.

## Substitution note

These were chosen as close-fit Google Font matches for the brand's intended 90s-arcade / underground-rave vibe. If the client has bespoke typefaces in mind, flag this with them and replace.
