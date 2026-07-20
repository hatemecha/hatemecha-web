import {
  portfolioSections,
  type PortfolioSectionId
} from "../data/portfolioSections";
import { type AppView } from "../data/sectionViews";

/** Hash routes — no GH Pages 404.html needed (vs path routes). */
export type AppHashLocation =
  | { kind: "home"; menuOpen: false }
  | { kind: "menu"; sectionId: PortfolioSectionId }
  | { kind: "view"; view: Exclude<AppView, "home"> };

const VIEW_HASH: Record<Exclude<AppView, "home">, string> = {
  gallery: "galeria",
  projects: "proyectos",
  "cv-skills": "cv-skills",
  musica: "musica",
  acerca: "acerca"
};

const HASH_TO_VIEW = Object.fromEntries(
  Object.entries(VIEW_HASH).map(([view, hash]) => [hash, view])
) as Record<string, Exclude<AppView, "home">>;

const VIEW_TITLE: Record<AppView, string> = {
  home: "Hatemecha — diseño, foto y proyectos",
  gallery: "Galería — Hatemecha",
  projects: "Proyectos — Hatemecha",
  "cv-skills": "CV & skills — Hatemecha",
  musica: "Música — Hatemecha",
  acerca: "Acerca de — Hatemecha"
};

function normalizeHash(rawHash: string) {
  return rawHash.replace(/^#/, "").replace(/^\/+|\/+$/g, "");
}

export function parseAppHash(rawHash: string = window.location.hash): AppHashLocation {
  const path = normalizeHash(rawHash);

  if (!path || path === "home") {
    return { kind: "home", menuOpen: false };
  }

  if (path === "menu") {
    return { kind: "menu", sectionId: "home" };
  }

  if (path.startsWith("menu/")) {
    const sectionId = path.slice("menu/".length) as PortfolioSectionId;
    const known = portfolioSections.some((section) => section.id === sectionId);
    return { kind: "menu", sectionId: known ? sectionId : "home" };
  }

  const view = HASH_TO_VIEW[path];
  if (view) {
    return { kind: "view", view };
  }

  return { kind: "home", menuOpen: false };
}

export function hashForLocation(location: AppHashLocation): string {
  switch (location.kind) {
    case "home":
      return "#/";
    case "menu":
      return location.sectionId === "home" ? "#/menu" : `#/menu/${location.sectionId}`;
    case "view":
      return `#/${VIEW_HASH[location.view]}`;
    default: {
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }
}

export function titleForLocation(location: AppHashLocation): string {
  switch (location.kind) {
    case "home":
    case "menu":
      return VIEW_TITLE.home;
    case "view":
      return VIEW_TITLE[location.view];
    default: {
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }
}

export function applyDocumentTitle(location: AppHashLocation) {
  document.title = titleForLocation(location);
}

export function writeAppHash(location: AppHashLocation, mode: "push" | "replace") {
  const nextHash = hashForLocation(location);
  const current = window.location.hash || "#/";
  if (current === nextHash || (current === "" && nextHash === "#/")) {
    applyDocumentTitle(location);
    return;
  }

  if (mode === "replace") {
    window.history.replaceState(null, "", nextHash);
  } else {
    window.history.pushState(null, "", nextHash);
  }

  applyDocumentTitle(location);
}

export function sectionIndexForId(sectionId: PortfolioSectionId): number {
  const index = portfolioSections.findIndex((section) => section.id === sectionId);
  return index >= 0 ? index : 0;
}
