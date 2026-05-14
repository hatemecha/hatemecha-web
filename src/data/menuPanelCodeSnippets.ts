import type { PortfolioSectionId } from "./portfolioSections";

export type MenuPanelCodePair = {
  top: string;
  bottom: string;
};

/** Short repo excerpts — decorative only (see MenuOverlay aria-hidden). */
export const menuPanelCodeBySection: Record<PortfolioSectionId, MenuPanelCodePair> = {
  home: {
    top: `function carouselScale(distance: number) {
  const scale = 1 - Math.abs(distance) * 0.042;
  return Math.max(0.82, scale);
}`,
    bottom: `function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}`
  },
  proyectos: {
    top: `function normalizePortfolioSectionIndex(index: number) {
  const count = portfolioSections.length;
  return ((index % count) + count) % count;
}`,
    bottom: `function carouselOpacity(distance: number) {
  const opacityIndex = Math.min(
    Math.abs(distance),
    CAROUSEL_OPACITY_BY_DISTANCE.length - 1
  );
  return CAROUSEL_OPACITY_BY_DISTANCE[opacityIndex];
}`
  },
  "cv-skills": {
    top: `function clearCodeSnippet(element: HTMLElement) {
  element.replaceChildren();
}`,
    bottom: `function clearTimeouts(timeoutIds: TimeoutId[]) {
  timeoutIds.forEach((timeoutId) =>
    window.clearTimeout(timeoutId)
  );
}`
  },
  galeria: {
    top: `function createCodeLine(line: string) {
  const lineElement = document.createElement("span");
  lineElement.className = "menuCodeLine";
  lineElement.textContent = line.length > 0 ? line : " ";
  return lineElement;
}`,
    bottom: `function getConnectionY(rect: Rect) {
  return Math.round(rect.y + rect.h / 2);
}`
  },
  musica: {
    top: `function getFrameRect(frame: HTMLElement, containerRect: DOMRect) {
  const frameRect = frame.getBoundingClientRect();
  return {
    x: frameRect.left - containerRect.left,
    y: frameRect.top - containerRect.top,
    w: frameRect.width,
    h: frameRect.height
  };
}`,
    bottom: `function getPhotoAspectRatio(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    throw new Error("Photo dimensions must be positive.");
  }
  return \`\${width} / \${height}\`;
}`
  },
  acerca: {
    top: `function renderCodeLines(element: HTMLElement, code: string) {
  return code.split("\\n").map((line) =>
    element.append(createCodeLine(line))
  );
}`,
    bottom: `function getConnectionY(rect: Rect) {
  return Math.round(rect.y + rect.h / 2);
}`
  }
};
