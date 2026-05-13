import { useEffect, useRef } from "react";

type UseMenuControlsArgs = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  activatePrevious: () => void;
  activateNext: () => void;
};

const NEXT_KEYS = new Set(["ArrowDown", "ArrowRight", "s", "S", "d", "D"]);
const PREVIOUS_KEYS = new Set(["ArrowUp", "ArrowLeft", "w", "W", "a", "A"]);
const OPEN_KEYS = new Set(["Enter", "ArrowDown", "s", "S"]);

export function useMenuControls({
  isOpen,
  openMenu,
  closeMenu,
  activatePrevious,
  activateNext
}: UseMenuControlsArgs) {
  const wheelLockedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        if (OPEN_KEYS.has(event.key)) {
          event.preventDefault();
          openMenu();
        }
        return;
      }

      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (NEXT_KEYS.has(event.key)) {
        event.preventDefault();
        activateNext();
        return;
      }

      if (PREVIOUS_KEYS.has(event.key)) {
        event.preventDefault();
        activatePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activateNext, activatePrevious, closeMenu, isOpen, openMenu]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (!isOpen || wheelLockedRef.current || Math.abs(event.deltaY) < 1) return;

      wheelLockedRef.current = true;
      if (event.deltaY > 0) {
        activateNext();
      } else {
        activatePrevious();
      }

      window.setTimeout(() => {
        wheelLockedRef.current = false;
      }, 360);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [activateNext, activatePrevious, isOpen]);
}
