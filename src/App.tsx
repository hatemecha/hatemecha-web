import { useCallback, useState } from "react";
import { GalleryPage } from "./components/GalleryPage";
import { Hero } from "./components/Hero";
import { MenuOverlay } from "./components/MenuOverlay";
import { normalizePortfolioSectionIndex, portfolioSections } from "./data/portfolioSections";
import { useAnimeMotion } from "./hooks/useAnimeMotion";
import { useMeasuredTitleSlots } from "./hooks/useMeasuredTitleSlots";
import { useMenuControls } from "./hooks/useMenuControls";

const sectionCount: number = portfolioSections.length;
const gallerySectionIndex = portfolioSections.findIndex((section) => section.id === "galeria");

if (gallerySectionIndex < 0) {
  throw new Error("The gallery section is required.");
}

function getNormalizedSectionIndex(index: number) {
  if (!Number.isInteger(index)) {
    throw new Error(`Section index must be an integer. Received: ${index}`);
  }

  if (sectionCount === 0) {
    throw new Error("At least one portfolio section is required.");
  }

  return normalizePortfolioSectionIndex(index);
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeView, setActiveView] = useState<"home" | "gallery">("home");
  const { hateRef, mechaRef, slotStyle } = useMeasuredTitleSlots();
  const { heroRef, menuRef, arrowRef, pulseArrow } = useAnimeMotion(isMenuOpen);

  const openMenu = useCallback(() => {
    pulseArrow();
    setIsMenuOpen(true);
  }, [pulseArrow]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const openGallery = useCallback(() => {
    setActiveView("gallery");
    setIsMenuOpen(false);
  }, []);

  const returnToGalleryMenu = useCallback(() => {
    setActiveIndex(gallerySectionIndex);
    setActiveView("home");
    setIsMenuOpen(true);
  }, []);

  const activatePrevious = useCallback(() => {
    setActiveIndex((currentIndex) => getNormalizedSectionIndex(currentIndex - 1));
  }, []);

  const activateNext = useCallback(() => {
    setActiveIndex((currentIndex) => getNormalizedSectionIndex(currentIndex + 1));
  }, []);

  const selectSection = useCallback((index: number) => {
    setActiveIndex(getNormalizedSectionIndex(index));
  }, []);

  useMenuControls({
    isOpen: isMenuOpen,
    openMenu,
    closeMenu,
    activatePrevious,
    activateNext
  });

  return (
    <main className="appShell" data-menu-open={isMenuOpen} data-view={activeView}>
      {activeView === "gallery" ? (
        <GalleryPage onBackToMenu={returnToGalleryMenu} />
      ) : (
        <>
          <Hero
            hateRef={hateRef}
            mechaRef={mechaRef}
            slotStyle={slotStyle}
            heroRef={heroRef}
            arrowRef={arrowRef}
            isMenuOpen={isMenuOpen}
            onOpenMenu={openMenu}
          />
          <MenuOverlay
            menuRef={menuRef}
            sections={portfolioSections}
            activeIndex={activeIndex}
            isOpen={isMenuOpen}
            onSelectSection={selectSection}
            onCloseMenu={closeMenu}
            onOpenGallery={openGallery}
          />
        </>
      )}
    </main>
  );
}
