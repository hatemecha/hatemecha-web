import { useEffect, useRef } from "react";
import Lenis from "lenis";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function useLenisScroll<T extends HTMLElement>() {
  const scrollRef = useRef<T>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || window.matchMedia(REDUCED_MOTION_QUERY).matches) return undefined;

    const contentElement = scrollElement.querySelector<HTMLElement>("[data-lenis-content]");
    if (!contentElement) return undefined;

    scrollElement.scrollTop = 0;

    const lenis = new Lenis({
      wrapper: scrollElement,
      content: contentElement,
      eventsTarget: scrollElement,
      smoothWheel: true,
      syncTouch: true,
      lerp: 0.085,
      wheelMultiplier: 0.86,
      touchMultiplier: 0.9,
      overscroll: false,
      autoRaf: true
    });

    lenis.scrollTo(0, { immediate: true });

    return () => {
      lenis.destroy();
    };
  }, []);

  return scrollRef;
}
