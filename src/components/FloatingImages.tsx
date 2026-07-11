import { useEffect, useRef, useState } from "react";
import type { PortfolioSectionId } from "../data/portfolioSections";
import { homeMenuScatterPhotos, visualAssets } from "../data/assets";
import { requirePhotoAspectRatio } from "../utils/aspectRatio";

type FloatingImagesProps = { activeId: PortfolioSectionId };

type Rect = { x: number; y: number; w: number; h: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getConnectionY(rect: Rect) {
  return Math.round(rect.y + rect.h / 2);
}

function getFrameRect(frame: HTMLElement, containerRect: DOMRect): Rect {
  const frameRect = frame.getBoundingClientRect();

  return {
    x: frameRect.left - containerRect.left,
    y: frameRect.top - containerRect.top,
    w: frameRect.width,
    h: frameRect.height
  };
}

function buildWirePaths(rects: Rect[], stageW: number, stageH: number): string[] {
  if (rects.length === 0) return [];

  const sortedRects = rects.slice().sort((a, b) => a.y + a.h / 2 - (b.y + b.h / 2));
  const leftMostFrame = Math.min(...sortedRects.map((rect) => rect.x));
  const spineGap = clamp(stageW * 0.025, 18, 34);
  const safeLeft = stageW > 760 ? clamp(stageW * 0.5, 0, stageW - 10) : 10;
  const spineX = Math.round(clamp(leftMostFrame - spineGap, safeLeft, stageW - 10));
  const topY = 0;
  const bottomY = Math.round(stageH);

  const paths = [`M ${spineX} ${topY} V ${bottomY}`];

  sortedRects.forEach((rect) => {
    const targetX = Math.round(rect.x);
    const targetY = getConnectionY(rect);
    paths.push(`M ${spineX} ${targetY} H ${targetX}`);
  });

  return paths;
}

function WireSvg({ watch }: { watch: unknown }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const container = svg.closest<HTMLElement>(".homeScatter");
    if (!container) return;

    const run = () => {
      const frames = Array.from(container.querySelectorAll<HTMLElement>(".homeScatterFrame"));
      if (frames.length === 0) {
        setPaths([]);
        return;
      }
      const cRect = container.getBoundingClientRect();
      const rects: Rect[] = frames.map((frame) => getFrameRect(frame, cRect));
      setPaths(buildWirePaths(rects, cRect.width, cRect.height));
    };

    const observer = new ResizeObserver(run);
    observer.observe(container);
    container.querySelectorAll<HTMLElement>(".homeScatterFrame").forEach((frame) => observer.observe(frame));
    const frameId = window.requestAnimationFrame(run);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [watch]);

  return (
    <svg ref={svgRef} className="homeScatterWires" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {paths.map((d) => (
        <path key={d} className="homeScatterWire" d={d} />
      ))}
    </svg>
  );
}

export function FloatingImages({ activeId }: FloatingImagesProps) {
  const isHome = activeId === "home";

  if (!isHome) {
    return (
      <div className="floatingImages" data-active-image-set={activeId} aria-hidden="true">
        <img className="floatingImage floatingImageStrip" src={visualAssets.menuEyesStrip} alt="" draggable="false" loading="lazy" />
        <img className="floatingImage floatingImageBlock" src={visualAssets.menuPhotoBlock} alt="" draggable="false" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="floatingImages homeScatterRoot" data-active-image-set={activeId} aria-hidden="true">
      <div className="homeScatter">
        <WireSvg watch={activeId} />

        {homeMenuScatterPhotos.map((item, idx) => (
          <figure
            key={item.src}
            className={`homeScatterFigure homeScatterFigure--${item.slot}`}
            data-caption-side={item.captionSide}
          >
            {item.captionSide === "start" ? (
              <>
                <figcaption className="homeScatterLabel">{item.label}</figcaption>
                <div className="homeScatterFrame" style={{ aspectRatio: requirePhotoAspectRatio(item.width, item.height) }}>
                  <img className="homeScatterImg" src={item.src} alt="" draggable="false" loading={idx === 0 ? "eager" : "lazy"} />
                  <span className="homeScatterPort homeScatterPort--ml" aria-hidden="true" />
                </div>
              </>
            ) : (
              <>
                <div className="homeScatterFrame" style={{ aspectRatio: requirePhotoAspectRatio(item.width, item.height) }}>
                  <img className="homeScatterImg" src={item.src} alt="" draggable="false" loading={idx === 0 ? "eager" : "lazy"} />
                  <span className="homeScatterPort homeScatterPort--ml" aria-hidden="true" />
                </div>
                <figcaption className="homeScatterLabel">{item.label}</figcaption>
              </>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
