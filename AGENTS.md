# Hatemecha Web — agent notes

Portfolio SPA (React 19 + TypeScript + Vite). Production build uses **Rollup**, not `vite build`, because of Windows/esbuild spawn constraints (see `docs/brand-spec.md`).

## Commands

- `npm run dev` — gallery sync + Vite
- `npm run build` — gallery sync + `tsc` + Rollup → `dist/`
- `npm run preview` — static server for `dist/`
- `npm run typecheck` — `tsc --noEmit`
- `npm run gallery:sync` — Sharp masters/thumbs from `!PORTFOLIO/` → `public/galeria/` + `galleryManifest.ts`

## Architecture

- **Views** live in `src/data/sectionViews.ts` (`sectionEnterActions` + `AppView`). Add a page by registering the section action and handling the view in `App.tsx` (exhaustive `switch`).
- **Menu** (`MenuOverlay`) only calls `onEnterSection`; it does not special-case destinations.
- **Page chrome** (header, Escape, Lenis, motion) → `PortfolioPageShell` (projects / section stubs). Gallery uses a custom reveal layout in `GalleryPage`.
- **Motion presets** → `src/motion/presets.ts` (Motion for view/page chrome).
- **animejs** stays for scramble text, hero/menu enter FX, and code typing — do not duplicate fade/Y page transitions in animejs.
- **Styles** are modular under `src/styles/`; `src/styles.css` is the `@import` barrel. Rollup inlines imports into `dist/assets/app.css`.

## Content

- Gallery source (gitignored): `!PORTFOLIO/` — drop JPEGs/WebP/etc. here, then `npm run gallery:sync`.
- Generated: `public/galeria/masters/` (~2400px WebP), `public/galeria/thumbs/` (~420px WebP), `src/data/galleryManifest.ts`.
- Projects: `src/data/projects.ts`.
- Section copy / rail: `src/data/portfolioSections.ts`.

## Design source of truth

Runtime tokens/fonts: `src/styles/tokens.css` + `index.html` (Bebas Neue + Share Tech Mono). Keep `DESIGN.md` and `docs/brand-spec.md` aligned with those.
