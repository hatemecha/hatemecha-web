# Revisión pre-lanzamiento — Hatemecha Web

**Fecha:** 2026-07-20  
**Alcance:** SPA React 19 + TypeScript + Vite/Rollup (`hatemecha-web`)  
**Criterio:** “¿lo publicaría mañana?”  
**Método:** auditoría de código + stress test Playwright (desktop 1440×900 + iPhone 14) contra `http://127.0.0.1:5174/`  
**Evidencia runtime:** `.tmp-review/` (screenshots + `findings.json` / `findings2.json`)

---

## Veredicto

**Estado (2026-07-20, post-fix P0+P1):** la mayoría de bloqueadores de lanzamiento fueron corregidos en código (routing hash, Enter/Cerrar, lightbox trap, home images ~100 KB, galería ≤140 tiles, Acerca con copy, OG/favicons). Revisá el checklist al final antes de publicar.

~~**No listo para publicar mañana** sin al menos los **P0** y la mayoría de los **P1**.~~

La identidad visual (hero, menú, proyectos, galería) se siente fuerte y coherente con la marca. El runtime en Chromium salió **sin errores de consola ni request failed**. Lo que rompe la sensación de producto “cerrado” es:

1. **No hay URLs / historial** → el botón Atrás del browser sale del sitio.
2. **Menú home carga ~3.3 MB** de fotos decorativas al abrir.
3. **Galería monta ~546 botones** en DOM (pesado + teclado inviable).
4. **Acerca** sigue siendo stub (“contenido en progreso”).
5. Varios bugs de teclado/foco (Enter en Cerrar, lightbox sin focus trap).

---

## Skills de browser (find-skills)

Busqueda `npx skills find browser` — opciones útiles si querés reforzar testing visual:

