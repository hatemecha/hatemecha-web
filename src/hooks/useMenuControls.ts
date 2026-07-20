import { useEffect, useRef } from "react";

type UseMenuControlsArgs = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  enterSection: () => void;
  activatePrevious: () => void;
  activateNext: () => void;
};

const NEXT_KEYS = new Set(["ArrowDown", "ArrowRight", "s", "S", "d", "D"]);
const PREVIOUS_KEYS = new Set(["ArrowUp", "ArrowLeft", "w", "W", "a", "A"]);
const OPEN_KEYS = new Set(["Enter", "ArrowDown", "s", "S"]);
const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  "[role='button']",
  "[role='link']",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest(INTERACTIVE_SELECTOR));
}

export function useMenuControls({
  isOpen,
  openMenu,
  closeMenu,
  enterSection,
  activatePrevious,
  activateNext
}: UseMenuControlsArgs) {
  const wheelLockedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        if (!isInteractiveTarget(event.target) && OPEN_KEYS.has(event.key)) {
          event.preventDefault();
          openMenu();
        }
        return;
      }

      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key === "Enter" && !isEditableTarget(event.target)) {
        if (event.target instanceof HTMLElement) {
          // Native activation for close / enter controls.
          if (event.target.closest(".menuClose, .enterButton")) {
            return;
          }
        }

        event.preventDefault();
        enterSection();
        return;
      }

      if (!isEditableTarget(event.target) && NEXT_KEYS.has(event.key)) {
        event.preventDefault();
        activateNext();
        return;
      }

      if (!isEditableTarget(event.target) && PREVIOUS_KEYS.has(event.key)) {
        event.preventDefault();
        activatePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activateNext, activatePrevious, closeMenu, enterSection, isOpen, openMenu]);

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
