import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { galleryItems, type GalleryItem } from "../data/galleryManifest";
import { useLenisScroll } from "../hooks/useLenisScroll";
import { ScrambleText } from "./ScrambleText";

type GalleryPageProps = {
  onBackToMenu: () => void;
};
const pageContentTransition = {
  duration: 0.68,
  ease: [0.16, 1, 0.3, 1]
} as const;
const pageContentVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...pageContentTransition,
      delay: 0.08,
      staggerChildren: 0.022
    }
  }
} as const;
const pageItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1, transition: pageContentTransition }
} as const;

function getPhotoAspectRatio(item: GalleryItem) {
  if (item.width <= 0 || item.height <= 0) return "1 / 1";
  return `${item.width} / ${item.height}`;
}

function getItemSpan(item: GalleryItem, index: number) {
  const ratio = item.width / item.height;

  if (ratio > 1.62) return "wide";
  if (ratio < 0.74) return "tall";
  if (index % 11 === 0) return "large";
  return "standard";
}

export function GalleryPage({ onBackToMenu }: GalleryPageProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const pageRef = useLenisScroll<HTMLElement>();
  const activeItem = activeIndex === null ? null : galleryItems[activeIndex] ?? null;
  const itemCountLabel = `${galleryItems.length} img${galleryItems.length === 1 ? "" : "s"}`;

  const lightboxLabel = useMemo(() => {
    if (activeIndex === null || !activeItem) return undefined;
    return `${activeItem.alt || activeItem.filename} · ${activeIndex + 1}/${galleryItems.length}`;
  }, [activeIndex, activeItem]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();

        if (activeIndex !== null) {
          setActiveIndex(null);
          return;
        }

        onBackToMenu();
        return;
      }

      if (activeIndex === null || galleryItems.length <= 1) return;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((currentIndex) =>
          currentIndex === null ? currentIndex : (currentIndex + 1) % galleryItems.length
        );
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((currentIndex) =>
          currentIndex === null
            ? currentIndex
            : (currentIndex - 1 + galleryItems.length) % galleryItems.length
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, onBackToMenu]);

  return (
    <section className="galleryPage" aria-labelledby="gallery-title" ref={pageRef}>
      <header className="galleryHeader">
        <div className="galleryHeaderMark">
          <ScrambleText className="galleryKicker" text="ギャラリー" delay={80} />
          <h1 id="gallery-title" className="galleryTitle">
            galeria
          </h1>
        </div>
        <div className="galleryHeaderMeta">
          <span className="galleryCount">{itemCountLabel}</span>
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
        variants={pageContentVariants}
      >
        {galleryItems.length > 0 ? (
          <motion.div className="galleryGrid" aria-label="Fotos de galeria" variants={pageContentVariants}>
            {galleryItems.map((item, index) => (
              <motion.button
                className="galleryTile"
                type="button"
                key={item.id}
                data-span={getItemSpan(item, index)}
                onClick={() => setActiveIndex(index)}
                style={{ aspectRatio: getPhotoAspectRatio(item) }}
                variants={pageItemVariants}
              >
                <img
                  className="galleryThumb"
                  src={item.thumbSrc}
                  alt={item.alt || item.filename}
                  draggable="false"
                  loading={index < 10 ? "eager" : "lazy"}
                />
                <span className="galleryTileIndex" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div className="galleryEmpty" role="status" variants={pageItemVariants}>
            <ScrambleText className="galleryEmptyCode" text="/public/galeria/originales" delay={120} />
            <ScrambleText text="subi fotos a la carpeta y corre `npm run gallery:sync`." delay={260} />
          </motion.div>
        )}
      </motion.div>

      {activeItem ? (
        <div className="galleryLightbox" role="dialog" aria-modal="true" aria-label={lightboxLabel}>
          <button
            className="galleryLightboxScrim"
            type="button"
            aria-label="Cerrar vista previa"
            onClick={() => setActiveIndex(null)}
          />
          <figure className="galleryLightboxFrame">
            <img className="galleryLightboxImage" src={activeItem.src} alt={activeItem.alt || activeItem.filename} />
            <figcaption className="galleryLightboxCaption">
              <span>{lightboxLabel}</span>
              <span>{activeItem.filename}</span>
            </figcaption>
          </figure>
          <button className="galleryLightboxClose" type="button" onClick={() => setActiveIndex(null)}>
            x
          </button>
          {galleryItems.length > 1 ? (
            <>
              <button
                className="galleryLightboxNav galleryLightboxNavPrev"
                type="button"
                aria-label="Foto anterior"
                onClick={() =>
                  setActiveIndex((currentIndex) =>
                    currentIndex === null
                      ? currentIndex
                      : (currentIndex - 1 + galleryItems.length) % galleryItems.length
                  )
                }
              >
                prev
              </button>
              <button
                className="galleryLightboxNav galleryLightboxNavNext"
                type="button"
                aria-label="Foto siguiente"
                onClick={() =>
                  setActiveIndex((currentIndex) =>
                    currentIndex === null ? currentIndex : (currentIndex + 1) % galleryItems.length
                  )
                }
              >
                next
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
