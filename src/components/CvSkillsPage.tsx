import { motion } from "motion/react";
import { cvBio, cvLinks, skillBlocks } from "../data/cvSkills";
import { pageItemVariants, projectsListVariants, projectTileVariants } from "../motion/presets";
import { PortfolioPageShell } from "./PortfolioPageShell";
import { ScrambleText } from "./ScrambleText";

type CvSkillsPageProps = {
  onBackToMenu: () => void;
};

export function CvSkillsPage({ onBackToMenu }: CvSkillsPageProps) {
  return (
    <PortfolioPageShell
      className="cvSkillsPage"
      titleId="cv-skills-title"
      title="cv & skills"
      kicker="履歴とスキル"
      onBackToMenu={onBackToMenu}
      contentVariants={projectsListVariants}
    >
      <motion.div className="cvLayout" variants={projectsListVariants}>
        <motion.p className="cvBio" variants={pageItemVariants}>
          <ScrambleText text={cvBio} delay={140} />
        </motion.p>

        <motion.ul className="cvSkillList" aria-label="Skills" variants={projectsListVariants}>
          {skillBlocks.map((block, index) => (
            <motion.li className="cvSkillBlock" key={block.id} variants={projectTileVariants}>
              <p className="cvSkillIndex" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="cvSkillLabel">{block.label}</h2>
              <p className="cvSkillBody">{block.body}</p>
            </motion.li>
          ))}
        </motion.ul>

        <motion.nav className="cvLinks" aria-label="Enlaces" variants={pageItemVariants}>
          {cvLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="strict-origin-when-cross-origin"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>
      </motion.div>
    </PortfolioPageShell>
  );
}
