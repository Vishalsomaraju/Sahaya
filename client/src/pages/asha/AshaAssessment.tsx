import { useEffect, useState, useId } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  mockSymptoms, 
  mockPatients,
  mockFacilities
} from '../../data/mockData';
import { 
  Check, 
  UserPlus, 
  ArrowLeft, 
  ArrowRight, 
  Activity, 
  Heart, 
  Thermometer, 
  Wind, 
  Droplets,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import AnalysisProgress from '../../components/shared/AnalysisProgress';
import TriageResult from '../../components/shared/TriageResult';
import PatientSummaryReport from '../../components/shared/PatientSummaryReport';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useVitalsPolling } from '../../hooks/useVitalsPolling';
import {
  submitAshaAssessment,
  getCommunityPatients,
  registerCommunityPatient,
  type AssessmentRecord,
  type TriageResultData,
  type AssessmentVitals,
  type CommunityPatientRecord
} from '../../lib/api';

export default function AshaAssessment() {
  const navigate = useNavigate();
  const location = useLocation();
  const uniqueId = useId();

  // Registry state including live database patients
  const initialPatientId = (location.state as { patientId?: string })?.patientId || '';
  const [patientRegistry, setPatientRegistry] = useState<CommunityPatientRecord[]>(mockPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [patientSearch, setPatientSearch] = useState<string>('');

  // Register New Patient form modal
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [newPatientForm, setNewPatientForm] = useState({ name: '', age: '', village: 'Rampur' });
  const [registeringPatient, setRegisteringPatient] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Clinical assessment state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  
  const [vitals, setVitals] = useState({
    hr: '',
    spo2: '',
    temp: '',
    bp: ''
  });

  const [vitalsSyncedFeedback, setVitalsSyncedFeedback] = useState<boolean>(false);

  // Submission & API state
  const [uiStep, setUiStep] = useState<number>(1);
  const [step, setStep] = useState<'form' | 'analyzing' | 'result'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [persistedAssessment, setPersistedAssessment] = useState<AssessmentRecord | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResultData | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  useEffect(() => {
    getCommunityPatients()
      .then((patients) => {
        if (patients && patients.length > 0) {
          setPatientRegistry(patients);
          setSelectedPatientId((prev) => {
            if (!prev && initialPatientId) {
              return initialPatientId;
            } else if (!prev) {
              return patients[0].id;
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        console.warn('[AshaAssessment] Failed to load live community patients, using offline registry:', err);
      });
  }, [initialPatientId]);

  // Vitals polling hook
  const { 
    vitals: latestVitals, 
    isMock, 
    loading: vitalsLoading, 
    error: vitalsError 
  } = useVitalsPolling(selectedPatientId || 'demo-patient');

  // Active patient object
  const currentPatient = patientRegistry.find(p => p.id === selectedPatientId);

  const handleSyncVitals = () => {
    if (latestVitals) {
      setVitals(prev => ({
        ...prev,
        hr: latestVitals.heartRate?.toString() || prev.hr || '78',
        spo2: latestVitals.spo2?.toString() || prev.spo2 || '97',
        temp: latestVitals.temperature?.toString() || prev.temp || '98.6',
        bp: latestVitals.bloodPressure || prev.bp || '120/80'
      }));
      setVitalsSyncedFeedback(true);
      setTimeout(() => setVitalsSyncedFeedback(false), 3000);
    }
  };

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

  const canProceed = () => {
    if (uiStep === 1) return selectedPatientId !== '';
    if (uiStep === 2) return selectedSymptoms.length > 0;
    if (uiStep === 3) return severity !== '' && duration !== '';
    if (uiStep === 4) return Boolean(vitals.hr && vitals.spo2 && vitals.temp && vitals.bp);
    return false;
  };

  const getValidationMessage = () => {
    if (uiStep === 1 && !selectedPatientId) return 'Please select a patient to continue.';
    if (uiStep === 2 && selectedSymptoms.length === 0) return 'Select at least one symptom experienced by the patient.';
    if (uiStep === 3) {
      if (!severity) return 'Select clinical severity level.';
      if (!duration) return 'Select symptom duration.';
    }
    if (uiStep === 4) {
      const missing: string[] = [];
      if (!vitals.hr) missing.push('Heart Rate');
      if (!vitals.spo2) missing.push('SpO₂');
      if (!vitals.temp) missing.push('Temperature');
      if (!vitals.bp) missing.push('Blood Pressure');
      if (missing.length > 0) return `Required vitals missing: ${missing.join(', ')}`;
    }
    return null;
  };

  const handleNext = () => {
    if (uiStep < 4) {
      setUiStep(uiStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (uiStep > 1) {
      setUiStep(uiStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/asha');
    }
  };

  const handleRegisterNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name.trim() || !newPatientForm.age) return;
    setRegisteringPatient(true);
    setRegisterError(null);

    try {
      const created = await registerCommunityPatient({
        name: newPatientForm.name.trim(),
        age: parseInt(newPatientForm.age, 10),
        village: newPatientForm.village || 'Rampur'
      });

      setPatientRegistry([created, ...patientRegistry]);
      setSelectedPatientId(created.id);
      setShowRegisterModal(false);
      setNewPatientForm({ name: '', age: '', village: 'Rampur' });
    } catch (err: any) {
      console.error('[AshaAssessment] Failed to register patient in database:', err);
      setRegisterError(err.message || 'Failed to register patient in clinical registry.');
    } finally {
      setRegisteringPatient(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);
    setSubmitError(null);
    setStep('analyzing');

    try {
      // Parse vitals into structured clinical format
      const vitalsPayload: AssessmentVitals | undefined = (vitals.hr || vitals.spo2 || vitals.temp || vitals.bp) ? {
        heartRate: vitals.hr ? parseInt(vitals.hr, 10) : undefined,
        spo2: vitals.spo2 ? parseFloat(vitals.spo2) : undefined,
        temperature: vitals.temp ? parseFloat(vitals.temp) : undefined,
        bloodPressure: vitals.bp ? vitals.bp.trim() : undefined,
        source: 'asha_field'
      } : undefined;

      const response = await submitAshaAssessment({
        patientId: selectedPatientId,
        symptoms: selectedSymptoms,
        severity: (severity as 'Mild' | 'Moderate' | 'Severe') || undefined,
        duration: duration || undefined,
        vitals: vitalsPayload
      });

      if (!response?.data) {
        throw new Error('Assessment created without a valid response body.');
      }

      setPersistedAssessment(response.data);
      setTriageResult(response.triage);
      setIsSubmitting(false);
      setStep('result');
    } catch (err: any) {
      console.error('[AshaAssessment] Clinical submission failed:', err);
      setSubmitError(err.message || 'Unable to communicate with the triage decision service.');
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    { number: 1, label: 'Patient' },
    { number: 2, label: 'Symptoms' },
    { number: 3, label: 'Severity' },
    { number: 4, label: 'Vitals & Review' }
  ];

  const filteredPatients = patientRegistry.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.village.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col min-h-[70vh] justify-center max-w-2xl mx-auto px-4">
        <AnalysisProgress 
          isLoading={isSubmitting}
          error={submitError}
          onRetry={handleSubmit}
          onCancel={() => {
            setStep('form');
            setIsSubmitting(false);
            setSubmitError(null);
          }}
        />
      </div>
    );
  }

  if (step === 'result' && triageResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-6 pb-16 max-w-4xl mx-auto px-4 md:px-0 pt-4"
      >
        {/* Patient Summary Header in Result */}
        {currentPatient && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-sm">
                {currentPatient.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{currentPatient.name}</div>
                <div className="text-xs text-slate-500">{currentPatient.age} yrs • {currentPatient.village}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span>Severity: <strong className="text-slate-800">{severity}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Duration: <strong className="text-slate-800">{duration}</strong></span>
            </div>
          </div>
        )}

        <TriageResult 
          level={triageResult.triageLevel}
          title={triageResult.recommendedAction}
          risk={
            triageResult.priority === 'CRITICAL' ? 'Critical' :
            triageResult.priority === 'HIGH' ? 'Moderate' :
            triageResult.priority === 'MEDIUM' ? 'Low-Moderate' : 'Low'
          }
          nextAction={triageResult.recommendedAction}
          explanation={triageResult.reasoning}
          nextSteps={triageResult.nextSteps}
          limitations={triageResult.limitations}
          escalationGuidance={triageResult.escalationGuidance}
          disclaimer={triageResult.disclaimer}
          facilities={mockFacilities}
          symptoms={selectedSymptoms}
          assessmentId={persistedAssessment?.id}
          onDownloadSummary={() => setShowSummary(true)}
          onConnectDoctor={triageResult.triageLevel === 'VIDEO_CONSULT' ? () => alert('Initiating Tele-consultation queue with PHC Medical Officer...') : undefined}
        />
        
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button 
            variant="outline"
            size="md"
            onClick={() => navigate('/asha')}
            className="gap-2 text-xs sm:text-sm"
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </Button>

          <Button 
            variant="primary"
            size="md"
            onClick={() => {
              setStep('form');
              setUiStep(1);
              setSelectedSymptoms([]);
              setSeverity('');
              setDuration('');
              setVitals({ hr: '', spo2: '', temp: '', bp: '' });
              setPersistedAssessment(null);
              setTriageResult(null);
            }}
            className="gap-2 text-xs sm:text-sm"
          >
            <span>Start Another Assessment</span>
          </Button>
        </div>

        {showSummary && (
          <PatientSummaryReport 
            summary={{
              patientName: currentPatient?.name || 'Community Patient',
              age: currentPatient?.age || 35,
              symptoms: selectedSymptoms,
              severity,
              duration,
              triageLevel: triageResult.triageLevel,
              priority: triageResult.priority,
              vitals: persistedAssessment?.vitals || (vitals.hr || vitals.spo2 ? {
                heartRate: vitals.hr,
                spo2: vitals.spo2,
                temperature: vitals.temp,
                bloodPressure: vitals.bp,
                source: 'asha_field'
              } : null),
              recommendation: triageResult.recommendedAction,
              assessmentId: persistedAssessment?.id,
              generatedAt: persistedAssessment?.createdAt ? new Date(persistedAssessment.createdAt).toLocaleString() : new Date().toLocaleString()
            }}
            onClose={() => setShowSummary(false)}
          />
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto px-4 md:px-0 pt-2 pb-16 animate-fade-in">
      
      {/* 1. Header with Breadcrumb Back & Step Progress */}
      <div className="flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors p-1.5 -ml-1.5 rounded-md hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{uiStep === 1 ? 'Cancel & Return to Dashboard' : 'Previous Step'}</span>
          </button>

          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Step {uiStep} of 4
          </span>
        </div>

        {/* Clinical Progress Stepper */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="grid grid-cols-4 gap-2">
            {stepLabels.map((s) => {
              const isCompleted = uiStep > s.number;
              const isCurrent = uiStep === s.number;
              return (
                <div key={s.number} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className={clsx(
                      "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-colors",
                      isCompleted ? "bg-[var(--color-primary)] text-white" :
                      isCurrent ? "bg-teal-50 border border-teal-300 text-[var(--color-primary-dark)]" :
                      "bg-slate-100 text-slate-400"
                    )}>
                      {isCompleted ? <Check size={13} strokeWidth={3} /> : s.number}
                    </div>
                    <span className={clsx(
                      "text-xs font-semibold hidden sm:inline truncate",
                      isCurrent ? "text-slate-900" : isCompleted ? "text-slate-700" : "text-slate-400"
                    )}>
                      {s.label}
                    </span>
                  </div>
                  <div className={clsx(
                    "h-1 rounded-full w-full transition-all duration-300",
                    isCompleted ? "bg-[var(--color-primary)]" :
                    isCurrent ? "bg-teal-400" : "bg-slate-100"
                  )} />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. Persistent Patient Context Chip (Visible on Steps 2, 3, 4) */}
      {uiStep > 1 && currentPatient && (
        <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-700 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentPatient.name.charAt(0)}
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-900 mr-2">{currentPatient.name}</span>
              <span className="text-slate-500 font-medium">
                {currentPatient.age} yrs • {currentPatient.village}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setUiStep(1)}
            className="text-[var(--color-primary-dark)] hover:underline font-semibold text-xs shrink-0 ml-2 cursor-pointer"
          >
            Change Patient
          </button>
        </div>
      )}

      {/* 3. Step Content Area */}
      <div className="relative min-h-[420px]">
        
        {/* STEP 1: PATIENT SELECTION */}
        {uiStep === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Select Patient
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Choose a registered community member or add a new village resident.
                </p>
              </div>

              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowRegisterModal(true)}
                className="self-start sm:self-auto gap-1.5 text-xs text-[var(--color-primary-dark)] border-teal-200 bg-teal-50/40 hover:bg-teal-50"
              >
                <UserPlus size={15} />
                <span>Register New Patient</span>
              </Button>
            </div>

            {/* Patient Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search registered patient by name or village..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] shadow-xs transition-colors"
              />
            </div>

            {/* Patient Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredPatients.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No matching patients found. Click &quot;Register New Patient&quot; above to add a new record.
                </div>
              ) : (
                filteredPatients.map(p => {
                  const isSelected = selectedPatientId === p.id;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={clsx(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3",
                        isSelected 
                          ? "border-[var(--color-primary)] bg-teal-50/50 shadow-xs" 
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={clsx(
                          "w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
                          isSelected 
                            ? "bg-[var(--color-primary)] text-white" 
                            : "bg-slate-100 text-slate-600"
                        )}>
                          {p.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <h3 className={clsx(
                            "text-sm font-bold truncate",
                            isSelected ? "text-[var(--color-primary-dark)]" : "text-slate-900"
                          )}>
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {p.age} yrs • {p.village}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {p.id.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className={clsx(
                        "w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                        isSelected 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" 
                          : "border-slate-300 bg-white text-transparent"
                      )}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* STEP 2: SYMPTOM SELECTION */}
        {uiStep === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Reported Symptoms
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Select all active symptoms reported by the patient.
                </p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md self-start sm:self-auto">
                {selectedSymptoms.length} selected
              </span>
            </div>

            {/* Symptom Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mockSymptoms.map(symptom => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={clsx(
                      "p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative group",
                      isSelected 
                        ? "border-[var(--color-primary)] bg-teal-50/60 shadow-xs" 
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        isSelected 
                          ? "bg-[var(--color-primary)] text-white" 
                          : "bg-slate-100 text-slate-500 group-hover:text-slate-700"
                      )}>
                        <Activity size={16} />
                      </div>

                      <div className={clsx(
                        "w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                        isSelected 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" 
                          : "border-slate-300 bg-white text-transparent"
                      )}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>

                    <span className={clsx(
                      "text-xs sm:text-sm font-bold leading-tight",
                      isSelected ? "text-[var(--color-primary-dark)]" : "text-slate-800"
                    )}>
                      {symptom}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedSymptoms.length > 0 && (
              <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100 text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
                <span>
                  Selected for triage: <strong className="text-slate-900">{selectedSymptoms.join(', ')}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CLINICAL SEVERITY & DURATION */}
        {uiStep === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Severity & Duration
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Quantify the onset duration and acute impact of the patient&apos;s symptoms.
              </p>
            </div>

            {/* Severity Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>Clinical Severity Level</span>
                <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { 
                    level: 'Mild', 
                    desc: 'Manageable symptoms, normal daily activities possible',
                    color: 'hover:border-teal-300' 
                  },
                  { 
                    level: 'Moderate', 
                    desc: 'Noticeable discomfort, interferes with work or routine',
                    color: 'hover:border-amber-300' 
                  },
                  { 
                    level: 'Severe', 
                    desc: 'Acute distress, severe pain or breathlessness',
                    color: 'hover:border-red-300' 
                  }
                ].map(item => {
                  const isSelected = severity === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSeverity(item.level)}
                      className={clsx(
                        "p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-32",
                        isSelected 
                          ? "border-[var(--color-primary)] bg-teal-50/60 shadow-xs" 
                          : `border-slate-200 bg-white ${item.color} hover:bg-slate-50/50`
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={clsx(
                          "text-base font-bold",
                          isSelected ? "text-[var(--color-primary-dark)]" : "text-slate-900"
                        )}>
                          {item.level}
                        </span>

                        <div className={clsx(
                          "w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                          isSelected 
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" 
                            : "border-slate-300 bg-white text-transparent"
                        )}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-normal">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>Duration of Symptoms</span>
                <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { time: 'Less than 3 days', label: 'Acute (< 3 days)' },
                  { time: '3 to 7 days', label: 'Sub-acute (3 – 7 days)' },
                  { time: 'More than 7 days', label: 'Prolonged (> 7 days)' }
                ].map(item => {
                  const isSelected = duration === item.time;
                  return (
                    <button
                      key={item.time}
                      type="button"
                      onClick={() => setDuration(item.time)}
                      className={clsx(
                        "p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between",
                        isSelected 
                          ? "border-[var(--color-primary)] bg-teal-50/60 shadow-xs" 
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock size={16} className={isSelected ? "text-[var(--color-primary)]" : "text-slate-400"} />
                        <span className={clsx(
                          "text-xs sm:text-sm font-bold",
                          isSelected ? "text-[var(--color-primary-dark)]" : "text-slate-800"
                        )}>
                          {item.label}
                        </span>
                      </div>

                      <div className={clsx(
                        "w-5 h-5 rounded-full flex items-center justify-center border transition-colors shrink-0",
                        isSelected 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" 
                          : "border-slate-300 bg-white text-transparent"
                      )}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* STEP 4: VITALS CAPTURE & REVIEW */}
        {uiStep === 4 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Vitals Screening
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Record physiological baseline measurements manually or sync with a connected wearable.
                </p>
              </div>

              {/* Wearable Auto-fill Trigger */}
              <Button 
                variant="outline"
                size="sm"
                onClick={handleSyncVitals}
                disabled={vitalsLoading}
                className="self-start sm:self-auto gap-2 border-teal-200 text-[var(--color-primary-dark)] bg-teal-50/40 hover:bg-teal-50 font-semibold text-xs"
              >
                {vitalsLoading ? (
                  <RefreshCw size={14} className="animate-spin text-[var(--color-primary)]" />
                ) : (
                  <Activity size={14} className="text-[var(--color-primary)]" />
                )}
                <span>Auto-fill from Wearable</span>
              </Button>
            </div>

            {/* Telemetry Status Bar (Explicit indication of simulated vs real) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Telemetry Source:</span>
                {isMock ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Simulated Telemetry (Field Demo)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Connected Device ({latestVitals?.device || 'BLE Monitor'})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-slate-500">
                {latestVitals?.recordedAt && (
                  <span>Captured: {new Date(latestVitals.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                )}
                {vitalsSyncedFeedback && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Vitals synced
                  </span>
                )}
              </div>
            </div>

            {vitalsError && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>Wearable telemetry offline ({vitalsError}). Please enter readings manually.</span>
              </div>
            )}

            {/* Vitals Input Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Heart Rate */}
              <FloatingCard className="p-4 sm:p-5 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Heart size={16} className="text-red-500" />
                    <label htmlFor={`${uniqueId}-hr`}>Heart Rate</label>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Norm: 60–100 bpm</span>
                </div>

                <div className="relative">
                  <input 
                    id={`${uniqueId}-hr`}
                    type="number"
                    name="hr"
                    value={vitals.hr}
                    onChange={handleVitalsChange}
                    placeholder="78"
                    className="w-full text-3xl sm:text-4xl font-extrabold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    bpm
                  </span>
                </div>
              </FloatingCard>

              {/* SpO2 */}
              <FloatingCard className="p-4 sm:p-5 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Wind size={16} className="text-blue-500" />
                    <label htmlFor={`${uniqueId}-spo2`}>Oxygen Saturation (SpO₂)</label>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Norm: 95–100%</span>
                </div>

                <div className="relative">
                  <input 
                    id={`${uniqueId}-spo2`}
                    type="number"
                    name="spo2"
                    value={vitals.spo2}
                    onChange={handleVitalsChange}
                    placeholder="98"
                    className="w-full text-3xl sm:text-4xl font-extrabold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
              </FloatingCard>

              {/* Temperature */}
              <FloatingCard className="p-4 sm:p-5 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Thermometer size={16} className="text-amber-500" />
                    <label htmlFor={`${uniqueId}-temp`}>Temperature</label>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Norm: 97.0–99.0 °F</span>
                </div>

                <div className="relative">
                  <input 
                    id={`${uniqueId}-temp`}
                    type="number"
                    step="0.1"
                    name="temp"
                    value={vitals.temp}
                    onChange={handleVitalsChange}
                    placeholder="98.6"
                    className="w-full text-3xl sm:text-4xl font-extrabold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    °F
                  </span>
                </div>
              </FloatingCard>

              {/* Blood Pressure */}
              <FloatingCard className="p-4 sm:p-5 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Droplets size={16} className="text-indigo-500" />
                    <label htmlFor={`${uniqueId}-bp`}>Blood Pressure</label>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Norm: 120/80 mmHg</span>
                </div>

                <div className="relative">
                  <input 
                    id={`${uniqueId}-bp`}
                    type="text"
                    name="bp"
                    value={vitals.bp}
                    onChange={handleVitalsChange}
                    placeholder="120/80"
                    className="w-full text-3xl sm:text-4xl font-extrabold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    mmHg
                  </span>
                </div>
              </FloatingCard>

            </div>

            {/* Assessment Summary Pre-flight Check */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col gap-2">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Pre-triage Verification
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>Patient: <strong className="text-slate-900">{currentPatient?.name} ({currentPatient?.age}y)</strong></div>
                <div>Symptoms: <strong className="text-slate-900">{selectedSymptoms.length} recorded</strong></div>
                <div>Reported Severity: <strong className="text-slate-900">{severity} ({duration})</strong></div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 4. Bottom Navigation & Action Bar */}
      <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div className="text-xs text-slate-500 w-full sm:w-auto text-center sm:text-left">
          {getValidationMessage() ? (
            <span className="text-amber-700 font-medium flex items-center justify-center sm:justify-start gap-1">
              <AlertCircle size={14} />
              {getValidationMessage()}
            </span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 size={14} />
              Ready to proceed
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {uiStep > 1 && (
            <Button 
              variant="outline"
              size="md"
              onClick={handleBack}
              className="flex-1 sm:flex-none text-xs sm:text-sm font-semibold"
            >
              Back
            </Button>
          )}

          <Button 
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 sm:flex-none text-xs sm:text-sm font-semibold min-w-[160px] gap-2 h-11"
          >
            <span>{uiStep === 4 ? "Run Clinical Triage" : "Continue"}</span>
            {uiStep < 4 ? <ArrowRight size={16} /> : <Activity size={16} />}
          </Button>
        </div>

      </div>

      {/* Register New Patient Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[var(--color-primary-dark)] flex items-center justify-center">
                    <UserPlus size={18} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Register Village Patient</h3>
                </div>
                <button 
                  onClick={() => setShowRegisterModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRegisterNewPatient} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Kamala Devi"
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Age *
                    </label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      max="110"
                      placeholder="e.g. 42"
                      value={newPatientForm.age}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Village Sector
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rampur"
                      value={newPatientForm.village}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, village: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                    />
                  </div>
                </div>

                {registerError && (
                  <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded border border-red-200">
                    {registerError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={registeringPatient}
                    onClick={() => setShowRegisterModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={registeringPatient}
                  >
                    {registeringPatient ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      'Save & Select Patient'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
