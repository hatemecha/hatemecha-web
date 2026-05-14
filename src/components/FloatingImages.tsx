import { useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioSectionId } from "../data/portfolioSections";
import { homeMenuScatterPhotos, visualAssets } from "../data/assets";

type FloatingImagesProps = { activeId: PortfolioSectionId };

// ── Seeded RNG ──────────────────────────────────────────────────────────────
function makeRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Zones: well-distributed across the right-hand stage ───────────────────
const ZONES = [
  { xMin: 55, xMax: 70, yMin: 5,  yMax: 15 }, // top-right
  { xMin: 72, xMax: 88, yMin: 40, yMax: 50 }, // mid-far-right
  { xMin: 50, xMax: 65, yMin: 75, yMax: 85 }, // bottom-center-ish
];

type Node = { x: string; y: string; captionSide: "start" | "end"; size: string; };;

function buildLayout(count: number, seed: number): Node[] {
  const rng = makeRng(seed);
  return ZONES.slice(0, count).map((z, i) => {
    const rx = rng();
    const ry = rng();
    const size = Math.round(140 + rng() * 100); // 140px to 240px
    return {
      x: `${(z.xMin + rx * (z.xMax - z.xMin)).toFixed(1)}%`,
      y: `${(z.yMin + ry * (z.yMax - z.yMin)).toFixed(1)}%`,
      captionSide: i === 1 ? "end" : "start",
      size: `${size}px`,
    };
  });
}

// ── Wire geometry ───────────────────────────────────────────────────────────
type Pt   = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number; side: "start" | "end" };

function getPortPt(r: Rect): Pt {
  // Ports are at --br (bottom right) for "start" captions and --tl (top left) for "end" captions
  if (r.side === "start") {
    return { x: r.x + r.w, y: r.y + r.h };
  } else {
    return { x: r.x, y: r.y };
  }
}

function lPath(f: Pt, t: Pt): string {
  const midY = (f.y + t.y) / 2;
  return `M ${f.x} ${f.y} L ${f.x} ${midY} L ${t.x} ${midY} L ${t.x} ${t.y}`;
}

// ── SVG Wires ───────────────────────────────────────────────────────────────
function WireSvg({ watch }: { watch: unknown }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const container = svg.closest<HTMLElement>(".homeScatter");
    if (!container) return;

    const run = () => {
      const figs = Array.from(container.querySelectorAll<HTMLElement>(".homeScatterFigure"));
      if (figs.length < 2) return;
      const cRect = container.getBoundingClientRect();
      
      const rects: Rect[] = figs.map(f => {
        const frame = f.querySelector(".homeScatterFrame");
        const r = (frame || f).getBoundingClientRect();
        return { 
          x: r.left - cRect.left, 
          y: r.top - cRect.top, 
          w: r.width, 
          h: r.height,
          side: f.getAttribute("data-caption-side") as "start" | "end"
        };
      });

      const ps: string[] = [];

      // Connect photos in a chain based on their order in the array
      for (let i = 0; i < rects.length - 1; i++) {
        const p1 = getPortPt(rects[i]!);
        const p2 = getPortPt(rects[i + 1]!);
        ps.push(lPath(p1, p2));
      }

      // Anchor lines to the screen edges
      // Topmost photo to top
      const topRect = [...rects].sort((a, b) => a.y - b.y)[0]!;
      const tp = getPortPt(topRect);
      ps.push(`M ${tp.x} ${tp.y} L ${tp.x} 0`);

      // Rightmost photo to right
      const rightRect = [...rects].sort((a, b) => (b.x + b.w) - (a.x + a.w))[0]!;
      const rp = getPortPt(rightRect);
      ps.push(`M ${rp.x} ${rp.y} L ${cRect.width} ${rp.y}`);

      // Bottommost photo to bottom
      const botRect = [...rects].sort((a, b) => (b.y + b.h) - (a.y + a.h))[0]!;
      const bp = getPortPt(botRect);
      ps.push(`M ${bp.x} ${bp.y} L ${bp.x} ${cRect.height}`);

      setPaths(ps);
    };

    // Use ResizeObserver for more reliable updates if the window changes
    const observer = new ResizeObserver(run);
    observer.observe(container);
    run();
    
    return () => observer.disconnect();
  }, [watch]);

  return (
    <svg ref={svgRef} className="homeScatterWires" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {paths.map((d, i) => <path key={i} className="homeScatterWire" d={d} />)}
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export function FloatingImages({ activeId }: FloatingImagesProps) {
  const isHome = activeId === "home";
  const seed   = useMemo(() => Math.floor(Math.random() * 0xffffff), []);
  const nodes  = useMemo(() => buildLayout(homeMenuScatterPhotos.length, seed), [seed]);

  if (!isHome) {
    return (
      <div className="floatingImages" data-active-image-set={activeId} aria-hidden="true">
        <img className="floatingImage floatingImageStrip" src={visualAssets.menuEyesStrip} alt="" draggable="false" loading="lazy" />
        <img className="floatingImage floatingImageBlock"  src={visualAssets.menuPhotoBlock}  alt="" draggable="false" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="floatingImages homeScatterRoot" data-active-image-set={activeId} aria-hidden="true">
      <div className="homeScatter">
        <WireSvg watch={seed} />

        {homeMenuScatterPhotos.map((item, idx) => {
          const n = nodes[idx]!;
          return (
            <figure
              key={item.src}
              className="homeScatterFigure"
              data-caption-side={n.captionSide}
              style={{ "--sx": n.x, "--sy": n.y, "--size": n.size } as React.CSSProperties}
            >
              {n.captionSide === "start" ? (
                <>
                  <figcaption className="homeScatterLabel">{item.label}</figcaption>
                  <div className="homeScatterFrame">
                    <img className="homeScatterImg" src={item.src} alt="" draggable="false" loading={idx === 0 ? "eager" : "lazy"} />
                    <span className="homeScatterPort homeScatterPort--br" aria-hidden="true" />
                  </div>
                </>
              ) : (
                <>
                  <div className="homeScatterFrame">
                    <img className="homeScatterImg" src={item.src} alt="" draggable="false" loading={idx === 0 ? "eager" : "lazy"} />
                    <span className="homeScatterPort homeScatterPort--tl" aria-hidden="true" />
                  </div>
                  <figcaption className="homeScatterLabel">{item.label}</figcaption>
                </>
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
}
