import { motion } from "motion/react";
import { albums, albumCredits, bandcampUrl } from "../data/albums";
import { pageItemVariants, projectsListVariants, projectTileVariants } from "../motion/presets";
import { PortfolioPageShell } from "./PortfolioPageShell";
import { ScrambleText } from "./ScrambleText";

type MusicPageProps = {
  onBackToMenu: () => void;
};

export function MusicPage({ onBackToMenu }: MusicPageProps) {
  const albumList: readonly (typeof albums)[number][] = [...albums];

  return (
    <PortfolioPageShell
      className="musicPage"
      titleId="music-title"
      title="musica"
      kicker="音楽"
      onBackToMenu={onBackToMenu}
      contentVariants={projectsListVariants}
      meta={<span className="galleryCount">{String(albumList.length).padStart(2, "0")} albums</span>}
    >
      <motion.p className="musicIntro" variants={pageItemVariants}>
        <ScrambleText
          text="releases en bandcamp — tocá un cover para escuchar o comprar."
          delay={120}
        />
      </motion.p>

      <motion.ul className="musicGrid" aria-label="Álbumes en Bandcamp" variants={projectsListVariants}>
        {albumList.length === 0 ? (
          <li>
            <p className="sectionPageNote" role="status">
              próximamente
            </p>
          </li>
        ) : (
          albumList.map((album, index) => {
          const credits = albumCredits(album);

          return (
          <motion.li className="musicTile" key={album.id} variants={projectTileVariants}>
            <a
              className="musicTileLink"
              href={album.bandcampUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="strict-origin-when-cross-origin"
              aria-label={`Escuchar ${album.title} en Bandcamp`}
            >
              <figure className="musicCover">
                <img
                  src={album.coverSrc}
                  alt={`Cover de ${album.title}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
              </figure>
              <div className="musicMeta">
                <p className="musicIndex" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="musicTitle">{album.title}</h2>
                {credits ? <p className="musicCredits">{credits}</p> : null}
                <span className="musicAction">escuchar</span>
              </div>
            </a>
          </motion.li>
          );
        })
        )}
      </motion.ul>

      <motion.p className="musicFooter" variants={pageItemVariants}>
        <a
          href={bandcampUrl}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="strict-origin-when-cross-origin"
        >
          ver todo en bandcamp
        </a>
      </motion.p>
    </PortfolioPageShell>
  );
}
