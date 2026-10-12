import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Activity, FileText, ChevronRight, UserPlus, Filter, X, RefreshCw } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { getDoctorPatients, type DoctorPatientRecord } from '../../lib/api';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<DoctorPatientRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState<string>('ALL');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDoctorPatients()
      .then((records) => {
        if (records) setPatients(records);
      })
      .catch((err) => {
        console.warn('[DoctorPatients] Failed to load patients from backend:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const villages = Array.from(new Set(patients.map(p => p.village)));

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.phone.includes(searchQuery);
    const matchesVillage = villageFilter === 'ALL' || p.village === villageFilter;
    return matchesSearch && matchesVillage;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Community Patient Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Registered village patients and electronic health summaries
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setInfoMessage('New community patient registration is initiated by ASHA field workers using the ASHA mobile kit.')}
            className="text-xs gap-1.5"
          >
            <UserPlus size={15} />
            <span>Field Registry Info</span>
          </Button>
        </div>
      </div>

      {infoMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800 flex items-center justify-between">
          <span>{infoMessage}</span>
          <button onClick={() => setInfoMessage(null)} className="font-bold text-teal-700 ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <FloatingCard className="p-3 sm:p-4 border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by patient name, ID, phone, or village..." 
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
              <span>Village:</span>
            </div>
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
            >
              <option value="ALL">All Villages ({patients.length})</option>
              {villages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

        </div>
      </FloatingCard>

      {/* Patient Directory Table / Card List */}
      <FloatingCard className="p-0 overflow-hidden border-slate-200">
        
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Patient Identity</span>
          <span>Age & Demographics</span>
          <span>Community / Village</span>
          <span>Latest Triage Entry</span>
          <span className="text-right">Action</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw size={18} className="animate-spin text-[var(--color-primary)]" />
              <span>Loading patient registry from database...</span>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No patients found matching "{searchQuery}".
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const latestId = patient.latestAssessment?.id;

              return (
                <div
                  key={patient.id}
                  onClick={() => latestId && navigate(`/doctor/case/${latestId}`)}
                  className={`p-4 sm:px-6 sm:py-4.5 hover:bg-slate-50/80 transition-colors flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 md:items-center group ${latestId ? 'cursor-pointer' : ''}`}
                >
                  {/* Name & ID */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-sm shrink-0">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[var(--color-primary-dark)] transition-colors">
                        {patient.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        Phone: {patient.phone}
                      </span>
                    </div>
                  </div>

                  {/* Age & Demographics */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Activity size={14} className="text-slate-400" />
                    <span>{patient.age} yrs • {patient.gender}</span>
                  </div>

                  {/* Village */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{patient.village} Sector</span>
                  </div>

                  {/* Latest Triage Entry */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <FileText size={14} className="text-[var(--color-primary)]" />
                    {patient.latestAssessment ? (
                      <span className="font-semibold text-slate-700">
                        {patient.latestAssessment.triageLevel} ({new Date(patient.latestAssessment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                      </span>
                    ) : (
                      <span className="text-slate-400">No triage history yet</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end">
                    {latestId ? (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/doctor/case/${latestId}`);
                        }}
                        className="text-xs gap-1 group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary-dark)]"
                      >
                        <span>View Chart</span>
                        <ChevronRight size={14} />
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No triage record</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredPatients.length} of {patients.length} patients in registry</span>
          <span className="text-[11px] text-slate-400">Encrypted Health Record Storage</span>
        </div>

      </FloatingCard>

    </div>
  );
}
