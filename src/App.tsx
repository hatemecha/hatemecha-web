import { useCallback, useEffect, useState, type ReactNode } from "react";
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
import {
  applyDocumentTitle,
  parseAppHash,
  sectionIndexForId,
  writeAppHash,
  type AppHashLocation
} from "./routing/appHashRoute";

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

function stateFromLocation(location: AppHashLocation) {
  switch (location.kind) {
    case "home":
      return { activeView: "home" as const, isMenuOpen: false, activeIndex: 0 };
    case "menu":
      return {
        activeView: "home" as const,
        isMenuOpen: true,
        activeIndex: sectionIndexForId(location.sectionId)
      };
    case "view":
      return {
        activeView: location.view,
        isMenuOpen: false,
        activeIndex: getSectionIndexForView(location.view)
      };
    default: {
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }
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
  const initialLocation = parseAppHash();
  const initialState = stateFromLocation(initialLocation);
  const [isMenuOpen, setIsMenuOpen] = useState(initialState.isMenuOpen);
  const [activeIndex, setActiveIndex] = useState(initialState.activeIndex);
  const [activeView, setActiveView] = useState<AppView>(initialState.activeView);
  const { hateRef, mechaRef, slotStyle } = useMeasuredTitleSlots();
  const { heroRef, menuRef, arrowRef, pulseArrow } = useAnimeMotion(isMenuOpen, activeIndex);

  useEffect(() => {
    applyDocumentTitle(parseAppHash());

    const syncFromHash = () => {
      const next = stateFromLocation(parseAppHash());
      setActiveView(next.activeView);
      setIsMenuOpen(next.isMenuOpen);
      setActiveIndex(next.activeIndex);
      applyDocumentTitle(parseAppHash());
    };

    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const openMenu = useCallback(() => {
    pulseArrow();
    const section = portfolioSections[activeIndex] ?? portfolioSections[0];
    setIsMenuOpen(true);
    writeAppHash({ kind: "menu", sectionId: section!.id }, "push");
  }, [activeIndex, pulseArrow]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    writeAppHash({ kind: "home", menuOpen: false }, "push");
  }, []);

  const returnToSectionMenu = useCallback((sectionIndex: number) => {
    const normalized = getNormalizedSectionIndex(sectionIndex);
    const section = portfolioSections[normalized];
    if (!section) {
      throw new Error(`Invalid portfolio section index: ${normalized}`);
    }

    setActiveIndex(normalized);
    setActiveView("home");
    setIsMenuOpen(true);
    writeAppHash({ kind: "menu", sectionId: section.id }, "push");
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
        writeAppHash({ kind: "home", menuOpen: false }, "push");
        return;
      case "open-view":
        setActiveView(enterAction.view);
        setIsMenuOpen(false);
        writeAppHash({ kind: "view", view: enterAction.view }, "push");
        return;
      default: {
        const _exhaustive: never = enterAction;
        throw new Error(`Unhandled section enter action: ${String(_exhaustive)}`);
      }
    }
  }, [activeIndex]);

  const activatePrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      const next = getNormalizedSectionIndex(currentIndex - 1);
      const section = portfolioSections[next];
      if (section && isMenuOpen) {
        writeAppHash({ kind: "menu", sectionId: section.id }, "replace");
      }
      return next;
    });
  }, [isMenuOpen]);

  const activateNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      const next = getNormalizedSectionIndex(currentIndex + 1);
      const section = portfolioSections[next];
      if (section && isMenuOpen) {
        writeAppHash({ kind: "menu", sectionId: section.id }, "replace");
      }
      return next;
    });
  }, [isMenuOpen]);

  const selectSection = useCallback(
    (index: number) => {
      const next = getNormalizedSectionIndex(index);
      const section = portfolioSections[next];
      setActiveIndex(next);
      if (section && isMenuOpen) {
        writeAppHash({ kind: "menu", sectionId: section.id }, "replace");
      }
    },
    [isMenuOpen]
  );

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
