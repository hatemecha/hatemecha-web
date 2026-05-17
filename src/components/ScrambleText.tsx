import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { animate } from "animejs/animation";

const SCRAMBLE_GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789/#%+-";
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

function buildScrambledText(text: string, revealedCount: number, frame: number) {
  const revealEnd = Math.min(revealedCount, text.length);
  const scrambleEnd = Math.min(text.length, revealEnd + 6);
  let nextText = text.slice(0, revealEnd);

  for (let index = revealEnd; index < scrambleEnd; index += 1) {
    const character = text[index];
    nextText += character === " " ? " " : getScrambledGlyph(index, frame);
  }

  return nextText;
}

export function ScrambleText({ active = true, delay = 0, replayKey, text, ...props }: ScrambleTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return undefined;

    if (!active) {
      textElement.textContent = text;
      textElement.setAttribute("aria-label", text);
      return undefined;
    }

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      textElement.textContent = text;
      return undefined;
    }

    let frame = 0;
    let lastRevealedCount = -1;
    const state = { chars: 0 };
    textElement.textContent = "";
    textElement.setAttribute("aria-label", text);

    const animation = animate(state, {
      chars: text.length,
      delay,
      duration: getTextDuration(text),
      ease: "out(3)",
      onUpdate: () => {
        const revealedCount = Math.floor(state.chars);
        if (revealedCount === lastRevealedCount) return;

        lastRevealedCount = revealedCount;
        frame += 1;
        textElement.textContent = buildScrambledText(text, revealedCount, frame);
      },
      onComplete: () => {
        textElement.textContent = text;
      }
    });

    return () => {
      animation.revert();
      textElement.textContent = text;
    };
  }, [active, delay, replayKey, text]);

  return (
    <p ref={textRef} {...props}>
      {text}
    </p>
  );
}
