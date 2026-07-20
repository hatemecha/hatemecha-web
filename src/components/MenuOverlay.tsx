import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMenuPanelCodeTyping } from "../hooks/useMenuPanelCodeTyping";
import { normalizePortfolioSectionIndex, type PortfolioSection } from "../data/portfolioSections";
import { FloatingImages } from "./FloatingImages";
import { ScrambleText } from "./ScrambleText";

const CAROUSEL_RADIUS = 4;
const CAROUSEL_OPACITY_BY_DISTANCE = [1, 0.34, 0.18, 0.085, 0.035] as const;
const MENU_TITLE_ID = "menu-active-title";
const COARSE_POINTER_QUERY = "(pointer: coarse)";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function carouselOpacity(distance: number) {
  const opacityIndex = Math.min(Math.abs(distance), CAROUSEL_OPACITY_BY_DISTANCE.length - 1);
  return CAROUSEL_OPACITY_BY_DISTANCE[opacityIndex];
}

function carouselScale(distance: number) {
  const scale = 1 - Math.abs(distance) * 0.042;
  return Math.max(0.82, scale);
}

type MenuOverlayProps = {
  menuRef: RefObject<HTMLElement | null>;
  sections: readonly PortfolioSection[];
  activeIndex: number;
  isOpen: boolean;
  onSelectSection: (index: number) => void;
  onCloseMenu: () => void;
  onEnterSection: () => void;
};

export function MenuOverlay({
  menuRef,
  sections,
  activeIndex,
  isOpen,
  onSelectSection,
  onCloseMenu,
  onEnterSection
}: MenuOverlayProps) {
  const codeTopRef = useRef<HTMLPreElement>(null);
  const codeBottomRef = useRef<HTMLPreElement>(null);
  const enterButtonRef = useRef<HTMLButtonElement>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const activeSection = sections[activeIndex];
  const [controlsHint, setControlsHint] = useState("↑↓ ←→ · WASD · enter · rueda");

  useEffect(() => {
    const media = window.matchMedia(COARSE_POINTER_QUERY);
    const syncHint = () => {
      setControlsHint(media.matches ? "deslizá · lista · enter" : "↑↓ ←→ · WASD · enter · rueda");
    };
    syncHint();
    media.addEventListener("change", syncHint);
    return () => media.removeEventListener("change", syncHint);
  }, []);

  if (!activeSection) {
    throw new Error(`Invalid active portfolio section index: ${activeIndex}`);
  }

  const carouselSlots = useMemo(() => {
    return Array.from({ length: CAROUSEL_RADIUS * 2 + 1 }, (_, slotIndex) => {
      const offset = slotIndex - CAROUSEL_RADIUS;
      const sectionIndex = normalizePortfolioSectionIndex(activeIndex + offset);
      return {
        offset,
        sectionIndex,
        section: sections[sectionIndex]!
      };
    });
  }, [activeIndex, sections]);

  useMenuPanelCodeTyping(isOpen, activeSection.id, codeTopRef, codeBottomRef);

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleStagePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || event.pointerType === "mouse") return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absY < 48 && absX < 48) return;

    // Prefer the dominant axis: vertical swipe changes section (same as wheel).
    if (absY >= absX) {
      onSelectSection(activeIndex + (deltaY > 0 ? -1 : 1));
      return;
    }

    onSelectSection(activeIndex + (deltaX > 0 ? -1 : 1));
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrameId = window.requestAnimationFrame(() => {
      enterButtonRef.current?.focus();
    });

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const menuElement = menuRef.current;
      if (!menuElement) return;

      const focusableElements = Array.from(
        menuElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.offsetParent !== null);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        menuElement.focus();
        return;
      }

      if (!menuElement.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleFocusTrap);

    return () => {
      window.cancelAnimationFrame(focusFrameId);
      document.removeEventListener("keydown", handleFocusTrap);

      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen, menuRef]);

  return (
    <section
      className="fullscreenMenu"
      data-open={isOpen}
      data-active={activeSection.id}
      role="dialog"
      aria-modal={isOpen ? true : undefined}
      aria-labelledby={MENU_TITLE_ID}
      aria-hidden={!isOpen}
      tabIndex={-1}
      ref={menuRef}
    >
      <div className="menuRailWrap">
        <nav
          className="menuRail"
          aria-label="Secciones del portfolio"
          aria-describedby="menu-controls-hint"
        >
          {carouselSlots.map(({ offset, sectionIndex, section }) => {
            const isSelected = offset === 0;
            const distance = Math.abs(offset);
            const opacity = carouselOpacity(offset);
            const scale = carouselScale(offset);

            return (
              <button
                className="menuRailItem"
                type="button"
                key={`slot-${offset}`}
                aria-current={isSelected ? "true" : undefined}
                tabIndex={isSelected ? 0 : -1}
                data-distance={distance}
                style={
                  {
                    opacity,
                    "--carousel-scale": String(scale)
                  } as CSSProperties
                }
                onClick={() => onSelectSection(sectionIndex)}
              >
                {section.label}
              </button>
            );
          })}
        </nav>
        <ScrambleText
          id="menu-controls-hint"
          className="menuControlsHint"
          text={controlsHint}
          active={isOpen}
          delay={220}
          replayKey={isOpen ? `menu-controls-open-${controlsHint}` : "menu-controls-closed"}
          data-menu-in
        />
      </div>

      <div
        className="menuStage"
        onPointerDown={handleStagePointerDown}
        onPointerUp={handleStagePointerUp}
        onPointerCancel={() => {
          swipeStartRef.current = null;
        }}
      >
        <button
          className="menuClose"
          type="button"
          onClick={onCloseMenu}
          aria-label="Cerrar menú"
        >
          x
        </button>

        <article className="menuPanel">
          <pre
            ref={codeTopRef}
            className="menuCodeSnippet menuCodeSnippetTop"
            aria-hidden="true"
          />
          <ScrambleText
            className="menuKicker"
            text={activeSection.jaLabel}
            active={isOpen}
            delay={120}
            replayKey={`${activeSection.id}-${isOpen ? "open" : "closed"}`}
            data-menu-in
          />
          <h2 id={MENU_TITLE_ID} className="menuTitle" data-menu-in aria-live="polite">
            {activeSection.label}
          </h2>
          <ScrambleText
            className="menuCopy"
            text={activeSection.copy}
            active={isOpen}
            delay={260}
            replayKey={`${activeSection.id}-${isOpen ? "open" : "closed"}`}
            data-menu-in
          />
          <button
            className="enterButton"
            type="button"
            aria-label={`Entrar en ${activeSection.label}`}
            onClick={onEnterSection}
            ref={enterButtonRef}
            data-menu-in
          >
            enter
          </button>
          <pre
            ref={codeBottomRef}
            className="menuCodeSnippet menuCodeSnippetBottom"
            aria-hidden="true"
          />
        </article>

        <FloatingImages activeId={activeSection.id} />
      </div>
    </section>
  );
}
