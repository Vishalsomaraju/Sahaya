import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ChevronRight, 
  Search, 
  Plus, 
  X, 
  Clock,
  Filter,
  CheckCircle2
} from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { getAshaAssessments } from '../../lib/api';

interface AssessmentRecord {
  id: string;
  patient: string;
  age: number;
  village: string;
  date: string;
  result: string;
  urgency: 'EMERGENCY' | 'VISIT_PHC' | 'VIDEO_CONSULT' | 'SELF_CARE';
  symptoms: string[];
  referralStatus: string;
  vitalsSummary?: string;
}

const communityAssessments: AssessmentRecord[] = [
  {
    id: 'rec-001',
    patient: 'Meena Devi',
    age: 45,
    village: 'Rampur',
    date: 'Today, 09:15 AM',
    result: 'Visit PHC Within 24 Hours',
    urgency: 'VISIT_PHC',
    symptoms: ['Chest Pain', 'Shortness of Breath'],
    referralStatus: 'Referred to PHC Rampur • Dr. Priya Sharma',
    vitalsSummary: 'HR 88 bpm • SpO₂ 94% • BP 130/85'
  },
  {
    id: 'rec-002',
    patient: 'Arjun Kumar',
    age: 28,
    village: 'Lucknow',
    date: 'Today, 10:30 AM',
    result: 'Video Consultation Recommended',
    urgency: 'VIDEO_CONSULT',
    symptoms: ['Fever', 'Cough'],
    referralStatus: 'Tele-consult queued • Awaiting Doctor',
    vitalsSummary: 'HR 82 bpm • SpO₂ 98% • Temp 100.4°F'
  },
  {
    id: 'rec-003',
    patient: 'Suresh Singh',
    age: 62,
    village: 'Sultanpur',
    date: 'Yesterday, 04:20 PM',
    result: 'Self-Care & Home Monitoring',
    urgency: 'SELF_CARE',
    symptoms: ['Headache', 'Mild Fatigue'],
    referralStatus: 'Follow-up visit scheduled in 3 days',
    vitalsSummary: 'HR 74 bpm • SpO₂ 97% • BP 124/80'
  },
  {
    id: 'rec-004',
    patient: 'Ramesh Bhai',
    age: 50,
    village: 'Bilaspur',
    date: 'Yesterday, 11:05 AM',
    result: 'Immediate Emergency Transport',
    urgency: 'EMERGENCY',
    symptoms: ['Severe Chest Pain', 'Difficulty Breathing'],
    referralStatus: '108 Ambulance Dispatched to CHC Sultanpur',
    vitalsSummary: 'HR 112 bpm • SpO₂ 89% • BP 155/95'
  }
];