| Skill | Installs | Install |
|---|---|---|
| [vercel-labs/agent-browser@agent-browser](https://skills.sh/vercel-labs/agent-browser/agent-browser) | 560K+ | `npx skills add vercel-labs/agent-browser@agent-browser -g -y` |
| [browser-act/skills@browser-act](https://skills.sh/browser-act/skills/browser-act) | 104K+ | `npx skills add browser-act/skills@browser-act -g -y` |
| [browser-use/browser-use@browser-use](https://skills.sh/browser-use/browser-use/browser-use) | 85K+ | `npx skills add browser-use/browser-use@browser-use -g -y` |

En esta sesión el MCP `plugin-browse-browser` falló (`browse ENOENT`). El stress test se hizo con **Playwright** local. Skills locales ya disponibles: `webapp-testing`, `browser-testing-with-devtools`.

---

## Cómo usar este documento

Cada hallazgo tiene un bloque **PROMPT PARA IA**. Copiá el bloque completo a otra sesión/agente. Incluye contexto del repo, archivos, comportamiento esperado y criterios de aceptación. No hace falta re-explicar el proyecto.

Severidades:

- **P0** — bloquea lanzamiento
- **P1** — debería arreglarse antes de publicar
- **P2** — pronto post-lanzamiento
- **P3** — polish

---

## P0 — Bloqueadores

### P0-1 · Sin routing / History API (Back sale del sitio)

**Categoría:** navegación · UX · SEO  
**Evidencia:** desde galería, `page.goBack()` → `about:blank`. URL siempre `http://…/` en todas las vistas. `document.title` no cambia.  
**Archivos:** `src/App.tsx`, `src/data/sectionViews.ts` (no hay router)

**Qué está mal:** `activeView` es solo `useState`. Abrir galería/proyectos/etc. no hace `pushState`. Refresh siempre vuelve a home. No hay deep links compartibles.

**PROMPT PARA IA**

```
Contexto: Portfolio SPA React 19 en hatemecha-web. Views en App.tsx via useState<AppView> (home|gallery|projects|cv-skills|musica|acerca). Deploy en GitHub Pages bajo /hatemecha-web/. NO hay router.

Problema: cambiar de vista no actualiza URL ni history. Browser Back sale del sitio. Refresh pierde la sección. No se puede compartir /galeria.

Tarea:
1. Implementar routing liviano (preferí hash `#/galeria` o History API con base `/hatemecha-web/` — elegí uno y documentá por qué; si usás path routes, agregá public/404.html = copia de index.html para GH Pages SPA fallback).
2. Sincronizar activeView ↔ URL en ambas direcciones (entrar sección → pushState; popstate → setActiveView; menú abierto puede ser query/hash opcional).
3. Al volver con Back desde una sección, restaurar home CON menú abierto en la sección correcta (como returnToSectionMenu).
4. Actualizar document.title por vista (ej. "Galería — Hatemecha").
5. Mantener el switch exhaustivo con never en App.tsx / sectionViews.ts.

Aceptación:
- Entrar a galería cambia la URL.
- Back vuelve al menú/home, no abandona el sitio.
- Refresh en esa URL reabre la misma vista.
- typecheck pasa.
```

---

### P0-2 · Fotos del menú home ~3.3 MB sin optimizar

**Categoría:** performance · mobile  
**Evidencia Playwright:** al abrir menú se transfieren `home1.webp` 650 KB, `home2.webp` 1465 KB, `home3.webp` 1188 KB.  
**Archivos:** `public/assets/home{1,2,3}.webp`, `src/data/assets.ts`, `src/components/FloatingImages.tsx`

**PROMPT PARA IA**

```
Contexto: En el menú (sección home) FloatingImages muestra 3 fotos decorativas (homeMenuScatterPhotos). Hoy pesan ~3.3MB combinados y se descargan al abrir el menú.

Tarea:
1. Re-exportar versiones display (~600–900px de ancho, WebP q~70–80) manteniendo aspect ratios usados en assets.ts (width/height).
2. Reemplazar archivos en public/assets/ o agregar home*-sm.webp y apuntar assets.ts a esos.
3. loading="lazy" en todas excepto quizá la primera visible; no marcar eager innecesariamente.
4. Verificar que el wire SVG de FloatingImages sigue midiendo bien tras el cambio de tamaño.

Aceptación:
- Transfer total de las 3 fotos < ~400KB en network.
- Menú home se ve igual de nítido a tamaño de pantalla.
- Sin regresiones visuales en mobile (ver floating.css / responsive.css).
```

---

### P0-3 · Galería: ~546 tiles interactivas en DOM

**Categoría:** performance · a11y · teclado  
**Evidencia:** `tileCount: 546` (mínimo hardcodeado 440 + floor por viewport). `findNearestTileIndex` puede hacer getBoundingClientRect en todas.  
**Archivos:** `src/components/GalleryPage.tsx` (L19–34, L133–148, L93–109, L476–497), `src/styles/pages.css`

**PROMPT PARA IA**

```
Contexto: GalleryPage duplica las fotos del manifest hasta max(440, length*10, estimateFilledGalleryTileCount()) como <button> + <img> cada una. En runtime vimos 546 tiles. El grid es 270vw × 250svh con pan por pointer.

Problemas: DOM enorme, memoria, main-thread, cientos de tab stops, O(n) nearest-tile en pan.

Tarea (elegí el enfoque más simple que preserve el look de "muro infinito"):
A) Bajar floor agresivamente + virtualizar (solo montar tiles en viewport ± margen), O
B) Mosaic CSS/background con pocas celdas focusables, O
C) Menos repeticiones (ej. 2–3× fuentes) + grid más chico en desktop.

Además:
- No llamar getBoundingClientRect en todas las tiles por frame; usar elementFromPoint (ya existe) o spatial index.
- En mobile el grid es estático: no pagues el costo del pan desktop.
- Mantener lightbox sobre galleryItems (fuente única), no sobre duplicados.

