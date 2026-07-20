import { useEffect, useRef, type RefObject } from "react";
import { animate } from "animejs/animation";
import type { PortfolioSectionId } from "../data/portfolioSections";
import { menuPanelCodeBySection } from "../data/menuPanelCodeSnippets";

type TimeoutId = ReturnType<typeof window.setTimeout>;

type AnimeAnimation = {
  revert: () => unknown;
};

type TypingState = {
  animations: AnimeAnimation[];
  timeoutIds: TimeoutId[];
};

function clearCodeSnippet(element: HTMLElement) {
  element.textContent = "";
}

function getTypingDuration(code: string) {
  return Math.max(1200, Math.min(3600, code.length * 36));
}

function typeCodeSnippet(element: HTMLElement, code: string, delay: number) {
  const typing = { chars: 0 };
  let lastCharCount = -1;

  return animate(typing, {
    chars: code.length,
    duration: getTypingDuration(code),
    delay,
    ease: "linear",
    onUpdate: () => {
      const charCount = Math.floor(typing.chars);
      if (charCount === lastCharCount) return;

      lastCharCount = charCount;
      element.textContent = code.slice(0, charCount);
    },
    onComplete: () => {
      element.textContent = code;
    }
  });
}

function clearAnimations(animations: AnimeAnimation[]) {
  animations.forEach((animation) => animation.revert());
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
  const typingStateRef = useRef<TypingState>({ animations: [], timeoutIds: [] });

  useEffect(() => {
    const topEl = topRef.current;
    const bottomEl = bottomRef.current;
    if (!topEl || !bottomEl) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearDom = () => {
      clearAnimations(typingStateRef.current.animations);
      clearTimeouts(typingStateRef.current.timeoutIds);
      typingStateRef.current = { animations: [], timeoutIds: [] };
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

    // Type once per open/section — no erase/retype loop (that caused flicker).
    clearDom();
    typingStateRef.current.animations = [
      typeCodeSnippet(topEl, pair.top, 160),
      typeCodeSnippet(bottomEl, pair.bottom, 480)
    ];

    return () => {
      clearDom();
    };
  }, [isOpen, activeSectionId, topRef, bottomRef]);
}
