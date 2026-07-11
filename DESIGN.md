---
name: HATEMECHA
colors:
  bg: "oklch(8% 0.006 260)"
  surface: "oklch(12% 0.006 260)"
  fg: "oklch(96% 0.006 95)"
  muted: "oklch(76% 0.008 95)"
  border: "oklch(84% 0.008 95)"
  accent: "oklch(61% 0.28 29)"
  ink: "oklch(4% 0.004 260)"
typography:
  display:
    fontFamily: "Bebas Neue, Impact, Arial Black, sans-serif"
    fontWeight: "900"
    lineHeight: "0.72"
  body:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontWeight: "700"
    lineHeight: "1.28"
  mono:
    fontFamily: "Share Tech Mono, Cascadia Mono, monospace"
    fontWeight: "850"
spacing:
  rail-width: "clamp(190px, 24vw, 330px)"
  signal-gap: "clamp(7px, 1vw, 13px)"
---

# Design System: HATEMECHA

## Overview

**HATEMECHA** is a raw, industrial, and brutalist digital interface. It draws inspiration from underground techno-culture, glitch art, and tactical displays. The UI evokes a physical, screen-based experience — gritty, high-contrast, and technically precise.

## Colors

The palette is rooted in deep, inky neutrals and a high-voltage accent. We use **OKLCH** for maximum perceptual consistency.

- **Background (`{colors.bg}`):** The deep ink foundation.
- **Surface (`{colors.surface}`):** Used for elevated panels and menu backgrounds.
- **Foreground (`{colors.fg}`):** Warm off-white for primary readability.
- **Accent (`{colors.accent}`):** Tactical Red/Orange — the primary driver for all interactions.
- **Ink (`{colors.ink}`):** Deepest black, used specifically for text placed *over* accent surfaces.

## Typography

Runtime source of truth: `src/styles/tokens.css` and Google Fonts in `index.html`.

- **Display (`{typography.display}`):** Bebas Neue (Impact fallback). Used for the main brand and section headers.
- **Body (`{typography.body}`):** Aptos/System. Used for descriptive copy.
- **Mono (`{typography.mono}`):** Share Tech Mono (Cascadia fallback). Used for navigation, UI hints, and tactical metadata.

## Layout & Components

### The Rail & Stage
The UI is divided into a fixed-width **Rail** (`{spacing.rail-width}`) for navigation and a fluid **Stage** for content. On mobile, the rail persists as a dominant anchor.

- **Signal Slots:** Interactive tactical badges using `{colors.accent}` borders and low-opacity visual assets.
- **Menu Items:** Lowercase mono text. Selected items flip to `{colors.accent}` fill with `{colors.ink}` text.
- **Floating Images:** Grayscale, high-contrast imagery that "breathes" and shifts contextually.

## Interaction Principles

1. **Lowercase Technicals:** All UI-specific buttons (`enter`, `home`, `close`) stay lowercase.
2. **Industrial Contrast:** Depth is created through solid color blocks and 1px `{colors.border}` lines, never soft shadows.
3. **Texture:** A global grain/noise overlay is essential to prevent the UI from feeling "too digital."

## Do's and Don'ts

### Do
- Always use `{colors.accent}` for the active state of any component.
- Keep headlines lowercase for section titles to maintain the "glitch/underground" feel.
- Respect the vertical rhythm of the Rail navigation.

### Don't
- Don't introduce soft gradients or rounded corners; the aesthetic is strictly industrial.
- Don't use vibrant colors outside of the `{colors.accent}`.
- Don't center-align technical descriptions; they should feel like entries in a log.
