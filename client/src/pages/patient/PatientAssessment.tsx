import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSymptoms } from '../../data/mockData';
import { Check, ArrowLeft, ArrowRight, Activity, AlertCircle, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import AnalysisProgress from '../../components/shared/AnalysisProgress';
import { submitAssessment } from '../../lib/api';

export default function PatientAssessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    if (submitError) setSubmitError(null);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/patient');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent duplicate submissions

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitAssessment({
        symptoms: selectedSymptoms,
        severity: (severity as 'Mild' | 'Moderate' | 'Severe') || undefined,
        duration: duration || undefined
      });

      if (!response?.data?.id) {
        throw new Error('Server returned incomplete assessment record.');
      }

      // Navigate to API-driven triage result
      navigate(`/patient/triage?id=${encodeURIComponent(response.data.id)}`, { 
        state: { 
          assessmentId: response.data.id, 
          assessment: response.data, 
          triage: response.triage 
        } 
      });
    } catch (err: any) {
      console.error('[PatientAssessment] Clinical submission failed:', err);
      setSubmitError(err.message || 'Unable to communicate with the triage decision service. Please ensure the server is online.');
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (isSubmitting) return false;
    if (step === 1) return selectedSymptoms.length > 0;
    if (step === 2) return severity !== '';
    if (step === 3) return duration !== '';
    return false;
  };

  const stepTitles = [
    { title: 'What symptoms are you experiencing?', desc: 'Select all that currently apply to you.' },
    { title: 'How severe are your symptoms?', desc: 'This helps gauge clinical urgency and care priority.' },
    { title: 'How long have you experienced this?', desc: 'Estimate the duration since your symptoms first began.' }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-16 pt-2 animate-fade-in">
      
      {/* Active API Submission Loading Overlay */}
      {isSubmitting ? (
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <AnalysisProgress 
            isLoading={isSubmitting} 
            error={submitError} 
            onRetry={handleSubmit}
            onCancel={() => {
              setIsSubmitting(false);
              setSubmitError(null);
            }}
          />
        </div>
      ) : (
        <>
          {/* Top Header & Progress Stepper */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft size={15} />
                <span>{step === 1 ? 'Cancel' : 'Previous Step'}</span>
              </button>

              <span className="text-xs font-bold font-mono text-[var(--color-primary-dark)] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                Step {step} of 3
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-primary)] transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Error Banner if submission previously failed */}
          {submitError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start justify-between gap-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Assessment Submission Failed</h4>
                  <p className="text-xs text-red-700 mt-0.5">{submitError}</p>
                </div>
              </div>
              <button 
                onClick={handleSubmit}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer shrink-0"
              >
                <RefreshCw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Step Heading */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
              {stepTitles[step - 1].title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {stepTitles[step - 1].desc}
            </p>
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Symptom Selection */}
              {step === 1 && (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, x: 8 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -8 }} 
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {mockSymptoms.map(symptom => {
                      const isSelected = selectedSymptoms.includes(symptom);
                      return (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => toggleSymptom(symptom)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                            isSelected 
                              ? 'bg-teal-50/70 border-teal-300 ring-1 ring-[var(--color-primary)] shadow-xs text-teal-950 font-semibold' 
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isSelected ? <Check size={14} strokeWidth={3} /> : <Activity size={14} />}
                            </div>
                            <span className="text-xs sm:text-sm truncate">{symptom}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedSymptoms.length > 0 ? (
                    <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
                      <span>Selected: <strong>{selectedSymptoms.join(', ')}</strong></span>
                      <span className="font-bold">{selectedSymptoms.length} active</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                      <AlertCircle size={14} className="text-slate-400" />
                      <span>Please choose at least one symptom to proceed with evaluation.</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Severity Selection */}
              {step === 2 && (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, x: 8 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -8 }} 
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3"
                >
                  {[
                    { 
                      level: 'Mild', 
                      desc: 'Manageable symptoms that do not disrupt your basic daily activities.',
                      badge: 'Low Disruption'
                    },
                    { 
                      level: 'Moderate', 
                      desc: 'Noticeable discomfort causing difficulty with routine chores, sleep, or concentration.',
                      badge: 'Noticeable Discomfort'
                    },
                    { 
                      level: 'Severe', 
                      desc: 'Significant distress, inability to perform normal activities, or acute pain.',
                      badge: 'High Impact'
                    }
                  ].map(item => {
                    const isSelected = severity === item.level;
                    return (
                      <FloatingCard
                        key={item.level}
                        hoverable
                        onClick={() => {
                          setSeverity(item.level);
                          if (submitError) setSubmitError(null);
                        }}
                        className={`p-4 border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-teal-50/70 border-teal-300 ring-1 ring-[var(--color-primary)]' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2.5 mb-1">
                              <h3 className={`text-base font-bold ${isSelected ? 'text-[var(--color-primary-dark)]' : 'text-slate-900'}`}>
                                {item.level}
                              </h3>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      </FloatingCard>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 3: Duration Selection & Confirmation Summary */}
              {step === 3 && (
                <motion.div 
                  key="step3" 
                  initial={{ opacity: 0, x: 8 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -8 }} 
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2.5">
                    {[
                      { time: 'Less than 3 days', label: 'Recent onset (1 - 2 days)' },
                      { time: '3 to 7 days', label: 'Developing over the past week' },
                      { time: 'More than 7 days', label: 'Persistent for over a week' }
                    ].map(item => {
                      const isSelected = duration === item.time;
                      return (
                        <FloatingCard
                          key={item.time}
                          hoverable
                          onClick={() => {
                            setDuration(item.time);
                            if (submitError) setSubmitError(null);
                          }}
                          className={`p-4 border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-teal-50/70 border-teal-300 ring-1 ring-[var(--color-primary)]' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className={`text-sm font-bold ${isSelected ? 'text-[var(--color-primary-dark)]' : 'text-slate-900'}`}>
                                {item.time}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {item.label}
                              </p>
                            </div>

                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>
                        </FloatingCard>
                      );
                    })}
                  </div>

                  {/* Assessment Review Summary Card */}
                  {selectedSymptoms.length > 0 && severity && duration && (
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
                        <Sparkles size={14} className="text-[var(--color-primary)]" />
                        <span>Assessment Summary for Clinical Triage:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Symptoms</span>
                          <strong className="text-slate-800">{selectedSymptoms.length} selected</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Severity</span>
                          <strong className="text-slate-800">{severity}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration</span>
                          <strong className="text-slate-800">{duration}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Persistent Bottom Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <Button 
              variant="outline"
              size="md"
              onClick={handleBack}
              disabled={isSubmitting}
              className="text-xs sm:text-sm font-medium"
            >
              {step === 1 ? 'Cancel Assessment' : 'Back'}
            </Button>

            <Button 
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!canProceed()}
              className="text-xs sm:text-sm font-semibold shadow-clinical gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting to Triage Engine...</span>
                </>
              ) : (
                <>
                  <span>{step === 3 ? 'Run Clinical Evaluation' : 'Continue'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </>
      )}

    </div>
  );
}
