import { useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

// Clinical cubic-bezier curve for crisp, authoritative motion
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Restrained durations for efficient healthcare workflows
export const DURATION = {
  fast: 0.15,   // Micro-interactions (hover, active)
  base: 0.25,   // Standard transitions (cards, tabs)
  slow: 0.35,   // Subtle panel entries
  slower: 0.5,  // Page transitions
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: DURATION.base, ease: EASE } 
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { duration: DURATION.base, ease: EASE } 
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: DURATION.base, ease: EASE } 
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: DURATION.base, ease: EASE } 
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 8 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: DURATION.base, ease: EASE } 
  },
};

export const cardHover: Variants = {
  hover: { 
    y: -2, 
    transition: { duration: DURATION.fast, ease: EASE }
  },
  tap: { 
    scale: 0.99,
    transition: { duration: DURATION.fast, ease: EASE }
  },
};

export const staggerContainer = (staggerAmount = 0.05, delayChildren = 0.05): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerAmount,
      delayChildren: delayChildren,
    },
  },
});

/**
 * A custom hook to dynamically disable complex motion variants if 
 * the user's OS has "prefers-reduced-motion" enabled.
 */
export const useSahayaAnimations = () => {
  const shouldReduceMotion = useReducedMotion();

  const applyReducedMotion = (variants: Variants): Variants => {
    if (!shouldReduceMotion) return variants;

    const reduced: Variants = {};
    for (const key in variants) {
      if (key === "hidden") {
        reduced[key] = { opacity: 0 };
      } else if (key === "show") {
        reduced[key] = { opacity: 1, transition: { duration: 0.01 } };
      } else {
        reduced[key] = variants[key];
      }
    }
    return reduced;
  };

  return {
    shouldReduceMotion,
    fadeUp: applyReducedMotion(fadeUp),
    fadeIn: applyReducedMotion(fadeIn),
    scaleIn: applyReducedMotion(scaleIn),
    slideInLeft: applyReducedMotion(slideInLeft),
    slideInRight: applyReducedMotion(slideInRight),
    cardHover: shouldReduceMotion ? {} : cardHover,
    staggerContainer: shouldReduceMotion ? () => ({ hidden: {}, show: {} }) : staggerContainer,
  };
};
