# Hatemecha Portfolio Brand Spec

## Tokens

```css
:root {
  --bg:       oklch(8% 0.006 260);
  --surface:  oklch(12% 0.006 260);
  --fg:       oklch(96% 0.006 95);
  --muted:    oklch(70% 0.008 95);
  --border:   oklch(84% 0.008 95);
  --accent:   oklch(61% 0.28 29);
  --accent-rgb: 255 0 0;

  --font-display: 'Bebas Neue', 'Impact', 'Arial Black', sans-serif;
  --font-body:    'Aptos', 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono:    'Share Tech Mono', 'Cascadia Mono', 'SFMono-Regular', Consolas, ui-monospace, monospace;
}
```

## Assets

- Optimized blur/noise background: `public/assets/hatemecha-bg-blur-noise.webp` (1280 x 800, about 165 KB).
- Menu eyes strip (used in UI): `public/assets/ojos.png`.
- Floating menu image block: `public/assets/menu-photo-block.webp`.
- Barcode slot image: `public/assets/barcode-hatemecha.webp`.

## Layout Posture

- First viewport is a poster: fast-loading blur/noise background, visible grain, red `HATEMECHA` centered above the midpoint.
- Display font may vary, but the title box must preserve the same overall width and height rhythm across breakpoints.
- The `OJOS DITHER` container width is measured from the rendered `HATE` word width.
- The `CODIGO BARRA` container width is measured from the rendered `MECHA` word width.
- Slot imagery stretches to its assigned container; proportions are controlled by the container, not the image.
- No red decorative glow, no radial spotlight, and no ornamental dot-matrix layer; the red should come from the mark, selector, and image material.
- Fullscreen menu drops from the top with a smooth downward transition over a dark, legible image field.
- Lateral menu items fade at the top and bottom using a rail mask; the red accent is the active selector and the rail divider.
- Menu input supports mouse hover/click, scroll, arrow keys, and WASD.
- Site photos are illustrative, borderless, and restrained; only small placement shifts and subtle opacity/filter breathing are allowed.
- Production build uses Rollup for this project so local builds do not depend on native Vite/esbuild process spawning in restricted Windows environments.
