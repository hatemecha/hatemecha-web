import { useEffect, useRef, type RefObject } from "react";
import type { PortfolioSectionId } from "../data/portfolioSections";
import { menuPanelCodeBySection } from "../data/menuPanelCodeSnippets";

type TimeoutId = ReturnType<typeof window.setTimeout>;

type TypingState = {
  timeoutIds: TimeoutId[];
};

function clearCodeSnippet(element: HTMLElement) {
  element.replaceChildren();
}

function createCodeLine(line: string) {
  const lineElement = document.createElement("span");
  lineElement.className = "menuCodeLine";
  lineElement.textContent = line.length > 0 ? line : " ";
  return lineElement;
}

function renderCodeLines(element: HTMLElement, code: string, initialDelay: number, lineDelay: number) {
  const timeoutIds: TimeoutId[] = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const timeoutId = window.setTimeout(() => {
      element.append(createCodeLine(line));
    }, initialDelay + index * lineDelay);

    timeoutIds.push(timeoutId);
  });

  return timeoutIds;
}

function clearTimeouts(timeoutIds: TimeoutId[]) {
  timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
}

export function useMenuPanelCodeTyping(
  isOpen: boolean,
  activeSectionId: PortfolioSectionId,
  topRef: RefObject<HTMLElement | null>,
  bottomRef: RefObject<HTMLElement | null>
) {
  const typingStateRef = useRef<TypingState>({ timeoutIds: [] });

  useEffect(() => {
    const topEl = topRef.current;
    const bottomEl = bottomRef.current;
    if (!topEl || !bottomEl) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearDom = () => {
      clearTimeouts(typingStateRef.current.timeoutIds);
      typingStateRef.current = { timeoutIds: [] };
      clearCodeSnippet(topEl);
      clearCodeSnippet(bottomEl);
    };

    if (!isOpen) {
      clearDom();
      return;
    }

    const pair = menuPanelCodeBySection[activeSectionId];
    if (reducedMotion) {
      topEl.textContent = pair.top;
      bottomEl.textContent = pair.bottom;
      return () => {
        clearDom();
      };
    }

    const topTimeoutIds = renderCodeLines(topEl, pair.top, 120, 115);
    const bottomTimeoutIds = renderCodeLines(bottomEl, pair.bottom, 260, 115);
    typingStateRef.current = { timeoutIds: [...topTimeoutIds, ...bottomTimeoutIds] };

    return () => {
      clearDom();
    };
  }, [isOpen, activeSectionId, topRef, bottomRef]);
}
