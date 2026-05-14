export const portfolioSections = [
  {
    id: "home",
    label: "home",
    jaLabel: "ホーム",
    copy: "Esta pagina funciona como glosario"
  },
  {
    id: "proyectos",
    label: "proyectos",
    jaLabel: "プロジェクト",
    copy: "flyers / disenos / branding"
  },
  {
    id: "cv-skills",
    label: "cv & skills",
    jaLabel: "履歴とスキル",
    copy: "flyers, disenos, branding, produccion musical, dibujo, fotografia y mas"
  },
  {
    id: "galeria",
    label: "galeria",
    jaLabel: "ギャラリー",
    copy: "dibujo / fotografia"
  },
  {
    id: "musica",
    label: "musica",
    jaLabel: "音楽",
    copy: "produccion musical"
  },
  {
    id: "acerca",
    label: "acerca de",
    jaLabel: "自己紹介",
    copy: "underground de bahia blanca"
  }
] as const;

export type PortfolioSectionId = (typeof portfolioSections)[number]["id"];

export type PortfolioSection = (typeof portfolioSections)[number];

export function normalizePortfolioSectionIndex(index: number) {
  const count = portfolioSections.length;
  return ((index % count) + count) % count;
}
