import type { CSSProperties, RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import { useMenuPanelCodeTyping } from "../hooks/useMenuPanelCodeTyping";
import { normalizePortfolioSectionIndex, type PortfolioSection } from "../data/portfolioSections";
import { FloatingImages } from "./FloatingImages";

const CAROUSEL_RADIUS = 4;
const CAROUSEL_OPACITY_BY_DISTANCE = [1, 0.34, 0.18, 0.085, 0.035] as const;
const MENU_TITLE_ID = "menu-active-title";
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
};

export function MenuOverlay({
  menuRef,
  sections,
  activeIndex,
  isOpen,
  onSelectSection,
  onCloseMenu
}: MenuOverlayProps) {
  const codeTopRef = useRef<HTMLPreElement>(null);
  const codeBottomRef = useRef<HTMLPreElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeSection = sections[activeIndex];

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

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrameId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
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
                aria-current={isSelected ? "page" : undefined}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                data-distance={distance}
                data-menu-in
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
        <p id="menu-controls-hint" className="menuControlsHint" data-menu-in>
          ↑↓ ←→ · WASD · rueda
        </p>
      </div>

      <div className="menuStage">
        <button
          className="menuClose"
          type="button"
          onClick={onCloseMenu}
          aria-label="Cerrar menú"
          ref={closeButtonRef}
        >
          x
        </button>

        <article className="menuPanel" aria-live="polite">
          <pre
            ref={codeTopRef}
            className="menuCodeSnippet menuCodeSnippetTop"
            aria-hidden="true"
          />
          <p className="menuKicker" data-menu-in>
            {activeSection.label}
          </p>
          <h2 id={MENU_TITLE_ID} className="menuTitle" data-menu-in>
            {activeSection.label}
          </h2>
          <p className="menuCopy" data-menu-in>
            {activeSection.copy}
          </p>
          <button
            className="enterButton"
            type="button"
            aria-label={`Entrar en ${activeSection.label}`}
            onClick={onCloseMenu}
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
