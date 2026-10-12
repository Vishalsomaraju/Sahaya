import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Activity, 
  CheckCircle2, 
  ArrowUpRight,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import { mockAshaWorker, mockPatients } from '../../data/mockData';
import FloatingCard from '../../components/shared/FloatingCard';
import StatCard from '../../components/shared/StatCard';
import Button from '../../components/shared/Button';
import { getAshaAssessments } from '../../lib/api';

// Field assessments recorded by this ASHA worker
const recentFieldAssessments = [
  {
    id: 'as-1',
    patient: 'Meena Devi',
    age: 45,
    village: 'Rampur',
    symptoms: ['Chest Pain', 'Shortness of Breath'],
    urgency: 'VISIT_PHC',
    result: 'Visit PHC Within 24h',
    time: 'Today, 09:15 AM',
    status: 'Referred to PHC'
  },
  {
    id: 'as-2',
    patient: 'Arjun Kumar',
    age: 28,
    village: 'Lucknow',
    symptoms: ['Fever', 'Cough'],
    urgency: 'VIDEO_CONSULT',
    result: 'Tele-Consult Recommended',
    time: 'Today, 10:30 AM',
    status: 'Pending Tele-Visit'
  },
  {
    id: 'as-3',
    patient: 'Suresh Singh',
    age: 62,
    village: 'Sultanpur',
    symptoms: ['Headache', 'Mild Fatigue'],
    urgency: 'SELF_CARE',
    result: 'Home Rest & Hydration',
    time: 'Yesterday, 04:20 PM',
    status: 'Monitoring at Home'
  }
];

