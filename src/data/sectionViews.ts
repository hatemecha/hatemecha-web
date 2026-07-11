import {
  portfolioSections,
  type PortfolioSectionId
} from "./portfolioSections";

export const appViews = [
  "home",
  "gallery",
  "projects",
  "cv-skills",
  "musica",
  "acerca"
] as const;

export type AppView = (typeof appViews)[number];

export type SectionEnterAction =
  | { type: "close-menu" }
  | { type: "open-view"; view: Exclude<AppView, "home"> };

export const sectionEnterActions = {
  home: { type: "close-menu" },
  proyectos: { type: "open-view", view: "projects" },
  "cv-skills": { type: "open-view", view: "cv-skills" },
  galeria: { type: "open-view", view: "gallery" },
  musica: { type: "open-view", view: "musica" },
  acerca: { type: "open-view", view: "acerca" }
} as const satisfies Record<PortfolioSectionId, SectionEnterAction>;

const viewToSectionId = {
  gallery: "galeria",
  projects: "proyectos",
  "cv-skills": "cv-skills",
  musica: "musica",
  acerca: "acerca"
} as const satisfies Record<Exclude<AppView, "home">, PortfolioSectionId>;

export function getSectionEnterAction(sectionId: PortfolioSectionId): SectionEnterAction {
  return sectionEnterActions[sectionId];
}

export function getSectionIndexForView(view: Exclude<AppView, "home">): number {
  const sectionId = viewToSectionId[view];
  const sectionIndex = portfolioSections.findIndex((section) => section.id === sectionId);

  if (sectionIndex < 0) {
    throw new Error(`Missing portfolio section for view: ${view}`);
  }

  return sectionIndex;
}