Aceptación:
- < ~120 nodos tile montados a la vez (o justificación medida si más).
- Tab no recorre cientos de botones (roving tabindex o tiles no-focusable + un control de browse).
- Pan/glow sigue sintiéndose fluido en desktop mid-range.
- typecheck pasa.
```

---

## P1 — Antes de publicar

### P1-1 · Enter en “Cerrar menú” entra a la sección

**Evidencia:** con sección `proyectos` activa, focus en “Cerrar menú” + Enter → `view: "projects"` (no cierra). En `home` parece “cerrar” porque enterAction de home es `close-menu`.  
**Archivos:** `src/hooks/useMenuControls.ts` (L68–72), `src/components/MenuOverlay.tsx`

**PROMPT PARA IA**

```
Bug: useMenuControls intercepta Enter globalmente cuando el menú está abierto y llama enterSection() + preventDefault(). Si el foco está en el botón "Cerrar menú" (u otro button que no sea enter), Enter debería activar ESE botón (cerrar), no navegar.

Fix:
- Si event.target está dentro de un button/a (interactive) distinto del enterButton, NO hijackear Enter (dejar el comportamiento nativo).
- Opcional: solo auto-enter cuando el foco es el enter button o el rail item seleccionado.
- Verificar Escape sigue cerrando; flechas/WASD/rueda siguen cambiando sección.

Aceptación:
- Focus en Cerrar + Enter → cierra menú, se queda en home.
- Focus en enter + Enter → entra a la sección.
- Focus en rail + Enter → entra (o selecciona según diseño actual).
```

---

### P1-2 · Lightbox sin focus trap / Tab escapa al grid

**Evidencia:** lightbox abierto; tras varios Tab, foco en `.galleryRevealTile` fuera del dialog. Close sin `aria-label`. Focus al abrir no va al dialog.  
**Archivos:** `src/components/GalleryPage.tsx` (lightbox ~L508–563)

**PROMPT PARA IA**

```
Gallery lightbox tiene role="dialog" aria-modal="true" pero:
- no mueve foco adentro al abrir
- Tab escapa a los 500+ tiles detrás
- botón .galleryLightboxClose es texto "x" sin aria-label
- al cerrar, restaurar foco al tile que abrió (guardar ref/index)

Implementar focus trap (mismo patrón que MenuOverlay FOCUSABLE_SELECTOR), focus inicial en Close o Next, aria-label="Cerrar" en close, Escape ya cierra (mantener). Scrim ya tiene aria-label.

Aceptación: con lightbox abierto, Tab cicla solo scrim/close/prev/next; Escape cierra y foco vuelve al tile origen.
```

---

### P1-3 · Al entrar a una página el foco cae en `<body>`

**Evidencia:** tras Enter a galería, `focused: "BODY."`  
**Archivos:** `src/App.tsx`, shells de página, `GalleryPage.tsx`, `PortfolioPageShell.tsx`

**PROMPT PARA IA**

```
Al cambiar activeView, el menú se desmonta y el foco se pierde (body). En cada vista (gallery, projects, cv, musica, acerca), al mount enfocar el h1 (tabIndex={-1}) o el botón "menu" de volver. No robar foco si el usuario ya tabbeó a otro control.

Aceptación: tras Enter desde menú, document.activeElement es el título o el back control de esa página.
```

---

### P1-4 · Acerca es stub en producción

**Evidencia screenshot + copy:** “contenido en progreso — volvé al menú…”  
**Archivos:** `src/components/SectionPage.tsx`, `src/data/portfolioSections.ts`

**PROMPT PARA IA**

```
La sección "acerca" muestra un stub. Para lanzar: (A) escribir bio real corta + contacto/redes (Bahía Blanca, qué hace Hatemecha), O (B) quitar "acerca" del menú (portfolioSections + sectionViews) hasta tener copy.