export default function AshaDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'REFERRED'>('ALL');
  const [fieldAssessments, setFieldAssessments] = useState(recentFieldAssessments);

  useEffect(() => {
    getAshaAssessments()
      .then((records) => {
        if (records && records.length > 0) {
          const mapped = records.map((r) => {
            const timeStr = new Date(r.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            const patientName = r.patient?.name || 'Community Patient';
            let age = 30;
            if (r.patient?.patientProfile?.dateOfBirth) {
              age = new Date().getFullYear() - new Date(r.patient.patientProfile.dateOfBirth).getFullYear();
            }
            const village = r.patient?.patientProfile?.villageSector || 'Rampur';
            const statusStr = r.triageLevel === 'EMERGENCY'
              ? '108 Dispatch Advised'
              : r.triageLevel === 'VISIT_PHC'
              ? 'Referred to PHC'
              : r.triageLevel === 'VIDEO_CONSULT'
              ? 'Tele-Visit Advised'
              : 'Home Monitoring';

            return {
              id: r.id,
              patient: patientName,
              age,
              village,
              symptoms: r.symptoms || [],
              urgency: r.triageLevel || 'SELF_CARE',
              result: r.aiRecommendation || 'Evaluation Complete',
              time: timeStr,
              status: statusStr
            };
          });
          setFieldAssessments(mapped);
        }
      })
      .catch((err) => {
        console.warn('[AshaDashboard] Failed to fetch live field assessments:', err);
      });
  }, []);

  const filteredAssessments = fieldAssessments.filter(item => {
    if (filter === 'CRITICAL') return item.urgency === 'EMERGENCY' || item.urgency === 'VISIT_PHC';
    if (filter === 'REFERRED') return item.status.includes('Referred');
    return true;
  });

  const renderUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
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
            Tele-Consult
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* 1. Header & Sector Info Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        
        {/* Welcome & Sector Context */}
        <FloatingCard className="p-5 md:p-6 bg-gradient-to-r from-teal-50/50 via-white to-slate-50 border-teal-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)] bg-teal-100/70 px-2.5 py-0.5 rounded-md">
                Field Health Desk • {mockAshaWorker.village} Sector
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock size={13} className="text-slate-400" />
                <span>Shift Active • Oct 11, 2026</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Welcome back, {mockAshaWorker.name}
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Community Health Worker • Primary Health Centre Rampur Cluster
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                <UserCheck size={14} className="text-[var(--color-primary)]" />
                Assigned: <strong className="text-slate-900 font-semibold ml-0.5">124 Households</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700 font-medium">
                Pending Follow-ups: <strong className="font-semibold">8</strong>
              </span>
            </div>

            <button 
              onClick={() => navigate('/asha/patients')}
              className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Directory</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </FloatingCard>

        {/* Quick Action: Start New Assessment Card */}
        <FloatingCard className="p-5 md:p-6 bg-white border-teal-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xs">
                <Stethoscope size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">New Field Assessment</h2>
                <p className="text-xs text-slate-500">Rapid triage & vitals screening</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200 px-2 py-0.5 rounded">
              Ready
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Select a community member, record active symptoms, sync wearable vitals, and obtain immediate algorithmic triage guidance.
          </p>

          <Button 
            variant="primary" 
            size="md"
            onClick={() => navigate('/asha/assessment')}
            className="w-full flex items-center justify-center gap-2 font-semibold text-sm h-11"
          >
            <Plus size={18} />
            <span>Start Patient Assessment</span>
          </Button>
        </FloatingCard>

      </div>

      {/* 2. Compact Clinical Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard 
          title="Assigned Patients"
          count={124}
          icon={<Users size={18} />}
          colorClass="bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200"
          subtitle="household registry"
          trend="Rampur & Bilaspur"
          trendPositive={true}
        />
        <StatCard 
          title="Pending Visits"
          count={8}
          icon={<Clock size={18} />}
          colorClass="bg-amber-50 text-amber-700 border border-amber-200"
          subtitle="routine checks"
          trend="3 scheduled today"
          trendPositive={false}
        />
        <StatCard 
          title="High-Risk Alerts"
          count={2}
          icon={<AlertTriangle size={18} />}
          colorClass="bg-red-50 text-red-600 border border-red-200"
          subtitle="require PHC care"
          trend="Meena Devi, Ramesh Bhai"
          trendPositive={false}
        />
        <StatCard 
          title="Completed Today"
          count={3}
          icon={<CheckCircle2 size={18} />}
          colorClass="bg-emerald-50 text-emerald-700 border border-emerald-200"
          subtitle="triages recorded"
          trend="Sync complete"
          trendPositive={true}
        />
      </div>

      {/* 3. Main Operational Layout: Recent Assessments + Quick Village Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6 items-start">
        
        {/* Left Column: Recent Community Triage Log */}
        <FloatingCard className="p-0 overflow-hidden border-slate-200">
          
          {/* Header & Filter Tabs */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Village Assessments</h2>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  Demo Pilot Data
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Triage outcomes and clinical referral status</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({fieldAssessments.length})
              </button>
              <button
                onClick={() => setFilter('CRITICAL')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'CRITICAL' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                High Risk
              </button>
              <button
                onClick={() => setFilter('REFERRED')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'REFERRED' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Referred
              </button>
            </div>
          </div>

          {/* Assessment List */}
          <div className="divide-y divide-slate-100">
            {filteredAssessments.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                No recent assessments match the selected filter.
              </div>
            ) : (
              filteredAssessments.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => navigate('/asha/assessments')}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-[var(--color-primary-dark)] transition-colors">
                        {item.patient}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-500">{item.age} yrs • {item.village}</span>
                      {renderUrgencyBadge(item.urgency)}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {item.symptoms.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Recommendation: <strong className="text-slate-700 font-semibold">{item.result}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">{item.status}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{item.time}</span>
                    </div>

                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/asha/assessments');
                      }}
                      className="text-xs group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary-dark)]"
                    >
                      <span>View Log</span>
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredAssessments.length} of {recentFieldAssessments.length} triage records</span>
            <button 
              onClick={() => navigate('/asha/assessments')}
              className="text-[var(--color-primary-dark)] font-semibold hover:underline cursor-pointer"
            >
              Full Assessment History →
            </button>
          </div>

        </FloatingCard>

        {/* Right Column: Village Priority List / Quick Launch */}
        <div className="flex flex-col gap-4">
          
          {/* Quick Assessment Launch per Patient */}
          <FloatingCard className="p-5 border-slate-200">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                  Community Registry
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Assigned Patients
                </h3>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/asha/patients')}
                className="text-xs px-2.5 py-1"
              >
                View All
              </Button>
            </div>

            <div className="space-y-2.5">
              {mockPatients.slice(0, 4).map(patient => (
                <div 
                  key={patient.id}
                  onClick={() => navigate('/asha/assessment', { state: { patientId: patient.id } })}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-[var(--color-primary-dark)] truncate">
                        {patient.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {patient.age} yrs • {patient.village}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-[var(--color-primary-dark)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                    <span>Triage</span>
                    <ChevronRight size={13} />
                  </span>
                </div>
              ))}
            </div>

            <Button 
              fullWidth
              variant="outline"
              size="sm"
              onClick={() => navigate('/asha/patients')}
              className="mt-3.5 text-xs font-semibold"
            >
              Open Community Directory
            </Button>
          </FloatingCard>

          {/* Clinical Shift Checklist */}
          <FloatingCard className="p-5 border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                ASHA Worker Protocol
              </h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Standard
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 leading-normal">
              <li className="flex items-start gap-2">
                <Activity size={14} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                <span>Record oxygen saturation and temperature for acute respiratory reports.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Refer chest pain and breathlessness to PHC or emergency transport immediately.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Share generated clinical summary with visiting medical officers.</span>
              </li>
            </ul>
          </FloatingCard>

        </div>

      </div>

    </div>
  );
}
