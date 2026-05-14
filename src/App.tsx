import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GalleryPage } from "./components/GalleryPage";
import { Hero } from "./components/Hero";
import { MenuOverlay } from "./components/MenuOverlay";
import { ProjectsPage } from "./components/ProjectsPage";
import { normalizePortfolioSectionIndex, portfolioSections } from "./data/portfolioSections";
import { useAnimeMotion } from "./hooks/useAnimeMotion";
import { useMeasuredTitleSlots } from "./hooks/useMeasuredTitleSlots";
import { useMenuControls } from "./hooks/useMenuControls";

const sectionCount: number = portfolioSections.length;
const gallerySectionIndex = portfolioSections.findIndex((section) => section.id === "galeria");
const projectsSectionIndex = portfolioSections.findIndex((section) => section.id === "proyectos");
const viewTransition = {
  duration: 0.64,
  ease: [0.16, 1, 0.3, 1]
} as const;
const viewMotion = {
  initial: { opacity: 0, y: 28, scale: 0.992 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -22, scale: 0.992 },
  transition: viewTransition
} as const;

if (gallerySectionIndex < 0) {
  throw new Error("The gallery section is required.");
}

if (projectsSectionIndex < 0) {
  throw new Error("The projects section is required.");
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
  const [activeView, setActiveView] = useState<"home" | "gallery" | "projects">("home");
  const { hateRef, mechaRef, slotStyle } = useMeasuredTitleSlots();
  const { heroRef, menuRef, arrowRef, pulseArrow } = useAnimeMotion(isMenuOpen, activeIndex);

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

  const openProjects = useCallback(() => {
    setActiveView("projects");
    setIsMenuOpen(false);
  }, []);

  const returnToSectionMenu = useCallback((sectionIndex: number) => {
    setActiveIndex(sectionIndex);
    setActiveView("home");
    setIsMenuOpen(true);
  }, []);

  const returnToGalleryMenu = useCallback(() => {
    returnToSectionMenu(gallerySectionIndex);
  }, [returnToSectionMenu]);

  const returnToProjectsMenu = useCallback(() => {
    returnToSectionMenu(projectsSectionIndex);
  }, [returnToSectionMenu]);

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
      <AnimatePresence mode="wait" initial={false}>
        {activeView === "gallery" ? (
          <motion.div className="appView" key="gallery" {...viewMotion}>
            <GalleryPage onBackToMenu={returnToGalleryMenu} />
          </motion.div>
        ) : activeView === "projects" ? (
          <motion.div className="appView" key="projects" {...viewMotion}>
            <ProjectsPage onBackToMenu={returnToProjectsMenu} />
          </motion.div>
        ) : (
          <motion.div className="appView appViewHome" key="home" {...viewMotion}>
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
              onOpenProjects={openProjects}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
