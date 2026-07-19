# Music + CV/Skills pages — design

Date: 2026-07-18  
Status: approved (conversation) — pending user review of this file

## Goal

Replace the stub pages for **musica** and **cv-skills** with real content. Leave **acerca** as stub.

## Decisions

| Topic | Choice |
|--------|--------|
| Music UX | Cover grid; each album opens Bandcamp in a new tab (no embeds) |
| CV structure | Short bio + 3 plain-language skill blocks + outbound links (no repo list; projects stay on Proyectos) |
| Copy | Static Spanish, hatemecha tone, readable for a general audience |
| Data | Static modules under `src/data/`; covers as local WebP |
| Routing | Unchanged (React view state only) |

## Music page

### Content

- Intro line pointing people to Bandcamp.
- Grid of 4 albums (Bandcamp order):
  1. *delirios de grandeza* — trshgab, alex dlarg
  2. *19*
  3. *neogab*
  4. *MORI SOMNIA NON MEMORIAS*
- Each tile: square cover, title, credits when present, clear “escuchar” affordance linking to the album URL.
- Footer link: “ver todo en bandcamp” → `https://hatemecha.bandcamp.com/`

### Data

`src/data/albums.ts`:

```ts
type Album = {
  id: string;
  title: string;
  credits?: string;
  coverSrc: string; // public/assets/music/*.webp
  bandcampUrl: string;
};
```

Covers live in `public/assets/music/` as WebP (downloaded once from Bandcamp; no hotlinking).

### UI

- `MusicPage` inside existing `PortfolioPageShell` (same chrome as Projects).
- Industrial look: square covers, mono metadata, accent borders — no soft cards/shadows.
- Styles in `src/styles/pages.css` (and responsive rules if needed).

## CV & skills page

### Bio (approved)

> Experimentos, vibe coding y proyectos personales desde Bahía Blanca. Diseño interfaces, armo prototipos y construyo herramientas que empiezan siendo para mí y después publico. También trabajo con fotografía, imagen y producción musical.

### Skill blocks

Labels in plain language (not brand badge rows):

1. **código** — webs, herramientas en el navegador, prototipos (JS/TS, React; Python/PHP when needed)
2. **foto / imagen** — fotografía, dibujo, dirección visual
3. **música** — producción, releases en Bandcamp

### Links

- GitHub: `https://github.com/hatemecha`
- Bandcamp: `https://hatemecha.bandcamp.com/`
- Instagram: existing `socialLinks.instagram` if already wired in the app

No curated repo list on this page (overlap with Proyectos).

### Data

`src/data/cvSkills.ts` — bio string, skill blocks, link list.

### UI

- `CvSkillsPage` inside `PortfolioPageShell`.
- One scrollable composition: bio → skills → links.
- Same motion presets family as other portfolio pages.

## App wiring

- `App.tsx`: `musica` → `MusicPage`; `cv-skills` → `CvSkillsPage`; `acerca` still `SectionPage`.
- `SectionPage` type narrowed to `acerca` only (or keep current exclude list but only used for acerca).
- Menu / `sectionViews` unchanged.

## Out of scope

- Acerca content
- Bandcamp embeds / GitHub API / live fetch
- Client-side URL routing / deep links
- Changing Projects or Gallery

## Success criteria

- From the menu, música shows the 4 albums and opens the correct Bandcamp pages.
- CV shows the approved bio, three skill blocks, and working external links.
- Acerca still shows “contenido en progreso”.
- Visual language matches Projects (shell, tokens, industrial UI).
- `npm run typecheck` passes.
