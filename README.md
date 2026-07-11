# Hatemecha Web

Portfolio web construido con React, TypeScript y Vite (dev) / Rollup (prod).

Sitio: https://hatemecha.github.io/hatemecha-web/

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
npm run typecheck
npm run gallery:sync
```

## Arquitectura rápida

- Vistas y navegación del menú: `src/data/sectionViews.ts` + `src/App.tsx`
- Shell de páginas (header, Escape, Lenis, motion): `src/components/PortfolioPageShell.tsx`
- Presets de Motion: `src/motion/presets.ts`
- Estilos modulares: `src/styles/` (barrel en `src/styles.css`)
- Notas para agentes: `AGENTS.md`

## Galería

1. Pon fotos en `!PORTFOLIO/` (gitignored; JPEG/WebP/etc.)
2. Corré `npm run gallery:sync` — genera masters + thumbs WebP en `public/galeria/` + `src/data/galleryManifest.ts`
3. También corre automáticamente en `dev` / `build`

Los WebP en `public/galeria/` y el manifest van al repo: en CI / clone sin `!PORTFOLIO` el sync no vacía la galería.

## Deploy

Publicación en **GitHub Pages** vía Actions (`.github/workflows/deploy-pages.yml`) en cada push a `master`. El build de producción usa Rollup (`npm run build`) y sube `dist/`.

## Marca

- Tokens runtime: `src/styles/tokens.css`
- Spec: `docs/brand-spec.md` + `DESIGN.md`
