import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  AlertTriangle, 
  Clock, 
  Video, 
  ChevronRight, 
  Heart, 
  Wind, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { mockDoctor, mockIncomingCases } from '../../data/mockData';
import FloatingCard from '../../components/shared/FloatingCard';
import StatCard from '../../components/shared/StatCard';
import Button from '../../components/shared/Button';
import { useVitalsPolling } from '../../hooks/useVitalsPolling';
import { getDoctorCases, type DoctorCaseItem } from '../../lib/api';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'EMERGENCY' | 'VIDEO_CONSULT' | 'VISIT_PHC'>('ALL');
  const [cases, setCases] = useState<DoctorCaseItem[]>([]);
  const [loadingCases, setLoadingCases] = useState<boolean>(true);
  const [casesError, setCasesError] = useState<string | null>(null);

  const fetchCases = useCallback(() => {
    setLoadingCases(true);
    setCasesError(null);
    getDoctorCases()
      .then((res) => {
        if (res && res.cases) {
          setCases(res.cases);
        }
      })
      .catch((err) => {
        console.warn('[DoctorDashboard] Failed to fetch live cases from backend, using cached view:', err);
        setCasesError('Could not reach backend API. Showing offline cached cases.');
        // Map mock incoming cases as emergency fallback
        const fallback: DoctorCaseItem[] = mockIncomingCases.map((m) => ({
          id: m.id,
          patientId: m.id,
          patientName: m.patient,
          patientAge: m.age,
          patientGender: 'Unknown',
          village: 'Rampur',
          phone: '9876543210',
          submittedByName: m.asha,
          submittedByRole: 'ASHA',
          symptoms: m.symptoms,
          triageLevel: m.urgency as any,
          priority: m.urgency === 'EMERGENCY' ? 'HIGH' : m.urgency === 'VISIT_PHC' ? 'HIGH' : 'MEDIUM',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          vitals: null,
        }));
        setCases(fallback);
      })
      .finally(() => {
        setLoadingCases(false);
      });
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Priority case
  const nextCase = cases.find(c => c.status === 'PENDING') || cases[0];
  const { vitals, isMock, loading: vitalsLoading, error: vitalsError } = useVitalsPolling(
    nextCase?.patientId || '', 
    6000, 
    !loadingCases && !!nextCase?.patientId
  );

  // Counts derived from live cases
  const totalCasesCount = cases.length;
  const emergencyCount = cases.filter(c => c.triageLevel === 'EMERGENCY').length;
  const videoConsultCount = cases.filter(c => c.triageLevel === 'VIDEO_CONSULT').length;
  const phcReferralCount = cases.filter(c => c.triageLevel === 'VISIT_PHC').length;

  const filteredCases = filter === 'ALL' 
    ? cases 
    : cases.filter(c => c.triageLevel === filter);

  const renderUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            Emergency
          </span>
        );
      case 'VISIT_PHC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Visit PHC
          </span>
        );
      case 'VIDEO_CONSULT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span>
            Video Consult
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            Self Care
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8">
      
      {/* 1. Clinical Welcome Banner & AI Clinical Assistant Card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        
        {/* Practice Overview Banner */}
        <FloatingCard className="p-5 md:p-6 bg-gradient-to-r from-teal-50/60 via-white to-slate-50 border-teal-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)] bg-teal-100/70 px-2.5 py-0.5 rounded-md">
                Clinical Shift
              </span>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Clock size={13} className="text-slate-400" />
                <span>Today • Connected to PHC Network</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
              Good morning, {mockDoctor.name}
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              {mockDoctor.role} • Primary Healthcare Tele-triage Unit
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span>Queue Status: <strong className="text-slate-900 font-semibold">{totalCasesCount} live cases</strong></span>
              <span className="text-slate-300">•</span>
              <span>Critical Alerts: <strong className="text-red-600 font-semibold">{emergencyCount} urgent</strong></span>
            </div>
            <button 
              onClick={() => navigate('/doctor/consultations')}
              className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Consultation Log</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </FloatingCard>

        {/* AI Clinical Assistant Card */}
        <FloatingCard className="p-5 md:p-6 bg-indigo-50/40 border-indigo-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-indigo-950">AI Clinical Assistant</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded">
                    Decision Support
                  </span>
                </div>
                <p className="text-xs text-indigo-900/70">Deterministic safety engine & telemetry support</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg p-3 border border-indigo-100/80 mb-3 text-xs text-slate-700 leading-relaxed">
            {emergencyCount > 0 ? (
              <p>
                <strong className="text-red-600 font-semibold">{emergencyCount} emergency cases require immediate physician review</strong> due to critical hypoxia, severe tachycardia, or red-flag respiratory distress.
              </p>
            ) : (
              <p>All active cases are clinically stable. No unreviewed emergency vitals detected.</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Protocol Compliance: 100% Deterministic</span>
            {nextCase && (
              <Button 
                size="sm"
                variant="ai"
                onClick={() => navigate(`/doctor/case/${nextCase.id}`)}
                className="text-xs py-1.5 px-3"
              >
                Review Next Case
              </Button>
            )}
          </div>
        </FloatingCard>

      </div>

      {/* 2. Clinical Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard 
          title="Total Queue"
          count={totalCasesCount}
          icon={<Users size={18} />}
          colorClass="bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200"
          subtitle="patients"
          trend="All incoming triages"
          trendPositive={true}
        />
        <StatCard 
          title="Emergency Alerts"
          count={emergencyCount}
          icon={<AlertTriangle size={18} />}
          colorClass="bg-red-50 text-red-600 border border-red-200"
          subtitle="critical"
          trend={emergencyCount > 0 ? "Immediate review required" : "No critical cases"}
          trendPositive={emergencyCount === 0}
        />
        <StatCard 
          title="Video Consults"
          count={videoConsultCount}
          icon={<Video size={18} />}
          colorClass="bg-blue-50 text-blue-600 border border-blue-200"
          subtitle="pending"
          trend="Scheduled tele-visits"
          trendPositive={true}
        />
        <StatCard 
          title="PHC Referrals"
          count={phcReferralCount}
          icon={<Calendar size={18} />}
          colorClass="bg-amber-50 text-amber-600 border border-amber-200"
          subtitle="in-person"
          trend="Facility verification"
          trendPositive={true}
        />
      </div>

      {/* 3. Main Clinical Layout: Patient Case Queue + Next Patient Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6 items-start">
        
        {/* Left Column: Triage Case Queue */}
        <FloatingCard className="p-0 overflow-hidden">
          
          {/* Header & Filter Tabs */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Patient Queue</h2>
                <button 
                  onClick={fetchCases}
                  disabled={loadingCases}
                  title="Refresh cases from backend"
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className={loadingCases ? "animate-spin text-[var(--color-primary)]" : ""} />
                </button>
              </div>
              <p className="text-xs text-slate-500">Live assessments submitted by ASHA workers and registered community patients</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalCasesCount})
              </button>
              <button
                onClick={() => setFilter('EMERGENCY')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'EMERGENCY' ? 'bg-white text-red-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Emergency ({emergencyCount})
              </button>
              <button
                onClick={() => setFilter('VIDEO_CONSULT')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'VIDEO_CONSULT' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Video ({videoConsultCount})
              </button>
              <button
                onClick={() => setFilter('VISIT_PHC')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'VISIT_PHC' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PHC ({phcReferralCount})
              </button>
            </div>
          </div>

          {casesError && (
            <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center justify-between">
              <span>{casesError}</span>
              <button onClick={fetchCases} className="font-semibold underline cursor-pointer ml-2">Retry</button>
            </div>
          )}

          {/* Patient Queue List */}
          <div className="divide-y divide-slate-100">
            {loadingCases ? (
              <div className="p-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-[var(--color-primary)]" />
                <span>Loading live clinical queue from persistent storage...</span>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No cases matching current filter.
              </div>
            ) : (
              filteredCases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => navigate(`/doctor/case/${c.id}`)}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-[var(--color-primary-dark)] transition-colors">
                        {c.patientName}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-500">{c.patientAge} yrs</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-500">{c.village}</span>
                      {renderUrgencyBadge(c.triageLevel)}
                      {c.status === 'REVIEWED' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Reviewed
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {c.symptoms.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                          {s}
                        </span>
                      ))}
                      {c.severity && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[11px] font-semibold">
                          {c.severity}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      Referred by: <span className="font-medium text-slate-700">{c.submittedByName}</span> ({c.submittedByRole === 'ASHA' ? 'ASHA Field Worker' : 'Patient Self-Entry'})
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={13} className="text-slate-400" />
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/doctor/case/${c.id}`);
                      }}
                      className="text-xs group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary-dark)] transition-colors"
                    >
                      <span>Review Case</span>
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredCases.length} of {totalCasesCount} cases</span>
            <button 
              onClick={() => navigate('/doctor/patients')}
              className="text-[var(--color-primary-dark)] font-semibold hover:underline cursor-pointer"
            >
              View Full Patient Registry →
            </button>
          </div>

        </FloatingCard>

        {/* Right Column: Next Priority Patient Vitals & Clinical Context */}
        <div className="flex flex-col gap-4">
          
          {/* Priority Case Review Widget */}
          <FloatingCard className="p-5 border-slate-200">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                  Immediate Priority
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {nextCase ? nextCase.patientName : "No waiting cases"}
                </h3>
              </div>
              {nextCase && renderUrgencyBadge(nextCase.triageLevel)}
            </div>

            {nextCase && (
              <div className="space-y-3.5">
                <div className="text-xs text-slate-600">
                  <span className="text-slate-400">Chief Symptoms: </span>
                  <span className="font-semibold text-slate-800">{nextCase.symptoms.join(', ')}</span>
                </div>

                {/* Vitals Telemetry Box */}
                <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Vitals Telemetry
                    </span>
                    {nextCase.vitals ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {nextCase.vitals.source === 'asha_field' ? 'ASHA Field Check' : 'Clinical Record'}
                      </span>
                    ) : isMock ? (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Simulated Baseline
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        No Vitals Logged
                      </span>
                    )}
                  </div>

                  {vitalsLoading ? (
                    <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-[var(--color-primary)]" />
                      <span>Reading patient telemetry...</span>
                    </div>
                  ) : vitalsError && !nextCase.vitals ? (
                    <div className="py-2 text-xs text-slate-500">
                      No vitals recorded during triage submission.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-white p-2.5 rounded-md border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Heart size={14} className="text-red-500" />
                          <span>Heart Rate</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {nextCase.vitals?.heartRate || vitals?.heartRate || '--'} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Wind size={14} className="text-blue-500" />
                          <span>SpO₂</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {nextCase.vitals?.spo2 || vitals?.spo2 ? `${nextCase.vitals?.spo2 || vitals?.spo2}%` : '--'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  fullWidth
                  variant="primary"
                  onClick={() => navigate(`/doctor/case/${nextCase.id}`)}
                  className="mt-1"
                >
                  <span>Open Patient Chart</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </FloatingCard>

          {/* Today's Clinical Schedule */}
          <FloatingCard className="p-5 border-slate-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Primary Care Tele-Triage
              </h3>
              <span className="text-xs text-slate-400">Rampur PHC</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Doctor reviews provide electronic guidance to ASHA community workers and prioritize emergency transportation to Sub-District and District Hospitals.
            </p>

            <Button 
              fullWidth
              variant="outline"
              size="sm"
              onClick={() => navigate('/doctor/consultations')}
              className="text-xs"
            >
              Consultation Archive
            </Button>
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
