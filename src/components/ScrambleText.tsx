import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { animate } from "animejs/animation";

/** ASCII only — CJK glyphs fall back to wider system fonts and blow the box. */
const SCRAMBLE_GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%+/=*<>";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type ScrambleTextProps = Omit<ComponentPropsWithoutRef<"p">, "children"> & {
  active?: boolean;
  delay?: number;
  replayKey?: string | number;
  text: string;
};

function getTextDuration(text: string) {
  return Math.max(520, Math.min(1800, text.length * 28));
}

function getScrambledGlyph(index: number, frame: number) {
  return SCRAMBLE_GLYPHS[(index * 11 + frame * 7) % SCRAMBLE_GLYPHS.length] ?? "";
}

/** Always returns `text.length` chars; spaces/newlines stay put. */
function buildDecodeText(text: string, revealedCount: number, frame: number) {
  const revealEnd = Math.min(Math.max(0, revealedCount), text.length);
  let nextText = "";

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index] ?? "";
    if (character === " " || character === "\n") {
      nextText += character;
      continue;
    }

    nextText += index < revealEnd ? character : getScrambledGlyph(index, frame);
  }

  return nextText;
}

export function ScrambleText({
  active = true,
  className,
  delay = 0,
  replayKey,
  text,
  ...props
}: ScrambleTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return undefined;

    if (!active) {
      textElement.textContent = text;
      return undefined;
    }

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      textElement.textContent = text;
      return undefined;
    }

    let frame = 0;
    let rafId = 0;
    const state = { chars: 0 };

    textElement.textContent = buildDecodeText(text, 0, 0);

    const tickScramble = () => {
      frame += 1;
      const revealedCount = Math.floor(state.chars);
      textElement.textContent = buildDecodeText(text, revealedCount, frame);
      if (revealedCount < text.length) {
        rafId = window.requestAnimationFrame(tickScramble);
      }
    };
    rafId = window.requestAnimationFrame(tickScramble);

    const animation = animate(state, {
      chars: text.length,
      delay,
      duration: getTextDuration(text),
      ease: "out(3)",
      onComplete: () => {
        window.cancelAnimationFrame(rafId);
        textElement.textContent = text;
      }
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      animation.revert();
      textElement.textContent = text;
    };
  }, [active, delay, replayKey, text]);

  // Slot locks layout to final text; FX paints decode on top (clipped).
  return (
    <p {...props} className={["scrambleText", className].filter(Boolean).join(" ")}>
      <span className="srOnly">{text}</span>
      <span aria-hidden="true" className="scrambleTextSlot">
        {text}
      </span>
      <span aria-hidden="true" className="scrambleTextFx" ref={textRef} />
    </p>
  );
}