No dejes "en progreso" visible en producción. Si elegís A, corregí acentos en el copy de portfolioSections (página, diseños, producción, fotografía, Bahía).
```

---

### P1-5 · Title/meta no cambian por vista

**Evidencia:** title siempre “Hatemecha — diseño, foto y proyectos” en gallery/projects/acerca.  
**Archivos:** `index.html`, `src/App.tsx`

**PROMPT PARA IA**

```
Al cambiar activeView, setear document.title (y opcionalmente meta description). Coordinar con el routing de P0-1. Ejemplos: "Proyectos — Hatemecha", "Galería — Hatemecha", "Música — Hatemecha".
```

---

### P1-6 · OG image es textura blur, no card de marca

**Archivos:** `index.html` (og:image / twitter:image → `hatemecha-bg-blur-noise.webp`)

**PROMPT PARA IA**

```
Crear OG image 1200×630 (WebP o JPG) con lockup Hatemecha + atmósfera de marca (no solo noise). Guardar en public/assets/ (ej. og-card.webp) y actualizar meta og:image y twitter:image a la URL absoluta de GH Pages. Verificar que el asset exista en dist tras build.
```

---

### P1-7 · Favicon solo WebP; sin apple-touch-icon

**Archivos:** `index.html` L36

**PROMPT PARA IA**

```
Agregar favicon.ico + PNG 32×32 y apple-touch-icon 180×180 derivados del barcode/marca. Linkear en index.html. Mantener webp como extra si querés.
```

---

### P1-8 · Floating décor con pointer-events: auto

**Archivos:** `src/styles/floating.css` (`.floatingImage`, `.homeScatterFigure` → `pointer-events: auto` pese a `aria-hidden`)

**PROMPT PARA IA**

```
Las imágenes flotantes del menú son decorativas (aria-hidden) pero capturan pointer events y pueden bloquear taps cerca del panel en mobile. Poné pointer-events: none en .floatingImage / .homeScatterFigure / wires. Si necesitás hover filter, aplicarlo vía CSS en un parent que no intercepte, o solo en desktop (hover:hover).
```

---

### P1-9 · Mobile: primer tap en galería solo “highlight”, segundo abre

**Archivos:** `src/components/GalleryPage.tsx` `handleTileActivate` (L298–308)

**PROMPT PARA IA**

```
En coarse pointer, el primer tap setea hot tile y return; el segundo abre lightbox. Se siente roto. Cambiar a: en touch, abrir lightbox en el primer tap. Reservar el two-step solo si hay un motivo UX fuerte; si lo dejás, mostrar hint visible "tocá de nuevo para ampliar".
```

---

### P1-10 · Copy en español sin acentos / typos

**Archivos:** `src/data/portfolioSections.ts`, `src/data/projects.ts`

Ejemplos: `pagina`→`página`, `disenos`→`diseños`, `produccion`→`producción`, `fotografia`→`fotografía`, `bahia`→`Bahía`, `rapidas`→`rápidas`, `busqueda`→`búsqueda`, `deteccion`→`detección`.

**PROMPT PARA IA**

```
Corrector ortográfico ES en portfolioSections.ts, projects.ts, y cualquier string UI visible (GalleryPage "galeria" en aria-label, etc.). No cambiar ids de sección (galeria, acerca). html lang="es" ya está.
```

---

### P1-11 · Lenis en galería (conflicto potencial)

**Archivos:** `src/hooks/useLenisScroll.ts`, `GalleryPage.tsx`

**PROMPT PARA IA**

```
GalleryPage usa pan custom + overflow hidden pero igual monta Lenis con syncTouch:true. Desactivar Lenis en gallery (no llamar useLenisScroll, o pasar enabled:false). Revisar que Escape/menu sigan bien.
```

---

### P1-12 · Alts de galería = nombres numéricos

**Archivos:** `scripts/sync-gallery.mjs`, `src/data/galleryManifest.ts`

**PROMPT PARA IA**

```
Los alt salen del basename ("011"). Para el grid mosaico usá alt="" (decorativo) y en lightbox un label humano (filename o metadata opcional en sync). Evitar anunciar 546 veces el mismo número.
```

---

## P2 — Pronto

### P2-1 · Sin `404.html` para GitHub Pages

Necesario cuando existan path routes. Hoy con solo `/` es menos crítico; con P0-1 path-based es obligatorio.

**PROMPT PARA IA**

```
Si el routing usa paths bajo /hatemecha-web/, agregar public/404.html idéntico a index.html (SPA fallback GH Pages) y asegurar que el deploy lo copie a dist. Si usás solo hash routing, documentar que 404.html no es necesario y cerrar este item.
```

---

### P2-2 · Sitemap de una sola URL

`public/sitemap.xml` solo lista home. Tras routing, listar cada sección.

---

### P2-3 · Skip link ausente en hero

Inner pages tienen skip; `Hero.tsx` no. Agregar skip a “Abrir menú” / contenido.

---

### P2-4 · Contraste bajo en hints / captions / code

Hints del menú ~opacity 0.34; snippets ~0.46; captions lightbox ~0.72. Subir luminancia para WCAG AA donde sea texto real (el hint de controles cuenta).

---

### P2-5 · Touch targets &lt; 44×44

Signal slots ~36px alto; botón menu galería pequeño; varios rail items &lt;44px. Ampliar hit-area con padding.

---

### P2-6 · Lightbox nav sin safe-area en iPhone

`bottom: 16px` → `max(16px, env(safe-area-inset-bottom))` en nav del lightbox (`responsive.css` / `pages.css`).

---

### P2-7 · Google Fonts en runtime

`index.html` carga Bebas Neue + Share Tech Mono desde Google. Self-host para privacidad/CSP/offline.

---

### P2-8 · Project strip RAF continuo

`ProjectsPage.tsx` corre `requestAnimationFrame` infinito con ≥2 imágenes. Pausar con IntersectionObserver cuando offscreen.

---

### P2-9 · Masters de galería ~15 MB en deploy

44–45 masters ~15.2 MB siempre en Pages. Considerar master más chico o derivada “lightbox” ~1200px.

---

### P2-10 · `sync-gallery.mjs` no borra huérfanos

Si sacás una foto de `!PORTFOLIO/`, el WebP viejo puede seguir en `public/galeria` y deployarse. Prune tras sync.

---

### P2-11 · `aria-live` + ScrambleText = spam SR

`MenuOverlay` panel `aria-live="polite"` + scramble mutando texto. Sacá scramble del live region; anunciá el título una vez.

---

### P2-12 · Hint móvil muestra WASD / rueda

En iPhone el hint dice `↑↓ ←→ · WASD · enter · rueda`. En coarse pointer, hint tipo “tocá la lista · enter”. Swipe en stage sería ideal (P3).

---

### P2-13 · Hero label “Modos visuales” engañoso

`Hero.tsx`: slots solo abren el menú. Cambiar a “Abrir menú” a nivel de grupo.

---

### P2-14 · Empty states faltantes en projects/music

Gallery tiene empty; projects/music no. Si el array queda vacío, pantalla muda.

---

### P2-15 · Grain overlay encima del UI

`shell.css` grain `z-index: 6` sobre menú `z-index: 5`. Baja contraste efectivo. Bajar z-index u opacidad en páginas con mucho texto.

---

### P2-16 · CI sin smoke / budget

Deploy = build only. Agregar assert de tamaño de `dist` y/o Playwright smoke en preview.

---

## P3 — Nice to have

| ID | Tema | Nota |
|---|---|---|
| P3-1 | `referrerpolicy` en links externos | Ya tienen `noopener noreferrer` |
| P3-2 | JSON-LD + Bandcamp en `sameAs` | `index.html` |
| P3-3 | Token drift `--muted` docs vs tokens.css | Alinear `docs/brand-spec.md` |
| P3-4 | `ojos.png` → WebP | Impacto bajo (~5 KB) |
| P3-5 | Empty gallery copy de dev en prod | `!PORTFOLIO` / `gallery:sync` solo en `import.meta.env.DEV` |
| P3-6 | webmanifest PWA light | Opcional |
| P3-7 | Swipe en menú mobile | Alternativa a rail fino |
| P3-8 | StrictMode double anime en dev | Solo dev |

---

## Hallazgos visuales / comodidad (sesión de “romper cosas”)

Observados en screenshots reales:

1. **Hero** — composición fuerte, marca clara, grain OK. Social icons chicos; chevron de menú legible.
2. **Menú desktop** — look industrial coherente; photos scatter + wires se ven bien; copy scramble a veces se captura a mitad (efecto intencional, pero el texto final debe completar siempre — `onComplete` ya lo hace).
3. **Menú mobile** — panel usable; fotos scatter apretadas al borde; hint de teclado desktop confunde; rail carousel muestra labels repetidos (esperado por diseño de carrusel, no es bug de datos).
4. **Galería desktop** — muro impactante; título centra bien; muchas tiles oscuras → hay que “descubrir” que se puede pan/hover; primer tile del DOM está fuera de viewport (pan), mal para automatización y para focus en tile 0.
5. **Galería mobile** — se ve bien; menú button pequeño; repetición de fotos obvia (intencional por duplicación).
6. **Proyectos** — layout alternado sólido, CTAs claros; grain+bordes rojos OK marca.
7. **Acerca** — se siente vacía; scramble sobre stub empeora la percepción de “incompleto”.
8. **Stress rapid open/close menú** — no crasheó; consola limpia.
9. **Console** — 0 errors / 0 warnings / 0 pageerrors en el recorrido principal.

---

## Lo que ya está bien (no tocar sin motivo)

- Switch exhaustivo `never` en views / enter actions  
- Focus trap + `inert`/`aria-hidden` del hero cuando el menú está abierto  
- `prefers-reduced-motion` respetado en Motion, Lenis, Scramble, strips (en gran parte)  
- Assets relativos + rewrite Rollup para GH Pages  
- `robots.txt` + `sitemap.xml` en deploy  
- Links externos con `noopener noreferrer`  
- Escape en galería cierra lightbox antes de salir  
- Workflow Pages + `npm run build` con typecheck  

---

## Orden de ataque recomendado

1. P0-1 routing + titles  
2. P1-1 Enter/Cerrar + P1-2 lightbox focus + P1-3 focus al entrar  
3. P0-2 comprimir home*.webp  
4. P0-3 reducir/virtualizar galería  
5. P1-4 Acerca real o ocultar  
6. P1-6 / P1-7 OG + favicons  
7. P1-8…P1-12 resto de P1  
8. P2 según tiempo  

---

## Prompt maestro (si querés que una IA haga toda la pasada P0+P1)

```
Sos el agente de fix pre-lanzamiento del repo hatemecha-web (React 19 + TS + Vite, build Rollup, GH Pages /hatemecha-web/).

