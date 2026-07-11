import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "motion/react";
import { galleryItems } from "../data/galleryManifest";
import { useLenisScroll } from "../hooks/useLenisScroll";

type GalleryPageProps = {
  onBackToMenu: () => void;
};

const fluidEase = [0.22, 1, 0.36, 1] as const;

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: fluidEase,
      staggerChildren: 0.018,
      delayChildren: 0.12
    }
  }
} as const;

const tileVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: fluidEase }
  }
} as const;

function findNearestTileIndex(clientX: number, clientY: number, tiles: HTMLElement[]) {
  let nearestIndex = -1;
  let nearestDistance = Number.POSITIVE_INFINITY;

  tiles.forEach((tile, index) => {
    const rect = tile.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = (clientX - centerX) ** 2 + (clientY - centerY) ** 2;

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

export function GalleryPage({ onBackToMenu }: GalleryPageProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hotIndex, setHotIndex] = useState<number | null>(null);
  const [lockupFaded, setLockupFaded] = useState(false);
  const pageRef = useLenisScroll<HTMLElement>();
  const gridRef = useRef<HTMLDivElement>(null);
  const activeItem = activeIndex === null ? null : galleryItems[activeIndex] ?? null;

  const lightboxLabel = useMemo(() => {
    if (activeIndex === null || !activeItem) return undefined;
    return `${activeItem.alt || activeItem.filename} · ${activeIndex + 1}/${galleryItems.length}`;
  }, [activeIndex, activeItem]);

  const closeLightboxOrLeave = useCallback(() => {
    if (activeIndex !== null) {
      setActiveIndex(null);
      return;
    }

    onBackToMenu();
  }, [activeIndex, onBackToMenu]);

  const handleTileActivate = useCallback(
    (index: number) => {
      const canHover = window.matchMedia("(hover: hover)").matches;

      if (!canHover && hotIndex !== index) {
        setHotIndex(index);
        return;
      }

      setActiveIndex(index);
    },
    [hotIndex]
  );

  const handleGridPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const grid = gridRef.current;
    if (!grid) return;

    const tiles = Array.from(grid.querySelectorAll<HTMLElement>("[data-gallery-tile]"));
    if (tiles.length === 0) return;

    const nearestIndex = findNearestTileIndex(event.clientX, event.clientY, tiles);
    setHotIndex((current) => (current === nearestIndex ? current : nearestIndex));
    setLockupFaded(true);
  }, []);

  const handleGridPointerLeave = useCallback(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setHotIndex(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightboxOrLeave();
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
  }, [activeIndex, closeLightboxOrLeave]);

  return (
    <>
      <section className="galleryRevealPage" aria-labelledby="gallery-title" ref={pageRef}>
        <a className="skipLink" href="#gallery-title">
          Saltar al contenido
        </a>

        <button className="galleryMenuButton" type="button" onClick={onBackToMenu}>
          menu
        </button>

        <div className="galleryLockupAnchor">
          <motion.div
            className="galleryLockup"
            data-faded={lockupFaded ? "true" : undefined}
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{
              opacity: lockupFaded ? 0 : 1,
              y: lockupFaded ? -16 : 0,
              filter: lockupFaded ? "blur(12px)" : "blur(0px)",
              scale: lockupFaded ? 0.96 : 1
            }}
            transition={{ duration: 0.6, ease: fluidEase }}
            onMouseEnter={() => setLockupFaded(true)}
            aria-hidden={lockupFaded || undefined}
          >
            <h1 id="gallery-title" className="galleryLockupTitle">
              GALERIA
            </h1>
            <p className="galleryLockupJp" lang="ja">
              ギャラリー
            </p>
          </motion.div>
        </div>

        <motion.div
          className="smoothPageContent galleryRevealContent"
          data-lenis-content
          initial="hidden"
          animate="visible"
          variants={gridVariants}
        >
          {galleryItems.length > 0 ? (
            <motion.div
              className="galleryRevealGrid"
              aria-label="Fotos de galeria"
              ref={gridRef}
              variants={gridVariants}
              onPointerMove={handleGridPointerMove}
              onPointerLeave={handleGridPointerLeave}
              style={
                {
                  "--gallery-count": String(galleryItems.length)
                } as CSSProperties
              }
            >
              {galleryItems.map((item, index) => (
                <motion.button
                  className="galleryRevealTile"
                  type="button"
                  key={item.id}
                  data-gallery-tile=""
                  data-hot={hotIndex === index ? "true" : undefined}
                  onClick={() => handleTileActivate(index)}
                  onFocus={() => setHotIndex(index)}
                  variants={tileVariants}
                >
                  <img
                    className="galleryRevealThumb"
                    src={item.thumbSrc}
                    alt={item.alt || item.filename}
                    width={item.width}
                    height={item.height}
                    draggable="false"
                    decoding="async"
                    loading={index < 12 ? "eager" : "lazy"}
                  />
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div className="galleryEmpty" role="status" variants={tileVariants}>
              <p className="galleryEmptyCode">!PORTFOLIO</p>
              <p>agregá fotos a la carpeta y corré `npm run gallery:sync`.</p>
            </motion.div>
          )}
        </motion.div>
      </section>

      {activeItem ? (
        <div className="galleryLightbox" role="dialog" aria-modal="true" aria-label={lightboxLabel}>
          <button
            className="galleryLightboxScrim"
            type="button"
            aria-label="Cerrar vista previa"
            onClick={() => setActiveIndex(null)}
          />
          <figure className="galleryLightboxFrame">
            <img
              className="galleryLightboxImage"
              src={activeItem.src}
              alt={activeItem.alt || activeItem.filename}
              width={activeItem.width}
              height={activeItem.height}
              decoding="async"
            />
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
    </>
  );
}
