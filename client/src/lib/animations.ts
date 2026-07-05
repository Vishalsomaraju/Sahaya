import { useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

// Custom Bezier curve for a smooth "easeOutExpo" feel
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Standardized durations - increased by ~50% for a graceful, premium healthcare feel
export const DURATION = {
  fast: 0.25,   // Micro-interactions (hover, tap)
  base: 0.45,   // Standard transitions (cards, small elements)
  slow: 0.7,    // Entrance animations (heroes, modals)
  slower: 1.0,  // Large, majestic page loads
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
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
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: DURATION.base, ease: EASE } 
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: DURATION.base, ease: EASE } 
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: DURATION.base, ease: EASE } 
  },
};

export const cardHover: Variants = {
  hover: { 
    y: -4, 
    scale: 1.02,
    transition: { duration: DURATION.fast, ease: EASE }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: DURATION.fast, ease: EASE }
  },
};

export const staggerContainer = (staggerAmount = 0.08, delayChildren = 0.1): Variants => ({
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

  // If the user prefers reduced motion, we strip the transform animations
  // and dramatically shorten the durations to just a quick fade.
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
    cardHover: shouldReduceMotion ? {} : cardHover, // Disable hover scaling for accessibility
    staggerContainer: shouldReduceMotion ? () => ({ hidden: {}, show: {} }) : staggerContainer,
  };
};