Leé revision.md en la raíz. Implementá TODOS los ítems P0 y P1 en ese orden. No expandas a P2/P3 salvo que sea trivial colateral.

Reglas del repo (AGENTS.md):
- No duplicar page transitions en animejs (Motion presets).
- Views vía sectionViews + switch exhaustivo.
- Styles modulares bajo src/styles/.
- No commits a menos que te lo pida.

Verificación:
- npm run typecheck
- npm run build
- Smoke manual o Playwright: Back no abandona el sitio; Enter en Cerrar cierra; lightbox trap; home images <400KB transfer; galería sin cientos de tab stops; Acerca no dice "en progreso".

Reportá al final: archivos tocados, qué quedó pending, y cómo probar.
```

---

## Checklist “¿mañana sí?”

- [x] Back/forward y refresh por sección (hash `#/galeria`, etc.)
- [x] Menú home liviano en 3G/mobile (~100 KB vs ~3.3 MB)
- [x] Galería usable sin freír el dispositivo (≤140 tiles, tabIndex=-1)
- [x] Teclado: menú, enter, cerrar, lightbox
- [x] Acerca con contenido real (o fuera del menú)
- [x] OG/favicon decentes al compartir
- [x] Copy ES con acentos
- [x] `npm run build` + preview OK
- [x] Consola limpia en recorrido feliz

### Pendiente opcional (P2+)
- [x] Self-host fonts
- [x] Contraste hints / captions
- [x] Touch targets ~44px (signal slots + menu galería)
- [x] Prune gallery orphans en sync
- [x] Skip link en hero
- [x] Empty states projects/music
- [x] Grain bajo el UI
- [x] Project strip pausa offscreen
- [x] CI dist size budget
- Masters lightbox mid-size (P2-9) — pendiente si hace falta ahorrar más bandwidth
- Swipe menú mobile (P3)
