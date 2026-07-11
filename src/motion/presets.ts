/** Shared Motion presets — page chrome uses Motion; animejs stays for scramble/code FX. */

export const motionEase = [0.16, 1, 0.3, 1] as const;

export const viewTransition = {
  duration: 0.64,
  ease: motionEase
} as const;

export const viewMotion = {
  initial: { opacity: 0, y: 28, scale: 0.992 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -22, scale: 0.992 },
  transition: viewTransition
} as const;

export const pageContentTransition = {
  duration: 0.68,
  ease: motionEase
} as const;

export function createPageContentVariants(staggerChildren = 0.022) {
  return {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...pageContentTransition,
        delay: 0.08,
        staggerChildren
      }
    }
  } as const;
}

export function createPageItemVariants(scale = 0.985) {
  return {
    hidden: { opacity: 0, y: 20, scale },
    visible: { opacity: 1, y: 0, scale: 1, transition: pageContentTransition }
  } as const;
}

export const pageContentVariants = createPageContentVariants(0.022);
export const pageItemVariants = createPageItemVariants(0.985);
export const projectsListVariants = createPageContentVariants(0.085);
export const projectTileVariants = createPageItemVariants(0.97);
