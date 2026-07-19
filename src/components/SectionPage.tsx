import { motion } from "motion/react";
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
        <p className="sectionPageNote">contenido en progreso — volvé al menú para seguir explorando.</p>
      </motion.div>
    </PortfolioPageShell>
  );
}
