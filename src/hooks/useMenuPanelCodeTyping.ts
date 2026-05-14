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
  return Math.max(1400, Math.min(4600, code.length * 38));
}

function typeCodeSnippet(element: HTMLElement, code: string, delay: number) {
  return animateCodeRange(element, code, 0, code.length, getTypingDuration(code), delay);
}

function eraseCodeSnippet(element: HTMLElement, code: string, delay: number) {
  return animateCodeRange(element, code, code.length, 0, 900, delay);
}

function animateCodeRange(
  element: HTMLElement,
  code: string,
  from: number,
  to: number,
  duration: number,
  delay: number
) {
  const typing = { chars: from };

  return animate(typing, {
    chars: to,
    duration,
    delay,
    ease: "linear",
    onUpdate: () => {
      element.textContent = code.slice(0, Math.floor(typing.chars));
    },
    onComplete: () => {
      element.textContent = code.slice(0, to);
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

    const runTypingLoop = () => {
      clearAnimations(typingStateRef.current.animations);
      clearTimeouts(typingStateRef.current.timeoutIds);
      typingStateRef.current.animations = [];
      typingStateRef.current.timeoutIds = [];
      clearCodeSnippet(topEl);
      clearCodeSnippet(bottomEl);

      const topDelay = 160;
      const bottomDelay = 520;
      const topWriteDuration = getTypingDuration(pair.top);
      const bottomWriteDuration = getTypingDuration(pair.bottom);
      const writeDuration = Math.max(topDelay + topWriteDuration, bottomDelay + bottomWriteDuration);

      const topAnimation = typeCodeSnippet(topEl, pair.top, topDelay);
      const bottomAnimation = typeCodeSnippet(bottomEl, pair.bottom, bottomDelay);
      typingStateRef.current.animations = [topAnimation, bottomAnimation];

      const eraseTimeoutId = window.setTimeout(() => {
        const topEraseAnimation = eraseCodeSnippet(topEl, pair.top, 0);
        const bottomEraseAnimation = eraseCodeSnippet(bottomEl, pair.bottom, 140);
        typingStateRef.current.animations = [topEraseAnimation, bottomEraseAnimation];
      }, writeDuration + 1800);

      const nextLoopTimeoutId = window.setTimeout(runTypingLoop, writeDuration + 3350);
      typingStateRef.current.timeoutIds.push(eraseTimeoutId, nextLoopTimeoutId);
    };

    runTypingLoop();

    return () => {
      clearDom();
    };
  }, [isOpen, activeSectionId, topRef, bottomRef]);
}
