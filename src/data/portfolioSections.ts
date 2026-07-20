export const portfolioSections = [
  {
    id: "home",
    label: "home",
    jaLabel: "ホーム",
    copy: "Esta página funciona como glosario"
  },
  {
    id: "proyectos",
    label: "proyectos",
    jaLabel: "プロジェクト",
    copy: "flyers / diseños / branding"
  },
  {
    id: "cv-skills",
    label: "cv & skills",
    jaLabel: "履歴とスキル",
    copy: "flyers, diseños, branding, producción musical, dibujo, fotografía y más"
  },
  {
    id: "galeria",
    label: "galeria",
    jaLabel: "ギャラリー",
    copy: "dibujo / fotografía"
  },
  {
    id: "musica",
    label: "musica",
    jaLabel: "音楽",
    copy: "producción musical"
  },
  {
    id: "acerca",
    label: "acerca de",
    jaLabel: "自己紹介",
    copy: "underground de Bahía Blanca"
  }
] as const;

export type PortfolioSectionId = (typeof portfolioSections)[number]["id"];

export type PortfolioSection = (typeof portfolioSections)[number];

export function normalizePortfolioSectionIndex(index: number) {
  const count = portfolioSections.length;
  return ((index % count) + count) % count;
}
