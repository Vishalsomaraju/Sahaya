import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Video, 
  Sparkles, 
  Activity, 
  FileText, 
  Heart, 
  Thermometer, 
  Wind, 
  Droplets, 
  Clock, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneOff, 
  Mic, 
  MicOff,
  RefreshCw,
  AlertTriangle,
  Info,
  Send
} from 'lucide-react';
import { useState, useEffect } from 'react';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { getDoctorCaseById, reviewDoctorCase, type DoctorCaseItem } from '../../lib/api';

export default function DoctorCaseReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // API State
  const [caseData, setCaseData] = useState<DoctorCaseItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review interaction state
  const [videoStarted, setVideoStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [consultNotes, setConsultNotes] = useState('');
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [facilityNotified, setFacilityNotified] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    getDoctorCaseById(id)
      .then((data) => {
        setCaseData(data);
        if (data.latestConsultation?.notes) {
          setConsultNotes(data.latestConsultation.notes);
          setActionTaken('REVIEWED');
        }
      })
      .catch((err) => {
        console.error('[DoctorCaseReview] Failed to load case:', err);
        setError(err.message || 'Failed to retrieve assessment record from persistent storage.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSignAndSave = async () => {
    if (!id) return;
    if (!consultNotes.trim()) {
      alert('Please enter clinical notes before signing and saving the case.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await reviewDoctorCase(id, {
        notes: consultNotes.trim(),
        action: actionTaken || 'CLINICAL_REVIEW',
        status: actionTaken === 'RESOLVED' ? 'RESOLVED' : 'REVIEWED'
      });

      setSaveSuccess(`Clinical review saved successfully (Consultation #${res.consultation?.id?.slice(0, 8) || 'CONFIRMED'}). Case marked as REVIEWED.`);
      if (caseData) {
        setCaseData({
          ...caseData,
          status: 'REVIEWED'
        });
      }
    } catch (err: any) {
      alert(`Failed to save review: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Critical Emergency
          </span>
        );
      case 'VISIT_PHC':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            Referral: PHC Visit
          </span>
        );
      case 'VIDEO_CONSULT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
            Video Consultation Recommended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Self-Care
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <RefreshCw size={24} className="animate-spin text-[var(--color-primary)]" />
        <span className="text-sm font-medium">Retrieving patient assessment record from backend...</span>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-xl border border-red-200 shadow-sm text-center">
        <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Assessment Not Found</h2>
        <p className="text-xs text-slate-600 mb-6">{error || 'This clinical case could not be retrieved from persistent storage.'}</p>
        <Button variant="primary" onClick={() => navigate('/doctor')}>
          Return to Doctor Queue
        </Button>
      </div>
    );
  }

  // Live video consult simulator
  if (videoStarted) {
    const recordedHr = caseData.vitals?.heartRate;
    const recordedSpo2 = caseData.vitals?.spo2;
    const recordedTemp = caseData.vitals?.temperature;

    return (
      <div className="flex flex-col h-[82vh] max-w-5xl mx-auto rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl relative animate-fade-in text-white">
        
        {/* Call Top Bar */}
        <div className="p-4 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-800/80 text-teal-200 flex items-center justify-center font-bold text-sm">
              {caseData.patientName.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{caseData.patientName}</h2>
              <p className="text-xs text-slate-400">{caseData.patientAge} yrs • {caseData.village} • Tele-consultation session</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-950/80 text-red-300 border border-red-800">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Call
            </span>
          </div>
        </div>

        {/* Video Stage with Patient Vitals Overlay */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto mb-4 text-teal-400">
              <Video size={36} />
            </div>
            <h3 className="text-lg font-bold mb-1">Connecting video link to {caseData.patientName}...</h3>
            <p className="text-xs text-slate-400 mb-6">
              Assisted by: <strong className="text-slate-300">{caseData.submittedByName}</strong> ({caseData.submittedByRole})
            </p>
          </div>

          {/* Clinical Telemetry Hud */}
          <div className="absolute bottom-24 left-6 bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs flex gap-4 backdrop-blur-md">
            <div>
              <span className="text-[10px] text-slate-400 block">HEART RATE</span>
              <span className="font-bold text-teal-400 text-sm">{recordedHr ? `${recordedHr} bpm` : 'Not recorded'}</span>
            </div>
            <div className="w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">SPO₂</span>
              <span className="font-bold text-teal-400 text-sm">{recordedSpo2 ? `${recordedSpo2}%` : 'Not recorded'}</span>
            </div>
            <div className="w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">TEMP</span>
              <span className="font-bold text-amber-400 text-sm">{recordedTemp ? `${recordedTemp}°F` : 'Not recorded'}</span>
            </div>
          </div>

        </div>

        {/* Call Controls Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-center gap-4 z-10">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full transition-colors cursor-pointer ${isMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <Button 
            variant="danger"
            onClick={() => setVideoStarted(false)}
            className="rounded-full px-6 py-2.5 text-sm gap-2"
          >
            <PhoneOff size={18} />
            <span>End Consultation</span>
          </Button>
        </div>

      </div>
    );
  }

  // Real vitals
  const vitals = caseData.vitals;
  const hasAnyVitals = !!vitals && (
    vitals.heartRate !== undefined || 
    vitals.spo2 !== undefined || 
    vitals.temperature !== undefined || 
    vitals.bloodPressure !== undefined
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Top Navigation & Quick Actions */}
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/doctor')} 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/90 px-3.5 py-1.5 rounded-lg shadow-clinical hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Triage Queue</span>
        </button>

        <div className="flex items-center gap-2">
          {caseData.triageLevel === 'VIDEO_CONSULT' && (
            <Button 
              size="md"
              variant="primary"
              onClick={() => setVideoStarted(true)}
              className="gap-2 shadow-clinical"
            >
              <Video size={16} />
              <span>Launch Video Consult</span>
            </Button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccess}</span>
          </div>
          <button 
            onClick={() => setSaveSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Patient Clinical Profile Header Card */}
      <FloatingCard className="p-5 md:p-6 border-slate-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-lg shrink-0">
              {caseData.patientName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  {caseData.patientName}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  ID: {caseData.id.slice(0, 8).toUpperCase()}
                </span>
                {getUrgencyBadge(caseData.triageLevel)}
                {caseData.status === 'REVIEWED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <CheckCircle2 size={12} />
                    Reviewed by Clinician
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{caseData.patientAge} years old • {caseData.patientGender}</span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">{caseData.village} Sector</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <User size={13} className="text-slate-400" />
                  Submitted by: <strong className="text-slate-700">{caseData.submittedByName}</strong> ({caseData.submittedByRole})
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-slate-400" />
                  Logged: {new Date(caseData.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setVideoStarted(true)}
              className="gap-1.5"
            >
              <Video size={15} />
              <span>Direct Video Call</span>
            </Button>
          </div>

        </div>
      </FloatingCard>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
        
        {/* Left Column: AI Case Summary, Clinical Notes, and Symptoms */}
        <div className="flex flex-col gap-6">
          
          {/* AI Clinical Summary (Subtle Indigo Card) */}
          <FloatingCard className="p-5 md:p-6 bg-indigo-50/30 border-indigo-100">
            <div className="flex items-center gap-2.5 mb-3 text-indigo-950 font-bold text-sm">
              <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div className="flex items-center gap-2">
                <span>AI Clinical Triage Summary</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                  Deterministic Safety Engine
                </span>
              </div>
            </div>

            {/* Recommended Action Box */}
            <div className="bg-white/90 p-3.5 rounded-lg border border-indigo-100 mb-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 block mb-1">
                Algorithmic Guidance Action
              </span>
              <p className="text-xs md:text-sm font-semibold text-slate-900 leading-snug">
                {caseData.aiRecommendation || 'Clinical review recommended based on reported symptom presentation.'}
              </p>
            </div>

            {/* Reasoning points */}
            {caseData.aiSummary?.reasoning && caseData.aiSummary.reasoning.length > 0 && (
              <div className="mb-3 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Evaluation Rationales
                </span>
                {caseData.aiSummary.reasoning.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white/70 p-2 rounded border border-indigo-50">
                    <ShieldCheck size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Data Limitations */}
            {caseData.aiSummary?.limitations && caseData.aiSummary.limitations.length > 0 && (
              <div className="p-2.5 rounded bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Info size={13} />
                  Clinical Data Caveats
                </span>
                {caseData.aiSummary.limitations.map((lim, idx) => (
                  <p key={idx} className="text-[11px] pl-4">• {lim}</p>
                ))}
              </div>
            )}
          </FloatingCard>

          {/* Reported Symptoms Breakdown */}
          <FloatingCard className="p-5 md:p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText size={16} className="text-slate-500" />
                <span>Reported Chief Complaints</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {caseData.severity && (
                  <span className="px-2 py-0.5 rounded font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Severity: {caseData.severity}
                  </span>
                )}
                {caseData.duration && (
                  <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-600">
                    Duration: {caseData.duration}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
              {caseData.symptoms.map(s => (
                <div key={s} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>{s}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-100 text-xs text-slate-600">
              <strong className="text-teal-900">Referral Origin: </strong>
              Submitted by {caseData.submittedByName} ({caseData.submittedByRole}) for community patient {caseData.patientName} from {caseData.village} sector.
            </div>
          </FloatingCard>

          {/* Doctor Assessment & Order Entry */}
          <FloatingCard className="p-5 md:p-6 border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Physician Clinical Order & Notes</h3>
              <span className="text-xs text-slate-400">Electronic Prescription & Triage Disposition</span>
            </div>
            
            <textarea
              rows={4}
              placeholder="Enter clinical examination notes, diagnostic differential, prescriptions, or emergency transport directives..."
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white mb-3"
            />

            {/* Quick Order Presets */}
            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Order Presets
              </span>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm"
                  variant={actionTaken === 'PRESCRIBED' ? 'secondary' : 'outline'}
                  onClick={() => {
                    setActionTaken('PRESCRIBED');
                    if (!consultNotes) {
                      setConsultNotes('Prescribed Paracetamol 500mg tid + Oral Rehydration Salts. Advised rest and warm fluid hydration. Follow up in 48 hours if fever persists.');
                    }
                  }}
                  className="text-xs"
                >
                  {actionTaken === 'PRESCRIBED' && <CheckCircle2 size={13} className="text-teal-700" />}
                  <span>Prescribe Symptomatic Relief</span>
                </Button>

                <Button 
                  size="sm"
                  variant={actionTaken === 'PHC_REFERRAL' ? 'secondary' : 'outline'}
                  onClick={() => {
                    setActionTaken('PHC_REFERRAL');
                    if (!consultNotes) {
                      setConsultNotes('Referred to Rampur Primary Health Centre (PHC) for in-person chest auscultation, complete blood count, and physician evaluation within 24 hours.');
                    }
                  }}
                  className="text-xs"
                >
                  {actionTaken === 'PHC_REFERRAL' && <CheckCircle2 size={13} className="text-teal-700" />}
                  <span>Refer to Rampur PHC</span>
                </Button>

                <Button 
                  size="sm"
                  variant={actionTaken === 'EMERGENCY_DISPATCH' ? 'secondary' : 'outline'}
                  onClick={() => {
                    setActionTaken('EMERGENCY_DISPATCH');
                    if (!consultNotes) {
                      setConsultNotes('CRITICAL ALERT: Emergency 108 ambulance dispatch recommended. Patient exhibits acute red-flag distress requiring immediate stabilization at CHC / District Hospital.');
                    }
                  }}
                  className="text-xs text-red-700 border-red-200 hover:bg-red-50"
                >
                  {actionTaken === 'EMERGENCY_DISPATCH' && <CheckCircle2 size={13} className="text-red-700" />}
                  <span>Dispatch 108 Ambulance</span>
                </Button>

                <Button 
                  size="sm"
                  variant={actionTaken === 'RESOLVED' ? 'secondary' : 'outline'}
                  onClick={() => {
                    setActionTaken('RESOLVED');
                    if (!consultNotes) {
                      setConsultNotes('Case reviewed and resolved. Patient confirmed stable with self-care protocol.');
                    }
                  }}
                  className="text-xs"
                >
                  {actionTaken === 'RESOLVED' && <CheckCircle2 size={13} className="text-emerald-700" />}
                  <span>Mark Resolved</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Action: <strong className="text-slate-800">{actionTaken || 'Clinical Evaluation'}</strong>
              </span>

              <Button 
                size="md"
                variant="primary"
                disabled={isSaving}
                onClick={handleSignAndSave}
                className="text-xs px-5 gap-1.5"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving to Record...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Sign & Save Case</span>
                  </>
                )}
              </Button>
            </div>
          </FloatingCard>

        </div>

        {/* Right Column: Vitals Telemetry Panel */}
        <div className="flex flex-col gap-4">
          
          <FloatingCard className="p-5 border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[var(--color-primary)]" />
                <h3 className="text-sm font-bold text-slate-900">Recorded Vitals Telemetry</h3>
              </div>
              {hasAnyVitals ? (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {vitals?.source === 'asha_field' ? 'ASHA Field Evaluation' : 'Clinical Telemetry'}
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Measurements Unavailable
                </span>
              )}
            </div>

            {hasAnyVitals ? (
              <div className="space-y-3">
                
                {/* Heart Rate */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Heart size={14} className="text-red-500" />
                      <span>Heart Rate</span>
                    </div>
                    <span className="text-base font-bold text-slate-900">
                      {vitals?.heartRate !== undefined ? `${vitals.heartRate} bpm` : 'Not recorded'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>Safe threshold: 50 - 100 bpm</span>
                    {vitals?.heartRate !== undefined && (
                      <span className={vitals.heartRate > 100 || vitals.heartRate < 50 ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>
                        {vitals.heartRate > 100 ? "Tachycardia" : vitals.heartRate < 50 ? "Bradycardia" : "Normal"}
                      </span>
                    )}
                  </div>
                </div>

                {/* SpO2 */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Wind size={14} className="text-blue-500" />
                      <span>Oxygen Saturation (SpO₂)</span>
                    </div>
                    <span className="text-base font-bold text-slate-900">
                      {vitals?.spo2 !== undefined ? `${vitals.spo2}%` : 'Not recorded'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>Safe threshold: ≥ 95%</span>
                    {vitals?.spo2 !== undefined && (
                      <span className={vitals.spo2 < 90 ? "text-red-600 font-semibold" : vitals.spo2 < 95 ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
                        {vitals.spo2 < 90 ? "Severe Hypoxia (<90%)" : vitals.spo2 < 95 ? "Moderate Hypoxia" : "Normal"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Temperature */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Thermometer size={14} className="text-amber-500" />
                      <span>Body Temperature</span>
                    </div>
                    <span className="text-base font-bold text-slate-900">
                      {vitals?.temperature !== undefined ? `${vitals.temperature}°F` : 'Not recorded'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>Afebrile threshold: &lt; 100.4°F</span>
                    {vitals?.temperature !== undefined && (
                      <span className={vitals.temperature >= 100.4 ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
                        {vitals.temperature >= 100.4 ? "Febrile / Fever" : "Normal"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Blood Pressure */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Droplets size={14} className="text-teal-600" />
                      <span>Blood Pressure</span>
                    </div>
                    <span className="text-base font-bold text-slate-900">
                      {vitals?.bloodPressure ? `${vitals.bloodPressure} mmHg` : 'Not recorded'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>Target: 120/80 mmHg</span>
                    <span className="text-slate-500">Clinical Reading</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200">
                <Info size={28} className="text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700 mb-1">No Vitals Recorded</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This assessment was submitted without physiological telemetry. Triage recommendations reflect qualitative symptoms only.
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Source: {vitals?.source === 'asha_field' ? 'ASHA Field Worker Kit' : 'Self-Assessment Entry'}</span>
              <span>Persisted Record</span>
            </div>
          </FloatingCard>

          {/* Quick Facility Referral Box */}
          <FloatingCard className="p-4 bg-slate-50/70 border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Primary Facility Dispatch
            </h4>
            <div className="text-xs text-slate-700 mb-3">
              <strong className="block text-slate-900">Rampur Primary Health Centre (PHC)</strong>
              <span>Distance: 2.4 km • In-charge: Dr. Priya Sharma</span>
            </div>

            {facilityNotified ? (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Facility notified of incoming patient referral.</span>
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                fullWidth
                onClick={() => setFacilityNotified(true)}
                className="text-xs bg-white"
              >
                Dispatch Direct Facility Alert
              </Button>
            )}
          </FloatingCard>

        </div>

      </div>

      {/* Safety Non-Diagnostic Disclaimer */}
      <div className="p-3.5 rounded-lg bg-slate-100/80 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-500">
        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong>Informational Guidance Notice:</strong> SAHAYA triage protocols and telemetry recommendations provide deterministic decision support. They do not constitute formal medical diagnosis. Final diagnostic decisions and emergency transportation orders are established by licensed clinicians.
        </p>
      </div>

    </div>
  );
}
