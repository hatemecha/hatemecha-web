import { useEffect, useRef } from "react";
import type { PortfolioSectionId } from "../data/portfolioSections";
import { homeMenuScatterPhotos, visualAssets } from "../data/assets";
import { requirePhotoAspectRatio } from "../utils/aspectRatio";

type FloatingImagesProps = { activeId: PortfolioSectionId };

type Pt = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clearSvg(svg: SVGSVGElement) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function appendPath(svg: SVGSVGElement, d: string, strokeWidth: number) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("class", "homeScatterWire");
  path.setAttribute("d", d);
  path.setAttribute("stroke-width", String(strokeWidth));
  svg.appendChild(path);
}

function appendJunction(svg: SVGSVGElement, x: number, y: number, size: number) {
  const half = size / 2;
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("class", "homeScatterJunction");
  rect.setAttribute("x", String(x - half));
  rect.setAttribute("y", String(y - half));
  rect.setAttribute("width", String(size));
  rect.setAttribute("height", String(size));
  svg.appendChild(rect);
}

/** Shrink frames uniformly so every photo fits its flex slot (no overlap). */
function fitScatterFrames(container: HTMLElement) {
  container.style.setProperty("--scatter-fit", "1");
  void container.offsetHeight;

  const figures = Array.from(container.querySelectorAll<HTMLElement>(".homeScatterFigure"));
  let fit = 1;

  figures.forEach((figure) => {
    const frame = figure.querySelector<HTMLElement>(".homeScatterFrame");
    const label = figure.querySelector<HTMLElement>(".homeScatterLabel");
    if (!frame) return;

    const gap = 6;
    const avail = figure.clientHeight - (label?.offsetHeight ?? 0) - gap;
    const needed = frame.offsetHeight;
    if (needed > avail && needed > 0 && avail > 0) {
      fit = Math.min(fit, avail / needed);
    }
  });

  container.style.setProperty("--scatter-fit", String(clamp(fit, 0.42, 1)));
  void container.offsetHeight;
}

/**
 * Measure ports in the SVG's own screen space, lock viewBox 1:1 to that box,
 * then draw edge→edge spine + stubs into each port center.
 */
function paintWires(svg: SVGSVGElement, container: HTMLElement) {
  fitScatterFrames(container);

  const svgRect = svg.getBoundingClientRect();
  const stageW = svgRect.width;
  const stageH = svgRect.height;

  if (stageW <= 0 || stageH <= 0) {
    clearSvg(svg);
    return;
  }

  svg.setAttribute("viewBox", `0 0 ${stageW} ${stageH}`);

  const ports: Pt[] = Array.from(container.querySelectorAll<HTMLElement>(".homeScatterPort")).map((port) => {
    const r = port.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - svgRect.left,
      y: r.top + r.height / 2 - svgRect.top
    };
  });

  clearSvg(svg);
  if (ports.length === 0) return;

  const strokeWidth = Number.parseFloat(getComputedStyle(container).getPropertyValue("--wire-stroke")) || 1.5;
  const junctionSize = strokeWidth + 3.5;

  const sorted = ports.slice().sort((a, b) => a.y - b.y);
  const leftMost = Math.min(...sorted.map((p) => p.x));
  const spineGap = clamp(stageW * 0.022, 18, 32);
  const spineX = clamp(leftMost - spineGap, 8, stageW - 8);

  appendPath(svg, `M ${spineX} 0 V ${stageH}`, strokeWidth);

  sorted.forEach((port) => {
    appendPath(svg, `M ${spineX} ${port.y} H ${port.x}`, strokeWidth);
    appendJunction(svg, spineX, port.y, junctionSize);
  });
}

function WireSvg({ watch }: { watch: unknown }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const container = svg.closest<HTMLElement>(".homeScatter");
    if (!container) return;
    const menu = container.closest<HTMLElement>(".fullscreenMenu");

    let raf = 0;
    const timers: number[] = [];

    const paint = () => paintWires(svg, container);

    const clearTimers = () => {
      while (timers.length) {
        const id = timers.pop();
        if (id !== undefined) window.clearTimeout(id);
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      clearTimers();
      raf = requestAnimationFrame(() => {
        paint();
        // Menu open uses transform scale; getBoundingClientRect is wrong until it settles.
        for (const ms of [50, 200, 700, 1100]) {
          timers.push(window.setTimeout(paint, ms));
        }
      });
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    observer.observe(svg);
    container.querySelectorAll<HTMLElement>(".homeScatterFrame, .homeScatterPort, .homeScatterFigure").forEach((el) => {
      observer.observe(el);
    });

    schedule();

    const onLoad = () => schedule();
    container.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", onLoad);
    });

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === menu) schedule();
    };

    window.addEventListener("resize", schedule);
    menu?.addEventListener("transitionend", onTransitionEnd);

    return () => {
      cancelAnimationFrame(raf);
      clearTimers();
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      menu?.removeEventListener("transitionend", onTransitionEnd);
      container.querySelectorAll("img").forEach((img) => img.removeEventListener("load", onLoad));
    };
  }, [watch]);

  return (
    <svg
      ref={svgRef}
      className="homeScatterWires"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    />
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
          <figure key={item.src} className={`homeScatterFigure homeScatterFigure--${item.slot}`}>
            <figcaption className="homeScatterLabel">{item.label}</figcaption>
            <div className="homeScatterFrame" style={{ aspectRatio: requirePhotoAspectRatio(item.width, item.height) }}>
              <span className="homeScatterPort" aria-hidden="true" />
              <div className="homeScatterMedia">
                <img
                  className="homeScatterImg"
                  src={item.src}
                  alt=""
                  draggable="false"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
