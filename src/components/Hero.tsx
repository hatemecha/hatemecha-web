import type { CSSProperties, RefObject } from "react";
import { visualAssets } from "../data/assets";
import { socialLinks } from "../data/socialLinks";

type HeroProps = {
  hateRef: RefObject<HTMLSpanElement | null>;
  mechaRef: RefObject<HTMLSpanElement | null>;
  slotStyle: CSSProperties;
  heroRef: RefObject<HTMLElement | null>;
  arrowRef: RefObject<HTMLButtonElement | null>;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
};

export function Hero({
  hateRef,
  mechaRef,
  slotStyle,
  heroRef,
  arrowRef,
  isMenuOpen,
  onOpenMenu
}: HeroProps) {
  return (
    <section
      className="hero"
      aria-label="Portada"
      aria-hidden={isMenuOpen}
      inert={isMenuOpen}
      ref={heroRef}
    >
      <a className="skipLink" href="#hero-open-menu">
        Saltar a abrir menú
      </a>
      <div className="heroTopBar" data-hero-in>
        <a
          className="heroSocialLink"
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <svg className="heroSocialIcon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            />
          </svg>
        </a>
        <a
          className="heroSocialLink"
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <svg className="heroSocialIcon" viewBox="0 0 24 24" aria-hidden="true">
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        </a>
      </div>

      <div className="heroLockup" style={slotStyle}>
        <h1 className="brandTitle" aria-label="Hatemecha" data-hero-in>
          <span className="brandWord" ref={hateRef}>
            HATE
          </span>
          <span className="brandWord" ref={mechaRef}>
            MECHA
          </span>
        </h1>

        <div className="signalSlots" aria-label="Abrir menú" data-hero-in>
          <button
            className="signalSlot signalSlotEyes"
            type="button"
            aria-label="Abrir menú"
            onClick={onOpenMenu}
          >
            <img src={visualAssets.menuEyesStrip} alt="" draggable="false" />
          </button>
          <button
            className="signalSlot signalSlotBarcode"
            type="button"
            aria-label="Abrir menú"
            onClick={onOpenMenu}
          >
            <img src={visualAssets.barcode} alt="" draggable="false" />
          </button>
        </div>
      </div>

      <button
        className="menuArrow"
        type="button"
        id="hero-open-menu"
        aria-label="Abrir menú"
        onClick={onOpenMenu}
        ref={arrowRef}
        data-hero-in
      >
        <span className="menuArrowGlyph" aria-hidden="true">
          <svg
            className="menuArrowSvg"
            viewBox="0 0 48 72"
            width="48"
            height="72"
            focusable="false"
            aria-hidden="true"
          >
            <path
              d="M6 22 L24 48 L42 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </span>
      </button>
    </section>
  );
}
