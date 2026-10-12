import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Clock, 
  ClipboardList, 
  Calendar, 
  UserCircle, 
  Heart, 
  Wind, 
  RefreshCw,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { mockCurrentPatient } from '../../data/mockData';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { useVitalsPolling } from '../../hooks/useVitalsPolling';

export default function PatientHome() {
  const navigate = useNavigate();
  const { vitals, isMock, loading, error } = useVitalsPolling();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      
      {/* 1. Concise Patient Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {mockCurrentPatient.name.split(' ')[0]}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200">
              Patient
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {mockCurrentPatient.village} Sector • ID: SAH-2023-8942
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock size={13} className="text-slate-400" />
          <span>Last active: Today</span>
        </div>
      </div>

      {/* 2. Prominent Primary Action: Start Health Assessment */}
      <FloatingCard className="p-6 md:p-8 bg-gradient-to-r from-teal-50/70 via-white to-slate-50 border-teal-200/80 shadow-clinical">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100/70 text-[var(--color-primary-dark)] mb-2.5">
              <Sparkles size={13} />
              <span>AI Triage & Clinical Guidance</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
              How are you feeling today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Experiencing new symptoms or discomfort? Run a quick 2-minute preliminary triage check to receive immediate clinical guidance and connect with a physician.
            </p>
          </div>

          <div className="shrink-0">
            <Button 
              size="lg"
              variant="primary"
              onClick={() => navigate('/patient/assessment')}
              className="text-sm sm:text-base font-semibold shadow-clinical px-6 py-3 gap-2"
            >
              <span>Start Health Assessment</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </FloatingCard>

      {/* 3. Quick Links Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <FloatingCard 
          hoverable
          onClick={() => navigate('/patient/history')}
          className="p-4 border-slate-200 flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center shrink-0">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[var(--color-primary-dark)] transition-colors">
                Health History
              </h3>
              <p className="text-[11px] text-slate-500">Past assessments & visits</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-[var(--color-primary)] transition-colors" />
        </FloatingCard>

        <FloatingCard 
          hoverable
          onClick={() => navigate('/patient/reminders')}
          className="p-4 border-slate-200 flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Reminders
              </h3>
              <p className="text-[11px] text-slate-500">Medication & appointments</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
        </FloatingCard>

        <FloatingCard 
          hoverable
          onClick={() => navigate('/patient/profile')}
          className="p-4 border-slate-200 flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <UserCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Health Profile
              </h3>
              <p className="text-[11px] text-slate-500">Emergency & ASHA details</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </FloatingCard>
      </div>

      {/* 4. Secondary Health Readings & Latest Assessment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Vitals Telemetry Card */}
        <FloatingCard className="p-5 border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-bold text-slate-900">Current Health Telemetry</h3>
            </div>
            {isMock ? (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Simulated Data
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Sensor Feed
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw size={14} className="animate-spin text-[var(--color-primary)]" />
              <span>Fetching telemetry readings...</span>
            </div>
          ) : error ? (
            <div className="py-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span>Telemetry sensor currently offline. Baseline readings shown from last clinical visit.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Heart size={14} className="text-red-500" />
                    <span>Heart Rate</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">Normal</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {vitals?.heartRate || 72}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">bpm</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Wind size={14} className="text-blue-500" />
                    <span>SpO₂ Saturation</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">Optimal</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {vitals?.spo2 || 98}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">%</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Device: Wearable Sensor</span>
            <span>Recorded: Today</span>
          </div>
        </FloatingCard>

        {/* Latest Clinical Assessment & Advisory Card */}
        <FloatingCard className="p-5 border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HeartPulse size={16} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-bold text-slate-900">Latest Health Check-in</h3>
            </div>
            <span className="text-xs text-slate-400">Oct 11, 2026</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-teal-50/60 border border-teal-200 text-xs text-slate-700">
              <span className="font-bold text-[var(--color-primary-dark)] block mb-0.5">
                Previous Assessment Outcome:
              </span>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                Video Consultation Recommended
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Reported Symptoms: Fever, Cough • Follow-up advised with Primary Healthcare Officer.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck size={15} className="text-teal-600" />
                <span>Next recommended check-in: In 48 hours</span>
              </div>
              <button 
                onClick={() => navigate('/patient/history')}
                className="text-[var(--color-primary-dark)] font-semibold hover:underline text-xs cursor-pointer"
              >
                View History →
              </button>
            </div>
          </div>
        </FloatingCard>

      </div>

    </div>
  );
}
