# Hatemecha Web

Portfolio web construido con React, TypeScript y Vite (dev) / Rollup (prod).

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

1. Pon fotos en `public/galeria/originales/`
2. Corré `npm run gallery:sync` (también corre en `dev` / `build`)

## Marca

- Tokens runtime: `src/styles/tokens.css`
- Spec: `docs/brand-spec.md` + `DESIGN.md`
