import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSymptoms } from '../../data/mockData';
import { Check, ChevronLeft, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { clsx } from 'clsx';

export default function PatientAssessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  const handleSubmit = () => {
    navigate('/patient/triage', { 
      state: { symptoms: selectedSymptoms, severity, duration } 
    });
  };

  const stepVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  const canProceed = () => {
    if (step === 1) return selectedSymptoms.length > 0;
    if (step === 2) return severity !== '';
    if (step === 3) return duration !== '';
    return false;
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto pt-6 pb-16 px-4 md:px-0 min-h-[80vh]">
      
      {/* Header & Progress */}
      <div className="flex flex-col gap-6">
        <button onClick={handleBack} className="self-start p-3 -ml-3 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-full transition-colors">
          <ChevronLeft size={28} />
        </button>
        <div>
          <span className="text-sm font-extrabold text-[var(--color-primary)] tracking-widest uppercase mb-3 block">Step {step} of 3</span>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[#4fd1c5]"
              initial={{ width: `${((step - 1) / 3) * 100}%` }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 mt-6 relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-10">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">What symptoms are you experiencing?</h1>
                <p className="text-xl text-[var(--color-text-muted)] font-medium">Select all that apply.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {mockSymptoms.map(symptom => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return (
                    <FloatingCard
                      key={symptom}
                      hoverable
                      onClick={() => toggleSymptom(symptom)}
                      className={clsx(
                        "p-6 flex flex-col items-center justify-center text-center gap-4 h-40 border-2 transition-all rounded-3xl",
                        isSelected 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 shadow-md shadow-[var(--color-primary)]/10" 
                          : "border-transparent hover:border-gray-200"
                      )}
                    >
                      <div className={clsx(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm",
                        isSelected ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 text-[var(--color-text-muted)]"
                      )}>
                        {isSelected ? <Check size={24} strokeWidth={3} /> : <Activity size={24} />}
                      </div>
                      <span className={clsx("font-extrabold text-lg", isSelected ? "text-[var(--color-primary-dark)]" : "text-[var(--color-text-primary)]")}>
                        {symptom}
                      </span>
                    </FloatingCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-10">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">How severe are the symptoms?</h1>
                <p className="text-xl text-[var(--color-text-muted)] font-medium">This helps us gauge urgency.</p>
              </div>
              <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full md:mx-0">
                {['Mild', 'Moderate', 'Severe'].map(level => {
                  const isSelected = severity === level;
                  return (
                    <FloatingCard
                      key={level}
                      hoverable
                      onClick={() => setSeverity(level)}
                      className={clsx(
                        "p-8 flex items-center justify-between border-2 transition-all rounded-3xl",
                        isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 shadow-md shadow-[var(--color-primary)]/10" : "border-transparent"
                      )}
                    >
                      <span className="text-2xl font-extrabold text-[var(--color-text-primary)]">{level}</span>
                      <div className={clsx(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-gray-200"
                      )}>
                        {isSelected && <Check size={18} strokeWidth={3} />}
                      </div>
                    </FloatingCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-10">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">How long have you felt this way?</h1>
                <p className="text-xl text-[var(--color-text-muted)] font-medium">Select the best estimate.</p>
              </div>
              <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full md:mx-0">
                {['Less than 3 days', '3 to 7 days', 'More than 7 days'].map(time => {
                  const isSelected = duration === time;
                  return (
                    <FloatingCard
                      key={time}
                      hoverable
                      onClick={() => setDuration(time)}
                      className={clsx(
                        "p-8 flex items-center justify-between border-2 transition-all rounded-3xl",
                        isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 shadow-md shadow-[var(--color-primary)]/10" : "border-transparent"
                      )}
                    >
                      <span className="text-2xl font-extrabold text-[var(--color-text-primary)]">{time}</span>
                      <div className={clsx(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-gray-200"
                      )}>
                        {isSelected && <Check size={18} strokeWidth={3} />}
                      </div>
                    </FloatingCard>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 md:max-w-2xl md:mx-0 mx-auto w-full">
        <Button 
          size="lg" 
          fullWidth 
          onClick={handleNext} 
          disabled={!canProceed()}
          className="h-16 text-xl rounded-2xl font-bold shadow-lg"
        >
          {step === 3 ? "Analyze Symptoms" : "Continue"}
        </Button>
      </div>

    </div>
  );
}
