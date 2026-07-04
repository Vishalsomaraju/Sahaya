import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSymptoms, mockPatients, mockTriage, generatePatientSummary } from '../../data/mockData';
import { Check, UserPlus, ArrowLeft, Activity, Heart, Thermometer, Wind, Droplets } from 'lucide-react';
import AnalysisProgress from '../../components/shared/AnalysisProgress';
import TriageResult from '../../components/shared/TriageResult';
import PatientSummaryReport from '../../components/shared/PatientSummaryReport';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function AshaAssessment() {
  const navigate = useNavigate();
  
  // State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  
  const [vitals, setVitals] = useState({
    hr: '',
    spo2: '',
    temp: '',
    bp: ''
  });

  const [uiStep, setUiStep] = useState(1);
  const [step, setStep] = useState<'form' | 'analyzing' | 'result'>('form');
  const [triageResult, setTriageResult] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (uiStep < 4) setUiStep(uiStep + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (uiStep > 1) setUiStep(uiStep - 1);
    else navigate(-1);
  };

  const canProceed = () => {
    if (uiStep === 1) return selectedPatientId !== '';
    if (uiStep === 2) return selectedSymptoms.length > 0;
    if (uiStep === 3) return severity !== '' && duration !== '';
    if (uiStep === 4) return vitals.hr && vitals.spo2 && vitals.temp && vitals.bp;
    return false;
  };

  const handleSubmit = () => {
    setStep('analyzing');
    
    // Compute result
    const result = mockTriage(selectedSymptoms, severity, duration);
    setTriageResult(result);
    
    const patient = mockPatients.find(p => p.id === selectedPatientId) || { name: 'New Patient', age: 30 };
    const summary = generatePatientSummary(patient, selectedSymptoms, vitals, result);
    setSummaryData(summary);
  };

  const stepVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col min-h-[80vh] justify-center">
        <AnalysisProgress onComplete={() => setStep('result')} />
      </div>
    );
  }

  if (step === 'result') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-8 pb-16 max-w-4xl mx-auto px-4 md:px-0 pt-6"
      >
        <TriageResult 
          level={triageResult.level}
          title={triageResult.title}
          risk={triageResult.risk}
          nextAction={triageResult.nextAction}
          explanation={triageResult.explanation}
          facilities={triageResult.facilities}
          onDownloadSummary={() => setShowSummary(true)}
          onConnectDoctor={triageResult.level === 'VIDEO_CONSULT' ? () => alert('Connecting to Doctor...') : undefined}
        />
        
        <Button 
          variant="ghost"
          onClick={() => navigate('/asha')}
          className="self-center mt-4 h-14 px-8 text-lg font-bold"
        >
          <ArrowLeft size={24} className="mr-3" />
          Back to Dashboard
        </Button>

        {showSummary && summaryData && (
          <PatientSummaryReport 
            summary={summaryData}
            onClose={() => setShowSummary(false)}
          />
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-16 max-w-4xl mx-auto px-4 md:px-0 pt-6 min-h-[80vh]">
      
      {/* Header & Progress */}
      <div className="flex flex-col gap-6">
        <button onClick={handleBack} className="self-start p-3 -ml-3 text-[var(--color-text-muted)] hover:text-[#ea580c] hover:bg-orange-50 rounded-full transition-colors">
          <ArrowLeft size={28} />
        </button>
        <div>
          <span className="text-sm font-extrabold text-[#ea580c] tracking-widest uppercase block mb-3">Step {uiStep} of 4</span>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-400 to-[#ea580c]"
              initial={{ width: `${((uiStep - 1) / 4) * 100}%` }}
              animate={{ width: `${(uiStep / 4) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 mt-6 relative">
        <AnimatePresence mode="wait">
          {uiStep === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-10">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">Who is the patient?</h1>
                <p className="text-xl text-[var(--color-text-muted)] font-medium">Select from your registry or add new.</p>
              </div>
              
              <div className="flex flex-col gap-5 mt-2 max-w-2xl mx-auto w-full md:mx-0">
                {mockPatients.map(p => (
                  <FloatingCard 
                    key={p.id}
                    hoverable
                    onClick={() => setSelectedPatientId(p.id)}
                    className={clsx(
                      "p-6 flex items-center justify-between border-2 transition-all rounded-3xl",
                      selectedPatientId === p.id ? "border-[#ea580c] bg-orange-50/50 shadow-md shadow-orange-500/10" : "border-transparent hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className={clsx(
                        "w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl transition-colors shadow-sm",
                        selectedPatientId === p.id 
                          ? "bg-gradient-to-br from-orange-400 to-[#ea580c] text-white" 
                          : "bg-gray-100 text-[var(--color-text-muted)]"
                      )}>
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className={clsx("font-extrabold text-2xl mb-1", selectedPatientId === p.id ? "text-[#9a3412]" : "text-[var(--color-text-primary)]")}>{p.name}</h3>
                        <p className="text-base font-medium text-[var(--color-text-muted)]">{p.age} yrs • {p.village}</p>
                      </div>
                    </div>
                    {selectedPatientId === p.id && (
                      <div className="w-8 h-8 rounded-full bg-[#ea580c] text-white flex items-center justify-center shadow-sm">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    )}
                  </FloatingCard>
                ))}

                <div className="flex items-center justify-center py-4">
                  <span className="text-sm text-[var(--color-text-muted)] font-extrabold uppercase tracking-widest">OR</span>
                </div>

                <Button variant="outline" size="lg" className="border-dashed h-20 text-xl font-bold text-orange-600 border-orange-300 hover:bg-orange-50 rounded-3xl transition-all">
                  <UserPlus size={24} className="mr-3" />
                  Register New Patient
                </Button>
              </div>
            </motion.div>
          )}

          {uiStep === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-10">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">What symptoms are they experiencing?</h1>
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
                          ? "border-[#ea580c] bg-orange-50/50 shadow-md shadow-orange-500/10" 
                          : "border-transparent hover:border-gray-200"
                      )}
                    >
                      <div className={clsx(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm",
                        isSelected ? "bg-[#ea580c] text-white" : "bg-gray-100 text-[var(--color-text-muted)]"
                      )}>
                        {isSelected ? <Check size={24} strokeWidth={3} /> : <Activity size={24} />}
                      </div>
                      <span className={clsx("font-extrabold text-lg", isSelected ? "text-[#9a3412]" : "text-[var(--color-text-primary)]")}>
                        {symptom}
                      </span>
                    </FloatingCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {uiStep === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-12">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">Severity & Duration</h1>
                <p className="text-xl text-[var(--color-text-muted)] font-medium">Please provide more details on the symptoms.</p>
              </div>
              
              <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full md:mx-0">
                <h2 className="text-base font-extrabold text-gray-400 uppercase tracking-widest">Severity</h2>
                <div className="grid grid-cols-3 gap-4">
                  {['Mild', 'Moderate', 'Severe'].map(level => {
                    const isSelected = severity === level;
                    return (
                      <FloatingCard
                        key={level}
                        hoverable
                        onClick={() => setSeverity(level)}
                        className={clsx(
                          "p-6 flex items-center justify-center text-center border-2 transition-all rounded-3xl h-24",
                          isSelected ? "border-[#ea580c] bg-orange-50/50 shadow-md shadow-orange-500/10 text-[#9a3412]" : "border-transparent hover:border-gray-200 text-[var(--color-text-primary)]"
                        )}
                      >
                        <span className="font-extrabold text-xl">{level}</span>
                      </FloatingCard>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full md:mx-0">
                <h2 className="text-base font-extrabold text-gray-400 uppercase tracking-widest">Duration</h2>
                <div className="flex flex-col gap-4">
                  {['Less than 3 days', '3 to 7 days', 'More than 7 days'].map(time => {
                    const isSelected = duration === time;
                    return (
                      <FloatingCard
                        key={time}
                        hoverable
                        onClick={() => setDuration(time)}
                        className={clsx(
                          "p-6 flex items-center justify-between border-2 transition-all rounded-3xl",
                          isSelected ? "border-[#ea580c] bg-orange-50/50 shadow-md shadow-orange-500/10" : "border-transparent hover:border-gray-200"
                        )}
                      >
                        <span className={clsx("font-extrabold text-2xl", isSelected ? "text-[#9a3412]" : "text-[var(--color-text-primary)]")}>{time}</span>
                        <div className={clsx(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                          isSelected ? "border-[#ea580c] bg-[#ea580c] text-white" : "border-gray-200"
                        )}>
                          {isSelected && <Check size={18} strokeWidth={3} />}
                        </div>
                      </FloatingCard>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {uiStep === 4 && (
            <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-10">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">Vitals Check</h1>
                <p className="text-xl text-[var(--color-text-muted)] font-medium">Record the patient's current vitals.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 max-w-3xl">
                <FloatingCard className="p-8 flex flex-col gap-4 rounded-3xl border-2 border-transparent focus-within:border-orange-200 transition-colors">
                  <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                    <Heart size={24} className="text-red-500" />
                    <label className="text-sm font-extrabold uppercase tracking-widest">Heart Rate</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" name="hr" value={vitals.hr} onChange={handleVitalsChange} placeholder="88"
                      className="w-full text-5xl font-extrabold p-0 bg-transparent border-none focus:outline-none focus:ring-0 text-[var(--color-text-primary)] placeholder-gray-200"
                    />
                    <span className="absolute right-0 bottom-2 text-lg font-bold text-gray-400">bpm</span>
                  </div>
                </FloatingCard>

                <FloatingCard className="p-8 flex flex-col gap-4 rounded-3xl border-2 border-transparent focus-within:border-blue-200 transition-colors">
                  <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                    <Wind size={24} className="text-blue-500" />
                    <label className="text-sm font-extrabold uppercase tracking-widest">SpO₂</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" name="spo2" value={vitals.spo2} onChange={handleVitalsChange} placeholder="98"
                      className="w-full text-5xl font-extrabold p-0 bg-transparent border-none focus:outline-none focus:ring-0 text-[var(--color-text-primary)] placeholder-gray-200"
                    />
                    <span className="absolute right-0 bottom-2 text-lg font-bold text-gray-400">%</span>
                  </div>
                </FloatingCard>

                <FloatingCard className="p-8 flex flex-col gap-4 rounded-3xl border-2 border-transparent focus-within:border-amber-200 transition-colors">
                  <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                    <Thermometer size={24} className="text-amber-500" />
                    <label className="text-sm font-extrabold uppercase tracking-widest">Temperature</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" step="0.1" name="temp" value={vitals.temp} onChange={handleVitalsChange} placeholder="98.6"
                      className="w-full text-5xl font-extrabold p-0 bg-transparent border-none focus:outline-none focus:ring-0 text-[var(--color-text-primary)] placeholder-gray-200"
                    />
                    <span className="absolute right-0 bottom-2 text-lg font-bold text-gray-400">°F</span>
                  </div>
                </FloatingCard>

                <FloatingCard className="p-8 flex flex-col gap-4 rounded-3xl border-2 border-transparent focus-within:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                    <Droplets size={24} className="text-indigo-500" />
                    <label className="text-sm font-extrabold uppercase tracking-widest">Blood Pressure</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" name="bp" value={vitals.bp} onChange={handleVitalsChange} placeholder="120/80"
                      className="w-full text-5xl font-extrabold p-0 bg-transparent border-none focus:outline-none focus:ring-0 text-[var(--color-text-primary)] placeholder-gray-200 tracking-tight"
                    />
                  </div>
                </FloatingCard>
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
          className="h-16 text-xl rounded-2xl font-bold shadow-lg bg-[#ea580c] hover:bg-[#c2410c]"
        >
          {uiStep === 4 ? "Run AI Triage" : "Continue"}
        </Button>
      </div>

    </div>
  );
}
