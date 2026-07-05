import type { ComponentProps } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

// Create a motion-enabled version of our Button
const MotionButton = motion(Button);

type AnimatedButtonProps = ComponentProps<typeof MotionButton>;

export default function AnimatedButton(props: AnimatedButtonProps) {
  return (
    <MotionButton
      whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
      whileTap={{ scale: 0.97 }}
      {...props}
    />
  );
}
