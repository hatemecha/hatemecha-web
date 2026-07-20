import { motion } from "motion/react";
import { acercaPageContent } from "../data/acercaContent";
import { portfolioSections, type PortfolioSectionId } from "../data/portfolioSections";
import { pageItemVariants } from "../motion/presets";
import { PortfolioPageShell } from "./PortfolioPageShell";
import { ScrambleText } from "./ScrambleText";

type SectionPageProps = {
  sectionId: Extract<PortfolioSectionId, "acerca">;
  onBackToMenu: () => void;
};

const sectionPageClassName = {
  acerca: "sectionPage sectionPageAcerca"
} as const;

export function SectionPage({ sectionId, onBackToMenu }: SectionPageProps) {
  const section = portfolioSections.find((entry) => entry.id === sectionId);

  if (!section) {
    throw new Error(`Unknown section page: ${sectionId}`);
  }

  return (
    <PortfolioPageShell
      className={sectionPageClassName[sectionId]}
      titleId={`${sectionId}-title`}
      title={section.label}
      kicker={section.jaLabel}
      onBackToMenu={onBackToMenu}
    >
      <motion.div className="sectionPageBody" variants={pageItemVariants}>
        <ScrambleText className="sectionPageCopy" text={section.copy} delay={160} />
        {acercaPageContent.paragraphs.map((paragraph) => (
          <p className="sectionPageNote" key={paragraph}>
            {paragraph}
          </p>
        ))}
        <nav className="sectionPageLinks" aria-label="Contacto">
          {acercaPageContent.links.map((link) => (
            <a
              key={link.href}
              className="sectionPageLink"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </motion.div>
    </PortfolioPageShell>
  );
}
