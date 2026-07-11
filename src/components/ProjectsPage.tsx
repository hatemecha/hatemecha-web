import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { projects, type ProjectImage } from "../data/projects";
import { projectsListVariants, projectTileVariants } from "../motion/presets";
import { PortfolioPageShell } from "./PortfolioPageShell";
import { ScrambleText } from "./ScrambleText";

type ProjectsPageProps = {
  onBackToMenu: () => void;
};

type ProjectMediaStripProps = {
  label: string;
  images: readonly ProjectImage[];
};

function ProjectMediaStrip({ label, images }: ProjectMediaStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || images.length < 2) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let frame = 0;
    let direction = 1;
    let lastTime = performance.now();
    let edgeHoldUntil = 0;
    const speedPxPerSec = 38;
    const edgeHoldMs = 1100;

    const applyOffset = (value: number) => {
      offsetRef.current = value;
      track.style.transform = `translate3d(${-value}px, 0, 0)`;
    };

    applyOffset(0);

    const tick = (now: number) => {
      const delta = Math.min(0.048, (now - lastTime) / 1000);
      lastTime = now;
      const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);

      if (!pausedRef.current && maxScroll > 2 && now >= edgeHoldUntil) {
        let next = offsetRef.current + direction * speedPxPerSec * delta;

        if (next >= maxScroll) {
          next = maxScroll;
          direction = -1;
          edgeHoldUntil = now + edgeHoldMs;
        } else if (next <= 0) {
          next = 0;
          direction = 1;
          edgeHoldUntil = now + edgeHoldMs;
        }

        applyOffset(next);
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [images]);

  const pause = () => {
    pausedRef.current = true;
  };

  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div
      className="projectMedia"
      aria-label={label}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          resume();
        }
      }}
    >
      <div className="projectStrip" ref={viewportRef}>
        <div className="projectStripTrack" ref={trackRef}>
          {images.map((image) => (
            <figure className="projectShot" key={image.src}>
              <img src={image.src} alt={image.alt} loading="lazy" decoding="async" draggable={false} />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

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
        {projects.map((project, index) => {
          const indexLabel = String(index + 1).padStart(2, "0");
          const mediaSide = index % 2 === 0 ? "end" : "start";

          return (
            <motion.section
              className="projectRow"
              key={project.id}
              data-media-side={mediaSide}
              aria-labelledby={`${project.id}-title`}
              variants={projectTileVariants}
            >
              <ProjectMediaStrip label={`Capturas de ${project.name}`} images={project.images} />

              <div className="projectBody">
                <p className="projectIndex" aria-hidden="true">
                  {indexLabel}
                </p>
                <h2 id={`${project.id}-title`} className="projectTitle">
                  {project.name}
                </h2>
                <ScrambleText
                  className="projectDescription"
                  text={project.description}
                  delay={180 + index * 120}
                />
                <div className="projectActions">
                  <a href={project.siteUrl} target="_blank" rel="noopener noreferrer">
                    web
                  </a>
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                    repo
                  </a>
                </div>
              </div>
            </motion.section>
          );
        })}
      </motion.div>
    </PortfolioPageShell>
  );
}
