import { useCallback, useEffect, useRef } from "react";
import { animate } from "animejs/animation";

export function useAnimeMotion(isMenuOpen: boolean) {
  const heroRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animation = animate(heroElement.querySelectorAll("[data-hero-in]"), {
      opacity: [0, 1],
      translateY: [22, 0],
      duration: 760,
      delay: (_target: unknown, index: number) => index * 85,
      ease: "out(3)"
    });

    return () => {
      animation.revert();
    };
  }, []);

  useEffect(() => {
    const menuElement = menuRef.current;
    if (!menuElement || !isMenuOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animation = animate(menuElement.querySelectorAll("[data-menu-in]"), {
      opacity: [0, 1],
      translateY: [-12, 0],
      duration: 520,
      delay: (_target: unknown, index: number) => index * 48,
      ease: "out(3)"
    });

    return () => {
      animation.revert();
    };
  }, [isMenuOpen]);

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
