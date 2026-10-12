import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Stethoscope, ChevronRight, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { getPatientAssessments, type AssessmentRecord } from '../../lib/api';

interface HistoryItem {
  id: string;
  date: string;
  type: 'Assessment' | 'Consultation';
  result?: string;
  symptoms?: string[];
  doctor?: string;
  notes?: string;
  urgency?: 'VIDEO_CONSULT' | 'SELF_CARE' | 'VISIT_PHC' | 'EMERGENCY';
}

export default function PatientHistory() {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'ASSESSMENT' | 'CONSULTATION'>('ALL');

  useEffect(() => {
    setLoading(true);
    getPatientAssessments()
      .then((records: AssessmentRecord[]) => {
        if (records && records.length > 0) {
          const items: HistoryItem[] = records.map((r) => {
            const dateStr = new Date(r.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return {
              id: r.id,
              date: dateStr,
              type: 'Assessment',
              result: r.aiRecommendation || 'Clinical Assessment Completed',
              symptoms: r.symptoms || [],
              urgency: (r.triageLevel as any) || 'SELF_CARE'
            };
          });
          setHistoryItems(items);
        }
      })
      .catch((err) => {
        console.warn('[PatientHistory] Failed to load assessments from API:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredHistory = historyItems.filter(item => {
    if (filter === 'ASSESSMENT') return item.type === 'Assessment';
    if (filter === 'CONSULTATION') return item.type === 'Consultation';
    return true;
  });

  const getUrgencyBadge = (item: HistoryItem) => {
    if (item.type === 'Consultation') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 size={12} />
          Completed Consult
        </span>
      );
    }
    switch (item.urgency) {
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Emergency Alert
          </span>
        );
      case 'VIDEO_CONSULT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200">
            Video Recommended
          </span>
        );
      case 'SELF_CARE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Self Care
          </span>
        );
      case 'VISIT_PHC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            PHC Referral
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Health History</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Chronological archive of past symptom assessments and physician consultations
          </p>
        </div>

        <Button 
          size="sm"
          variant="primary"
          onClick={() => navigate('/patient/assessment')}
          className="text-xs font-semibold gap-1.5 shadow-clinical self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Assessment</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Records ({historyItems.length})
        </button>
        <button
          onClick={() => setFilter('ASSESSMENT')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            filter === 'ASSESSMENT' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Triage Assessments ({historyItems.filter(h => h.type === 'Assessment').length})
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-[var(--color-primary)]" />
            <span>Loading health history from persistent storage...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <FloatingCard className="p-12 text-center text-slate-500 text-sm">
            <p className="mb-3">No health assessment history recorded yet.</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/patient/assessment')}>
              Start First Assessment
            </Button>
          </FloatingCard>
        ) : (
          filteredHistory.map((item) => (
            <FloatingCard 
              key={item.id}
              className="p-5 border-slate-200/90 hover:border-slate-300 transition-colors cursor-pointer group"
              onClick={() => navigate('/patient/triage', { state: { assessmentId: item.id } })}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Left Side: Icon & Details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === 'Assessment' 
                      ? 'bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)]' 
                      : 'bg-blue-50 border border-blue-200 text-blue-700'
                  }`}>
                    {item.type === 'Assessment' ? <FileText size={18} /> : <Stethoscope size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="text-base font-bold text-slate-900 group-hover:text-[var(--color-primary-dark)] transition-colors">
                        {item.result}
                      </span>
                      {getUrgencyBadge(item)}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{item.date}</span>
                    </div>

                    {item.symptoms && item.symptoms.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-slate-500">Reported:</span>
                        {item.symptoms.map(sym => (
                          <span key={sym} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                            {sym}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Follow-up action */}
                <div className="flex items-center justify-end sm:justify-start pt-2 sm:pt-0 shrink-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/patient/triage', { state: { assessmentId: item.id } });
                    }}
                    className="text-xs font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Triage Plan</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>
            </FloatingCard>
          ))
        )}
      </div>

    </div>
  );
}
