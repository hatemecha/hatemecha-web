import type { PortfolioSectionId } from "./portfolioSections";

export type MenuPanelCodePair = {
  top: string;
  bottom: string;
};

/** Short repo excerpts — keep ≤4 short lines for `.menuCodeSnippet` (4× line-height). */
export const menuPanelCodeBySection: Record<PortfolioSectionId, MenuPanelCodePair> = {
  home: {
    top: `function carouselScale(d: number) {
  const scale = 1 - Math.abs(d) * 0.042;
  return Math.max(0.82, scale);
}`,
    bottom: `function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}`
  },
  proyectos: {
    top: `function normalizeIndex(index: number) {
  const n = portfolioSections.length;
  return ((index % n) + n) % n;
}`,
    bottom: `function carouselOpacity(d: number) {
  const i = Math.min(Math.abs(d), 4);
  return OPACITY[i];
}`
  },
  "cv-skills": {
    top: `function clearCodeSnippet(el: HTMLElement) {
  el.replaceChildren();
}`,
    bottom: `function clearTimeouts(ids: TimeoutId[]) {
  ids.forEach((id) => clearTimeout(id));
}`
  },
  galeria: {
    top: `function createCodeLine(line: string) {
  const el = document.createElement("span");
  Object.assign(el, { className: "menuCodeLine", textContent: line || " " });
}`,
    bottom: `function getConnectionY(rect: Rect) {
  return Math.round(rect.y + rect.h / 2);
}`
  },
  musica: {
    top: `function getFrameRect(frame: HTMLElement, box: DOMRect) {
  const r = frame.getBoundingClientRect();
  return { x: r.left - box.left, y: r.top - box.top };
}`,
    bottom: `function getPhotoAspectRatio(w: number, h: number) {
  return \`\${w} / \${h}\`;
}`
  },
  acerca: {
    top: `function renderCodeLines(el: HTMLElement, code: string) {
  code.split("\\n").forEach((line) => el.append(createCodeLine(line)));
}`,
    bottom: `function getConnectionY(rect: Rect) {
  return Math.round(rect.y + rect.h / 2);
}`
  }
};
