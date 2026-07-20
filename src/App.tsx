import { useCallback, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CvSkillsPage } from "./components/CvSkillsPage";
import { GalleryPage } from "./components/GalleryPage";
import { Hero } from "./components/Hero";
import { MenuOverlay } from "./components/MenuOverlay";
import { MusicPage } from "./components/MusicPage";
import { ProjectsPage } from "./components/ProjectsPage";
import { SectionPage } from "./components/SectionPage";
import { normalizePortfolioSectionIndex, portfolioSections } from "./data/portfolioSections";
import {
  getSectionEnterAction,
  getSectionIndexForView,
  type AppView
} from "./data/sectionViews";
import { useAnimeMotion } from "./hooks/useAnimeMotion";
import { useMeasuredTitleSlots } from "./hooks/useMeasuredTitleSlots";
import { useMenuControls } from "./hooks/useMenuControls";
import { viewMotion } from "./motion/presets";

const sectionCount: number = portfolioSections.length;

function getNormalizedSectionIndex(index: number) {
  if (!Number.isInteger(index)) {
    throw new Error(`Section index must be an integer. Received: ${index}`);
  }

  if (sectionCount === 0) {
    throw new Error("At least one portfolio section is required.");
  }

  return normalizePortfolioSectionIndex(index);
}

type ViewHandlers = {
  isMenuOpen: boolean;
  activeIndex: number;
  hateRef: ReturnType<typeof useMeasuredTitleSlots>["hateRef"];
  mechaRef: ReturnType<typeof useMeasuredTitleSlots>["mechaRef"];
  slotStyle: ReturnType<typeof useMeasuredTitleSlots>["slotStyle"];
  heroRef: ReturnType<typeof useAnimeMotion>["heroRef"];
  menuRef: ReturnType<typeof useAnimeMotion>["menuRef"];
  arrowRef: ReturnType<typeof useAnimeMotion>["arrowRef"];
  openMenu: () => void;
  closeMenu: () => void;
  selectSection: (index: number) => void;
  enterSection: () => void;
  returnToSectionMenu: (sectionIndex: number) => void;
};

function renderActiveView(activeView: AppView, handlers: ViewHandlers): ReactNode {
  switch (activeView) {
    case "home":
      return (
        <motion.div className="appView appViewHome" key="home" {...viewMotion}>
          <Hero
            hateRef={handlers.hateRef}
            mechaRef={handlers.mechaRef}
            slotStyle={handlers.slotStyle}
            heroRef={handlers.heroRef}
            arrowRef={handlers.arrowRef}
            isMenuOpen={handlers.isMenuOpen}
            onOpenMenu={handlers.openMenu}
          />
          <MenuOverlay
            menuRef={handlers.menuRef}
            sections={portfolioSections}
            activeIndex={handlers.activeIndex}
            isOpen={handlers.isMenuOpen}
            onSelectSection={handlers.selectSection}
            onCloseMenu={handlers.closeMenu}
            onEnterSection={handlers.enterSection}
          />
        </motion.div>
      );
    case "gallery":
      return (
        <motion.div className="appView" key="gallery" {...viewMotion}>
          <GalleryPage
            onBackToMenu={() => handlers.returnToSectionMenu(getSectionIndexForView("gallery"))}
          />
        </motion.div>
      );
    case "projects":
      return (
        <motion.div className="appView" key="projects" {...viewMotion}>
          <ProjectsPage
            onBackToMenu={() => handlers.returnToSectionMenu(getSectionIndexForView("projects"))}
          />
        </motion.div>
      );
    case "cv-skills":
      return (
        <motion.div className="appView" key="cv-skills" {...viewMotion}>
          <CvSkillsPage
            onBackToMenu={() => handlers.returnToSectionMenu(getSectionIndexForView("cv-skills"))}
          />
        </motion.div>
      );
    case "musica":
      return (
        <motion.div className="appView" key="musica" {...viewMotion}>
          <MusicPage
            onBackToMenu={() => handlers.returnToSectionMenu(getSectionIndexForView("musica"))}
          />
        </motion.div>
      );
    case "acerca":
      return (
        <motion.div className="appView" key="acerca" {...viewMotion}>
          <SectionPage
            sectionId="acerca"
            onBackToMenu={() => handlers.returnToSectionMenu(getSectionIndexForView("acerca"))}
          />
        </motion.div>
      );
    default: {
      const _exhaustive: never = activeView;
      throw new Error(`Unhandled app view: ${String(_exhaustive)}`);
    }
  }
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeView, setActiveView] = useState<AppView>("home");
  const { hateRef, mechaRef, slotStyle } = useMeasuredTitleSlots();
  const { heroRef, menuRef, arrowRef, pulseArrow } = useAnimeMotion(isMenuOpen, activeIndex);

  const openMenu = useCallback(() => {
    pulseArrow();
    setIsMenuOpen(true);
  }, [pulseArrow]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const returnToSectionMenu = useCallback((sectionIndex: number) => {
    setActiveIndex(sectionIndex);
    setActiveView("home");
    setIsMenuOpen(true);
  }, []);

  const enterSection = useCallback(() => {
    const section = portfolioSections[activeIndex];

    if (!section) {
      throw new Error(`Invalid active portfolio section index: ${activeIndex}`);
    }

    const enterAction = getSectionEnterAction(section.id);

    switch (enterAction.type) {
      case "close-menu":
        setIsMenuOpen(false);
        return;
      case "open-view":
        setActiveView(enterAction.view);
        setIsMenuOpen(false);
        return;
      default: {
        const _exhaustive: never = enterAction;
        throw new Error(`Unhandled section enter action: ${String(_exhaustive)}`);
      }
    }
  }, [activeIndex]);

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
    enterSection,
    activatePrevious,
    activateNext
  });

  return (
    <main className="appShell" data-menu-open={isMenuOpen} data-view={activeView}>
      <AnimatePresence mode="wait" initial={false}>
        {renderActiveView(activeView, {
          isMenuOpen,
          activeIndex,
          hateRef,
          mechaRef,
          slotStyle,
          heroRef,
          menuRef,
          arrowRef,
          openMenu,
          closeMenu,
          selectSection,
          enterSection,
          returnToSectionMenu
        })}
      </AnimatePresence>
    </main>
  );
}