export default function AshaAssessments() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<AssessmentRecord | null>(null);
  const [assessmentsList, setAssessmentsList] = useState<AssessmentRecord[]>(communityAssessments);

  useEffect(() => {
    getAshaAssessments()
      .then((records) => {
        if (records && records.length > 0) {
          const mapped: AssessmentRecord[] = records.map((r) => {
            const dateStr = new Date(r.createdAt).toLocaleDateString([], {
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
            const vitals = r.vitals;
            const vitalsSummary = vitals
              ? [
                  vitals.heartRate ? `HR ${vitals.heartRate} bpm` : null,
                  vitals.spo2 ? `SpO₂ ${vitals.spo2}%` : null,
                  vitals.temperature ? `Temp ${vitals.temperature}°` : null,
                  vitals.bloodPressure ? `BP ${vitals.bloodPressure}` : null
                ].filter(Boolean).join(' • ')
              : 'No vitals recorded';

            return {
              id: r.id,
              patient: patientName,
              age,
              village,
              date: dateStr,
              result: r.aiRecommendation || 'Clinical Assessment Completed',
              urgency: (r.triageLevel as any) || 'SELF_CARE',
              symptoms: r.symptoms || [],
              referralStatus: r.triageLevel === 'EMERGENCY'
                ? '108 Ambulance Dispatch Recommended'
                : r.triageLevel === 'VISIT_PHC'
                ? 'Referred to PHC Rampur'
                : r.triageLevel === 'VIDEO_CONSULT'
                ? 'Tele-consultation Recommended'
                : 'Home Care & Symptom Monitoring',
              vitalsSummary
            };
          });
          setAssessmentsList(mapped);
        }
      })
      .catch((err) => {
        console.warn('[AshaAssessments] Failed to fetch real assessments, showing cached:', err);
      });
  }, []);

  const filteredAssessments = assessmentsList.filter(item => {
    const matchesSearch = 
      item.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesUrgency = 
      urgencyFilter === 'ALL' || 
      (urgencyFilter === 'CRITICAL' && (item.urgency === 'EMERGENCY' || item.urgency === 'VISIT_PHC')) ||
      item.urgency === urgencyFilter;

    return matchesSearch && matchesUrgency;
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
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Assessment History
            </h1>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Field Log
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Audit trail of community health screenings and clinical referral outcomes
          </p>
        </div>

        <Button 
          variant="primary"
          size="sm"
          onClick={() => navigate('/asha/assessment')}
          className="self-start sm:self-auto gap-2 text-xs font-semibold h-9 px-3.5"
        >
          <Plus size={16} />
          <span>New Assessment</span>
        </Button>
      </div>

      {/* 2. Search & Filter Bar */}
      <FloatingCard className="p-3 sm:p-4 border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search assessments by patient name, village, or symptom..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <Filter size={14} className="text-slate-400" />
              <span>Triage Level:</span>
            </div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
            >
              <option value="ALL">All Outcomes ({communityAssessments.length})</option>
              <option value="CRITICAL">High Risk / Emergency</option>
              <option value="VIDEO_CONSULT">Tele-Consult</option>
              <option value="SELF_CARE">Self Care</option>
            </select>
          </div>

        </div>
      </FloatingCard>

      {/* 3. Assessments Table / List */}
      <FloatingCard className="p-0 overflow-hidden border-slate-200">
        
        {/* Table Header (Desktop) */}
        <div className="hidden md:grid grid-cols-[1.5fr_1.2fr_1.5fr_1.2fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Patient Identity</span>
          <span>Triage Outcome</span>
          <span>Clinical Referral Status</span>
          <span>Date & Timestamp</span>
          <span className="text-right">Action</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filteredAssessments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <FileText size={28} className="mx-auto text-slate-300 mb-2" />
              <p>No assessment records match &quot;{searchQuery}&quot;.</p>
              <button 
                onClick={() => { setSearchQuery(''); setUrgencyFilter('ALL'); }}
                className="mt-2 text-xs font-semibold text-[var(--color-primary-dark)] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredAssessments.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedRecord(item)}
                className="p-4 sm:px-6 sm:py-4 hover:bg-slate-50/80 transition-colors flex flex-col md:grid md:grid-cols-[1.5fr_1.2fr_1.5fr_1.2fr_auto] gap-3 md:gap-4 md:items-center cursor-pointer group"
              >
                {/* Patient Identity */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-sm shrink-0">
                    {item.patient.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[var(--color-primary-dark)] transition-colors truncate">
                      {item.patient}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {item.age} yrs • {item.village}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.symptoms.map(s => (
                        <span key={s} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Outcome */}
                <div className="flex flex-col gap-1 items-start">
                  {renderUrgencyBadge(item.urgency)}
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {item.result}
                  </span>
                </div>

                {/* Referral Status */}
                <div className="text-xs text-slate-600">
                  <div className="font-medium text-slate-700 line-clamp-2">
                    {item.referralStatus}
                  </div>
                  {item.vitalsSummary && (
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                      {item.vitalsSummary}
                    </span>
                  )}
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span>{item.date}</span>
                </div>

                {/* Action */}
                <div className="flex items-center justify-end">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRecord(item);
                    }}
                    className="text-xs gap-1 group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary-dark)]"
                  >
                    <span>View Record</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredAssessments.length} of {communityAssessments.length} field records</span>
          <span className="text-[11px] text-slate-400">Authenticated ASHA Worker Registry</span>
        </div>

      </FloatingCard>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-sm">
                  {selectedRecord.patient.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedRecord.patient}</h3>
                  <p className="text-xs text-slate-500">{selectedRecord.age} yrs • {selectedRecord.village}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-600">Assigned Triage Level:</span>
                {renderUrgencyBadge(selectedRecord.urgency)}
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Primary Recommendation
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedRecord.result}
                </p>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Reported Symptoms
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.symptoms.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {selectedRecord.vitalsSummary && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Recorded Baseline Vitals
                  </span>
                  <p className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                    {selectedRecord.vitalsSummary}
                  </p>
                </div>
              )}

              <div>
                <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Referral Status & Routing
                </span>
                <p className="text-slate-700 bg-teal-50/50 p-2.5 rounded border border-teal-100 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[var(--color-primary)] shrink-0" />
                  <span>{selectedRecord.referralStatus}</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-2">
                <span>Record ID: {selectedRecord.id}</span>
                <span>Timestamp: {selectedRecord.date}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedRecord(null);
                  navigate('/asha/assessment');
                }}
              >
                Re-assess Patient
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
