import { useCallback, useEffect, useRef } from "react";
import { animate } from "animejs/animation";

/** Hero/menu enter + arrow pulse via animejs. Page/view transitions use Motion presets. */
export function useAnimeMotion(isMenuOpen: boolean, menuMotionKey: number) {
  const heroRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpenRef = useRef(false);

  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animation = animate(heroElement.querySelectorAll("[data-hero-in]"), {
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 920,
      delay: (_target: unknown, index: number) => index * 105,
      ease: "out(3)"
    });

    return () => {
      animation.revert();
    };
  }, []);

  useEffect(() => {
    const menuElement = menuRef.current;
    const openedNow = isMenuOpen && !wasMenuOpenRef.current;
    wasMenuOpenRef.current = isMenuOpen;

    if (!menuElement || !isMenuOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targetSelector = openedNow
      ? "[data-menu-in]:not(.menuRailItem), .floatingImages"
      : ".menuPanel [data-menu-in], .floatingImages";

    const animation = animate(menuElement.querySelectorAll(targetSelector), {
      opacity: [0, 1],
      translateY: [openedNow ? -18 : 14, 0],
      duration: openedNow ? 740 : 520,
      delay: (_target: unknown, index: number) => index * (openedNow ? 52 : 36),
      ease: "out(3)"
    });

    return () => {
      animation.revert();
    };
  }, [isMenuOpen, menuMotionKey]);

  const pulseArrow = useCallback(() => {
    const arrowElement = arrowRef.current;
    if (!arrowElement || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const arrowGlyph = arrowElement.querySelector<HTMLElement>(".menuArrowGlyph") ?? arrowElement;

    animate(arrowGlyph, {
      translateY: [
        { to: 12, duration: 140 },
        { to: 0, duration: 360 }
      ],
      scale: [
        { to: 0.96, duration: 140 },
        { to: 1, duration: 360 }
      ],
      ease: "out(3)"
    });
  }, []);

  return {
    heroRef,
    menuRef,
    arrowRef,
    pulseArrow
  };
}
