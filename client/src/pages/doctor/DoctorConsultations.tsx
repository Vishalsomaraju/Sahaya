import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Video, FileText, ChevronRight, Search, Clock, X, RefreshCw } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { getDoctorConsultations, type DoctorConsultationRecord } from '../../lib/api';

export default function DoctorConsultations() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<DoctorConsultationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'VIDEO' | 'PHC'>('ALL');

  useEffect(() => {
    setLoading(true);
    getDoctorConsultations()
      .then((records) => {
        if (records) setConsultations(records);
      })
      .catch((err) => {
        console.warn('[DoctorConsultations] Failed to load consultations from backend:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredConsultations = consultations.filter(c => {
    const matchesSearch = 
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const isVideo = c.triageLevel === 'VIDEO_CONSULT' || (c.notes && c.notes.toLowerCase().includes('video'));
    const isPhc = c.triageLevel === 'VISIT_PHC' || (c.notes && c.notes.toLowerCase().includes('phc'));

    const matchesType = typeFilter === 'ALL' || 
                        (typeFilter === 'VIDEO' && isVideo) ||
                        (typeFilter === 'PHC' && isPhc);
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Consultation Archive</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Historical log of clinical tele-consultations, referrals, and physician notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/doctor')}
            className="text-xs"
          >
            Back to Active Queue
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <FloatingCard className="p-3 sm:p-4 border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by patient name, medication, or clinical notes..." 
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

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({consultations.length})
            </button>
            <button
              onClick={() => setTypeFilter('VIDEO')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                typeFilter === 'VIDEO' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Video Consults
            </button>
            <button
              onClick={() => setTypeFilter('PHC')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                typeFilter === 'PHC' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PHC Referrals
            </button>
          </div>

        </div>
      </FloatingCard>

      {/* Consultations List */}
      <div className="flex flex-col gap-3.5">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-[var(--color-primary)]" />
            <span>Loading consultations archive from database...</span>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <FloatingCard className="p-12 text-center text-slate-500 text-sm">
            No consultations matching current query. Complete a case review from the queue to record physician notes.
          </FloatingCard>
        ) : (
          filteredConsultations.map((item) => (
            <FloatingCard 
              key={item.id}
              className="p-5 border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group"
              onClick={() => navigate(`/doctor/case/${item.assessmentId}`)}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="text-base font-bold text-slate-900 group-hover:text-[var(--color-primary-dark)] transition-colors">
                      {item.patientName}
                    </span>
                    <span className="text-xs text-slate-400">• {item.village}</span>
                    
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      item.triageLevel === 'VIDEO_CONSULT' 
                        ? 'bg-teal-50 text-[var(--color-primary-dark)] border-teal-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {item.triageLevel === 'VIDEO_CONSULT' ? <Video size={13} /> : <FileText size={13} />}
                      <span>{item.triageLevel}</span>
                    </span>

                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.status}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      <span>Physician: {item.doctorName}</span>
                    </div>
                  </div>

                  {/* Physician Notes Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-700 leading-relaxed font-medium">
                    <span className="font-bold text-slate-900">Signed Clinical Order: </span>
                    {item.notes}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/doctor/case/${item.assessmentId}`);
                    }}
                    className="text-xs group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary-dark)]"
                  >
                    <span>View Case File</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>

              </div>
            </FloatingCard>
          ))
        )}
      </div>

    </div>
  );
}
