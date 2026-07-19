import type { ReactNode } from "react";
import { motion } from "motion/react";
import { pageContentVariants } from "../motion/presets";
import { useLenisScroll } from "../hooks/useLenisScroll";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { ScrambleText } from "./ScrambleText";

type PortfolioPageShellProps = {
  titleId: string;
  title: string;
  kicker: string;
  meta?: ReactNode;
  className: string;
  onBackToMenu: () => void;
  children: ReactNode;
  contentVariants?: typeof pageContentVariants;
  /** Set false when the page owns Escape (e.g. gallery lightbox). */
  escapeEnabled?: boolean;
};

export function PortfolioPageShell({
  titleId,
  title,
  kicker,
  meta,
  className,
  onBackToMenu,
  children,
  contentVariants = pageContentVariants,
  escapeEnabled = true
}: PortfolioPageShellProps) {
  const pageRef = useLenisScroll<HTMLElement>();

  useEscapeKey({ enabled: escapeEnabled, onEscape: onBackToMenu });

  const headerClassName = [
    "galleryHeader",
    "portfolioPageHeader",
    className.includes("projectsPage") ||
    className.includes("musicPage") ||
    className.includes("cvSkillsPage")
      ? "projectsHeader"
      : null
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={className} aria-labelledby={titleId} ref={pageRef}>
      <a className="skipLink" href={`#${titleId}`}>
        Saltar al contenido
      </a>
      <header className={headerClassName}>
        <div className="galleryHeaderMark">
          <ScrambleText className="galleryKicker" text={kicker} delay={80} />
          <h1 id={titleId} className="galleryTitle">
            {title}
          </h1>
        </div>
        <div className="galleryHeaderMeta">
          {meta}
          <button className="galleryBackButton" type="button" onClick={onBackToMenu}>
            menu
          </button>
        </div>
      </header>

      <motion.div
        className="smoothPageContent"
        data-lenis-content
        initial="hidden"
        animate="visible"
        variants={contentVariants}
      >
        {children}
      </motion.div>
    </section>
  );
}
