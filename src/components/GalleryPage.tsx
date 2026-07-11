import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent
} from "react";
import { motion } from "motion/react";
import { galleryItems } from "../data/galleryManifest";
import { useLenisScroll } from "../hooks/useLenisScroll";

type GalleryPageProps = {
  onBackToMenu: () => void;
};

const fluidEase = [0.22, 1, 0.36, 1] as const;
const minimumGalleryTileCount = 440;
const panLerp = 0.12;

function getGridColumnCount(grid: HTMLElement) {
  return Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length);
}

function canFineHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function clearTileGlow(tiles: HTMLElement[], previousHot: number | null, columns: number) {
  if (previousHot === null) return;

  const safeColumns = Math.max(1, columns);
  const hotRow = Math.floor(previousHot / safeColumns);
  const hotColumn = previousHot % safeColumns;

  for (let row = hotRow - 2; row <= hotRow + 2; row += 1) {
    for (let column = hotColumn - 2; column <= hotColumn + 2; column += 1) {
      if (row < 0 || column < 0 || column >= safeColumns) continue;
      const index = row * safeColumns + column;
      const tile = tiles[index];
      if (!tile) continue;
      delete tile.dataset.hot;
      delete tile.dataset.proximity;
    }
  }
}

function applyTileGlow(
  tiles: HTMLElement[],
  hotIndex: number | null,
  columns: number,
  previousHot: number | null
) {
  clearTileGlow(tiles, previousHot, columns);
  if (hotIndex === null) return;

  const safeColumns = Math.max(1, columns);
  const hotRow = Math.floor(hotIndex / safeColumns);
  const hotColumn = hotIndex % safeColumns;
  const hotTile = tiles[hotIndex];
  if (hotTile) hotTile.dataset.hot = "true";

  for (let row = hotRow - 2; row <= hotRow + 2; row += 1) {
    for (let column = hotColumn - 2; column <= hotColumn + 2; column += 1) {
      if (row < 0 || column < 0 || column >= safeColumns) continue;
      const index = row * safeColumns + column;
      if (index === hotIndex) continue;
      const tile = tiles[index];
      if (!tile) continue;

      const distance = Math.max(Math.abs(row - hotRow), Math.abs(column - hotColumn));
      if (distance === 1) tile.dataset.proximity = "near";
      else if (distance === 2) tile.dataset.proximity = "soft";
    }
  }
}

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
  const [lockupFaded, setLockupFaded] = useState(false);
  const pageRef = useLenisScroll<HTMLElement>();
  const gridRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLElement[]>([]);
  const hotIndexRef = useRef<number | null>(null);
  const columnsRef = useRef(1);
  const pointerTargetRef = useRef({ x: 0.5, y: 0.5 });
  const clientPointerRef = useRef({ x: 0, y: 0 });
  const panCurrentRef = useRef({ x: 0, y: 0 });
  const panTargetRef = useRef({ x: 0, y: 0 });
  const pointerInsideRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const activeItem = activeIndex === null ? null : galleryItems[activeIndex] ?? null;

  const galleryDisplayItems = useMemo(() => {
    if (galleryItems.length === 0) return [];

    const displayCount = Math.max(minimumGalleryTileCount, galleryItems.length * 10);
    return Array.from({ length: displayCount }, (_, displayIndex) => {
      const sourceIndex = (displayIndex * 17) % galleryItems.length;
      return {
        displayIndex,
        sourceIndex,
        item: galleryItems[sourceIndex]
      };
    });
  }, []);

  const lightboxLabel = useMemo(() => {
    if (activeIndex === null || !activeItem) return undefined;
    return `${activeItem.alt || activeItem.filename} · ${activeIndex + 1}/${galleryItems.length}`;
  }, [activeIndex, activeItem]);

  const refreshTilesCache = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) {
      tilesRef.current = [];
      return;
    }

    tilesRef.current = Array.from(grid.querySelectorAll<HTMLElement>("[data-gallery-tile]"));
    columnsRef.current = getGridColumnCount(grid);
  }, []);

  const setHotTile = useCallback((nextIndex: number | null) => {
    if (hotIndexRef.current === nextIndex) return;
    const previousHot = hotIndexRef.current;
    hotIndexRef.current = nextIndex;
    applyTileGlow(tilesRef.current, nextIndex, columnsRef.current, previousHot);
  }, []);

  const resolveHotFromClient = useCallback(
    (clientX: number, clientY: number) => {
      if (!pointerInsideRef.current) {
        setHotTile(null);
        return;
      }

      const underPointer = document.elementFromPoint(clientX, clientY);
      const tile = underPointer?.closest<HTMLElement>("[data-gallery-tile]");
      if (tile && gridRef.current?.contains(tile)) {
        const nextIndex = Number(tile.dataset.tileIndex);
        setHotTile(Number.isFinite(nextIndex) ? nextIndex : null);
        return;
      }

      const nearestIndex = findNearestTileIndex(clientX, clientY, tilesRef.current);
      setHotTile(nearestIndex >= 0 ? nearestIndex : null);
    },
    [setHotTile]
  );

  const updatePanTargets = useCallback(() => {
    const grid = gridRef.current;
    const page = pageRef.current;
    if (!grid || !page) return;

    const maxPanX = Math.max(0, grid.scrollWidth - page.clientWidth);
    const maxPanY = Math.max(0, grid.scrollHeight - page.clientHeight);
    const { x, y } = pointerTargetRef.current;
    const mappedX = 0.5 + (x - 0.5) * 1.15;
    const mappedY = 0.5 + (y - 0.5) * 1.15;

    panTargetRef.current = {
      x: -(maxPanX * Math.min(1, Math.max(0, mappedX))),
      y: -(maxPanY * Math.min(1, Math.max(0, mappedY)))
    };
  }, [pageRef]);

  const startInteractionLoop = useCallback(() => {
    if (rafRef.current !== null) return;

    const tick = () => {
      const page = pageRef.current;
      const grid = gridRef.current;
      if (!page || !grid) {
        rafRef.current = null;
        return;
      }

      const cursorTarget = pointerTargetRef.current;
      updatePanTargets();
      const pan = panCurrentRef.current;
      const panTarget = panTargetRef.current;
      const prevPanX = pan.x;
      const prevPanY = pan.y;
      pan.x += (panTarget.x - pan.x) * panLerp;
      pan.y += (panTarget.y - pan.y) * panLerp;
      grid.style.transform = `translate3d(${pan.x}px, ${pan.y}px, 0)`;

      if (Math.abs(pan.x - prevPanX) > 0.35 || Math.abs(pan.y - prevPanY) > 0.35) {
        resolveHotFromClient(clientPointerRef.current.x, clientPointerRef.current.y);
      }

      const panSettled =
        Math.abs(panTarget.x - pan.x) < 0.2 && Math.abs(panTarget.y - pan.y) < 0.2;

      if (panSettled) {
        rafRef.current = null;
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
  }, [pageRef, resolveHotFromClient, updatePanTargets]);

  const updatePointerFromClient = useCallback(
    (clientX: number, clientY: number) => {
      if (!canFineHover()) return;

      const page = pageRef.current;
      if (!page) return;

      const pageRect = page.getBoundingClientRect();
      clientPointerRef.current = { x: clientX, y: clientY };
      pointerTargetRef.current = {
        x: (clientX - pageRect.left) / Math.max(1, pageRect.width),
        y: (clientY - pageRect.top) / Math.max(1, pageRect.height)
      };

      resolveHotFromClient(clientX, clientY);
      startInteractionLoop();
    },
    [pageRef, resolveHotFromClient, startInteractionLoop]
  );

  const syncLockupFade = useCallback((clientX: number, clientY: number) => {
    const lockup = lockupRef.current;
    if (!lockup) return;

    // While faded, lockup ignores hits — use the last known box via offsetParent anchor.
    const anchor = lockup.parentElement;
    const rect = (anchor ?? lockup).getBoundingClientRect();
    const padX = rect.width * 0.2;
    const padY = rect.height * 0.35;
    const isOverLockup =
      clientX >= rect.left - padX &&
      clientX <= rect.right + padX &&
      clientY >= rect.top - padY &&
      clientY <= rect.bottom + padY;

    setLockupFaded((current) => (current === isOverLockup ? current : isOverLockup));
  }, []);

  const closeLightboxOrLeave = useCallback(() => {
    if (activeIndex !== null) {
      setActiveIndex(null);
      return;
    }

    onBackToMenu();
  }, [activeIndex, onBackToMenu]);

  const handleTileActivate = useCallback(
    (displayIndex: number, sourceIndex: number) => {
      const canHover = window.matchMedia("(hover: hover)").matches;

      if (!canHover && hotIndexRef.current !== displayIndex) {
        setHotTile(displayIndex);
        return;
      }

      setActiveIndex(sourceIndex);
    },
    [setHotTile]
  );

  const handleGridPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      pointerInsideRef.current = true;
      updatePointerFromClient(event.clientX, event.clientY);
      syncLockupFade(event.clientX, event.clientY);
    },
    [syncLockupFade, updatePointerFromClient]
  );

  const handleLockupPointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      pointerInsideRef.current = true;
      setLockupFaded(true);
      updatePointerFromClient(event.clientX, event.clientY);
    },
    [updatePointerFromClient]
  );

  const handleGridPointerLeave = useCallback(() => {
    if (!canFineHover()) return;

    pointerInsideRef.current = false;
    setHotTile(null);
    setLockupFaded(false);
    pointerTargetRef.current = { x: 0.5, y: 0.5 };
    updatePanTargets();
    startInteractionLoop();
  }, [setHotTile, startInteractionLoop, updatePanTargets]);

  useEffect(() => {
    refreshTilesCache();
    pointerTargetRef.current = { x: 0.5, y: 0.5 };
    updatePanTargets();
    panCurrentRef.current = { ...panTargetRef.current };

    const grid = gridRef.current;
    if (grid) {
      grid.style.transform = `translate3d(${panCurrentRef.current.x}px, ${panCurrentRef.current.y}px, 0)`;
    }

    if (!grid) return undefined;

    const observer = new ResizeObserver(() => {
      columnsRef.current = getGridColumnCount(grid);
      applyTileGlow(tilesRef.current, hotIndexRef.current, columnsRef.current, hotIndexRef.current);
      updatePanTargets();
      startInteractionLoop();
    });

    observer.observe(grid);
    window.addEventListener("resize", refreshTilesCache);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", refreshTilesCache);
    };
  }, [galleryDisplayItems.length, refreshTilesCache, startInteractionLoop, updatePanTargets]);

  useEffect(() => {
    if (!lockupFaded) return undefined;

    const handlePointerMove = (event: PointerEvent) => {
      syncLockupFade(event.clientX, event.clientY);
      updatePointerFromClient(event.clientX, event.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [lockupFaded, syncLockupFade, updatePointerFromClient]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
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
    return () => window.removeEventListener("keydown", handleKeyDown);
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
            ref={lockupRef}
            className="galleryLockup"
            data-faded={lockupFaded ? "true" : undefined}
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{
              opacity: lockupFaded ? 0 : 1,
              y: lockupFaded ? -16 : 0,
              filter: lockupFaded ? "blur(12px)" : "blur(0px)",
              scale: lockupFaded ? 0.96 : 1
            }}
            transition={{ duration: 0.55, ease: fluidEase }}
            onPointerEnter={handleLockupPointerEnter}
          >
            <h1 id="gallery-title" className="galleryLockupTitle">
              GALERIA
            </h1>
            <p className="galleryLockupJp" lang="ja">
              ギャラリー
            </p>
          </motion.div>
        </div>

        <div className="smoothPageContent galleryRevealContent" data-lenis-content>
          {galleryDisplayItems.length > 0 ? (
            <div
              className="galleryRevealGrid"
              aria-label="Fotos de galeria"
              ref={gridRef}
              onPointerMove={handleGridPointerMove}
              onPointerLeave={handleGridPointerLeave}
              style={
                {
                  "--gallery-count": String(galleryDisplayItems.length)
                } as CSSProperties
              }
            >
              {galleryDisplayItems.map(({ item, displayIndex, sourceIndex }) => (
                <button
                  className="galleryRevealTile"
                  type="button"
                  key={`${item.id}-${displayIndex}`}
                  data-gallery-tile=""
                  data-tile-index={displayIndex}
                  onClick={() => handleTileActivate(displayIndex, sourceIndex)}
                  onFocus={() => setHotTile(displayIndex)}
                >
                  <img
                    className="galleryRevealThumb"
                    src={item.thumbSrc}
                    alt={item.alt || item.filename}
                    width={item.width}
                    height={item.height}
                    draggable="false"
                    decoding="async"
                    loading={displayIndex < 24 ? "eager" : "lazy"}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="galleryEmpty" role="status">
              <p className="galleryEmptyCode">!PORTFOLIO</p>
              <p>agregá fotos a la carpeta y corré `npm run gallery:sync`.</p>
            </div>
          )}
        </div>
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
