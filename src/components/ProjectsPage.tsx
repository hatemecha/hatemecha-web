import { motion } from "motion/react";
import { projects } from "../data/projects";
import { projectsListVariants, projectTileVariants } from "../motion/presets";
import { PortfolioPageShell } from "./PortfolioPageShell";
import { ScrambleText } from "./ScrambleText";

type ProjectsPageProps = {
  onBackToMenu: () => void;
};

export function ProjectsPage({ onBackToMenu }: ProjectsPageProps) {
  return (
    <PortfolioPageShell
      className="projectsPage"
      titleId="projects-title"
      title="proyectos"
      kicker="プロジェクト"
      onBackToMenu={onBackToMenu}
      contentVariants={projectsListVariants}
    >
      <motion.div className="projectsList" aria-label="Proyectos publicados" variants={projectsListVariants}>
        {projects.map((project, index) => (
          <motion.section
            className="projectRow"
            key={project.id}
            aria-labelledby={`${project.id}-title`}
            variants={projectTileVariants}
          >
            <div className="projectBody">
              <h2 id={`${project.id}-title`} className="projectTitle">
                {project.name}
              </h2>
              <ScrambleText
                className="projectDescription"
                text={project.description}
                delay={180 + index * 120}
              />
            </div>
            <div className="projectActions">
              <a href={project.siteUrl} target="_blank" rel="noopener noreferrer">
                web
              </a>
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                repo
              </a>
            </div>
          </motion.section>
        ))}
      </motion.div>
    </PortfolioPageShell>
  );
}
