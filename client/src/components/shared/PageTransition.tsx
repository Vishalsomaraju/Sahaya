import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE, DURATION } from '../../lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 12 
    },
    animate: { 
      opacity: 1, 
      y: 0 
    },
    exit: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : -12 
    }
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ 
        duration: shouldReduceMotion ? 0.01 : DURATION.base, 
        ease: EASE 
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
