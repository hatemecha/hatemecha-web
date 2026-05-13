import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type SlotSizes = {
  hate: number;
  mecha: number;
};

type SlotStyle = CSSProperties & {
  "--hate-slot-width": string;
  "--mecha-slot-width": string;
};

const FALLBACK_SIZES: SlotSizes = {
  hate: 196,
  mecha: 276
};

export function useMeasuredTitleSlots() {
  const hateRef = useRef<HTMLSpanElement>(null);
  const mechaRef = useRef<HTMLSpanElement>(null);
  const [slotSizes, setSlotSizes] = useState<SlotSizes>(FALLBACK_SIZES);

  useLayoutEffect(() => {
    const updateSizes = () => {
      const hateWidth = hateRef.current?.getBoundingClientRect().width;
      const mechaWidth = mechaRef.current?.getBoundingClientRect().width;

      if (!hateWidth || !mechaWidth) return;

      setSlotSizes({
        hate: Math.round(hateWidth),
        mecha: Math.round(mechaWidth)
      });
    };

    updateSizes();

    if (!("ResizeObserver" in window)) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(updateSizes);
    if (hateRef.current) resizeObserver.observe(hateRef.current);
    if (mechaRef.current) resizeObserver.observe(mechaRef.current);

    void document.fonts?.ready.then(updateSizes);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const slotStyle = useMemo<SlotStyle>(
    () => ({
      "--hate-slot-width": `${slotSizes.hate}px`,
      "--mecha-slot-width": `${slotSizes.mecha}px`
    }),
    [slotSizes]
  );

  return {
    hateRef,
    mechaRef,
    slotStyle
  };
}
