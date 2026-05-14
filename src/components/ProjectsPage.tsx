import { useEffect } from "react";
import { motion } from "motion/react";
import { projects } from "../data/projects";
import { useLenisScroll } from "../hooks/useLenisScroll";
import { ScrambleText } from "./ScrambleText";

type ProjectsPageProps = {
  onBackToMenu: () => void;
};
const projectContentTransition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1]
} as const;
const projectsListVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...projectContentTransition,
      delay: 0.08,
      staggerChildren: 0.085
    }
  }
} as const;
const projectTileVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: projectContentTransition }
} as const;

export function ProjectsPage({ onBackToMenu }: ProjectsPageProps) {
  const pageRef = useLenisScroll<HTMLElement>();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      onBackToMenu();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onBackToMenu]);

  return (
    <section className="projectsPage" aria-labelledby="projects-title" ref={pageRef}>
      <header className="galleryHeader projectsHeader">
        <div className="galleryHeaderMark">
          <ScrambleText className="galleryKicker" text="プロジェクト" delay={80} />
          <h1 id="projects-title" className="galleryTitle">
            proyectos
          </h1>
        </div>
        <div className="galleryHeaderMeta">
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
        variants={projectsListVariants}
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
      </motion.div>
    </section>
  );
}
