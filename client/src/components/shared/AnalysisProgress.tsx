import { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button';

export interface AnalysisProgressProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
}

const CLINICAL_STEPS = [
  {
    title: 'Validating clinical symptom inputs',
    desc: 'Checking reported symptoms, severity tier, and duration profile'
  },
  {
    title: 'Executing safety-first triage logic',
    desc: 'Screening for emergency red flags and clinical priority guidelines'
  },
  {
    title: 'Persisting assessment in clinical database',
    desc: 'Creating an immutable, audited record in PostgreSQL'
  },
  {
    title: 'Finalizing recommendations & next steps',
    desc: 'Synthesizing referral urgency, limitations, and escalation guidance'
  }
];

export default function AnalysisProgress({ 
  isLoading = true, 
  error = null, 
  onRetry, 
  onCancel,
  onComplete 
}: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (error) return;

    if (isLoading) {
      // Advance through steps up to step 2 while waiting for network response
      const timer = setInterval(() => {
        setCurrentStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 700);
      return () => clearInterval(timer);
    } else {
      // Once request completes, rapidly finish steps and complete
      setCurrentStep(CLINICAL_STEPS.length);
      const doneTimer = setTimeout(() => {
        onComplete?.();
      }, 400);
      return () => clearTimeout(doneTimer);
    }
  }, [isLoading, error, onComplete]);

  const percentComplete = error 
    ? 0 
    : isLoading 
      ? Math.min(25 + currentStep * 25, 85) 
      : 100;

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 w-full">
      <div className="w-full max-w-md bg-white rounded-xl p-6 sm:p-7 shadow-clinical border border-slate-200/90 text-slate-900">
        
        {/* Error State */}
        {error ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assessment Evaluation Failed</h3>
                <p className="text-xs text-red-600 font-medium">Unable to complete backend evaluation</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-lg text-xs text-red-800 leading-relaxed">
              <strong>Error Details: </strong>
              <span>{error}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {onCancel && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onCancel}
                  className="flex-1 text-xs gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Return</span>
                </Button>
              )}
              {onRetry && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={onRetry}
                  className="flex-1 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw size={14} />
                  <span>Retry Evaluation</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Running Clinical Triage</h3>
                  <p className="text-xs text-slate-500 font-medium">SAHAYA Protocol v2.4</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--color-primary-dark)] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {percentComplete}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
              <motion.div 
                className="h-full bg-[var(--color-primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${percentComplete}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            {/* Clinical Steps Checklist */}
            <div className="space-y-3.5">
              {CLINICAL_STEPS.map((step, index) => {
                const isCompleted = currentStep > index;
                const isActive = currentStep === index;
                const isPending = currentStep < index;

                return (
                  <div 
                    key={step.title}
                    className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                      isActive ? 'bg-teal-50/50 border border-teal-100' : 'bg-transparent'
                    }`}
                  >
                    {/* Step Status Indicator Icon */}
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-300 text-[var(--color-primary-dark)] flex items-center justify-center">
                          <Loader2 size={12} className="animate-spin" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-tight ${
                        isCompleted ? 'text-slate-800' : isActive ? 'text-slate-900 font-bold' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className={`text-[11px] leading-tight mt-0.5 ${
                        isActive ? 'text-teal-700' : 'text-slate-400'
                      }`}>
                        {step.desc}
                      </p>
                    </div>

                    {/* Status text */}
                    <span className="text-[10px] font-medium shrink-0">
                      {isCompleted && <span className="text-emerald-600 font-semibold">Done</span>}
                      {isActive && <span className="text-teal-700 font-semibold animate-pulse">Running</span>}
                      {isPending && <span className="text-slate-400">Waiting</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer info */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Evaluating parameters against safety-first decision engine...
            </div>
          </>
        )}

      </div>
    </div>
  );
}
