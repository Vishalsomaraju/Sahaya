import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useRef } from "react";
import { DURATION } from "../../lib/animations";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

export default function AnimatedNumber({ value, duration = DURATION.slower }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { 
        duration, 
        ease: "easeOut" 
      });
      return controls.stop;
    }
  }, [value, duration, isInView, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
