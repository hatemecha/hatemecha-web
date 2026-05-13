export const portfolioSections = [
  {
    id: "home",
    label: "home",
    copy: "Esta pagina funciona como glosario"
  },
  {
    id: "proyectos",
    label: "proyectos",
    copy: "flyers / disenos / branding"
  },
  {
    id: "cv-skills",
    label: "cv & skills",
    copy: "flyers, disenos, branding, produccion musical, dibujo, fotografia y mas"
  },
  {
    id: "galeria",
    label: "galeria",
    copy: "dibujo / fotografia"
  },
  {
    id: "musica",
    label: "musica",
    copy: "produccion musical"
  },
  {
    id: "acerca",
    label: "acerca de",
    copy: "underground de bahia blanca"
  }
] as const;

export type PortfolioSectionId = (typeof portfolioSections)[number]["id"];

export type PortfolioSection = (typeof portfolioSections)[number];

export function normalizePortfolioSectionIndex(index: number) {
  const count = portfolioSections.length;
  return ((index % count) + count) % count;
}
