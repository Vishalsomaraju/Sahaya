import { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisProgressProps {
  onComplete: () => void;
}

const STEPS = [
  'Reviewing symptoms',
  'Comparing health history',
  'Checking urgency',
  'Preparing recommendation'
];

export default function AnalysisProgress({ onComplete }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1200); 
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-full max-w-md bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-border)]/50">
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-16 h-16 rounded-[20px] bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-4"
          >
            <Sparkles size={32} />
          </motion.div>
          <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)]">SAHAYA AI</h2>
          <p className="text-lg font-bold text-[var(--color-primary)] mt-1 animate-pulse">Analyzing symptoms...</p>
        </div>

        <div className="space-y-5">
          <AnimatePresence>
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > index;
              const isActive = currentStep === index;
              const isFuture = currentStep < index;

              if (isFuture) return null;

              return (
                <motion.div 
                  key={step} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="flex items-center gap-4"
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-sm shadow-[var(--color-primary)]/30"
                      >
                        <Check size={16} strokeWidth={3} />
                      </motion.div>
                    ) : isActive ? (
                      <div className="w-7 h-7 rounded-full border-2 border-[var(--color-primary-light)] flex items-center justify-center">
                        <motion.div 
                          animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-2 h-2 rounded-full bg-[var(--color-primary)]"
                        />
                      </div>
                    ) : null}
                  </div>
                  <span className={`text-lg font-bold transition-colors duration-500 ${
                    isCompleted ? 'text-[var(--color-text-primary)]' : isActive ? 'text-[var(--color-text-primary)]' : ''
                  }`}>
                    {step}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
