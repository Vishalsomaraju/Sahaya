import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Activity, 
  UserPlus, 
  Filter, 
  X, 
  Clock, 
  RefreshCw
} from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { getCommunityPatients, registerCommunityPatient, type CommunityPatientRecord } from '../../lib/api';

interface PatientItem extends CommunityPatientRecord {
  lastVisit?: string;
  statusBadge?: string;
}

export default function AshaPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', village: 'Rampur', phone: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const fetchPatients = () => {
    setLoading(true);
    getCommunityPatients()
      .then((records) => {
        if (records) {
          const mapped = records.map((p, idx) => ({
            ...p,
            lastVisit: idx === 0 ? 'Today, 10:30 AM' : idx === 1 ? 'Today, 09:15 AM' : 'Oct 10, 2026',
            statusBadge: idx === 1 ? 'High Risk' : 'Routine'
          }));
          setPatients(mapped);
        }
      })
      .catch((err) => {
        console.warn('[AshaPatients] Failed to fetch patients from API:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const villages = Array.from(new Set(patients.map(p => p.village)));

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery));
    
    const matchesVillage = villageFilter === 'ALL' || p.village === villageFilter;

    return matchesSearch && matchesVillage;
  });

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name.trim() || !newPatient.age) return;

    setIsRegistering(true);
    setRegisterError(null);

    try {
      const registered = await registerCommunityPatient({
        name: newPatient.name.trim(),
        age: parseInt(newPatient.age, 10),
        village: newPatient.village.trim() || 'Rampur',
        phone: newPatient.phone.trim() || undefined
      });

      const added: PatientItem = {
        ...registered,
        lastVisit: 'Just now (New)',
        statusBadge: 'New Registry'
      };

      setPatients([added, ...patients]);
      setShowAddModal(false);
      setNewPatient({ name: '', age: '', village: 'Rampur', phone: '' });
    } catch (err: any) {
      setRegisterError(err.message || 'Failed to register patient into database.');
    } finally {
      setIsRegistering(false);
    }
  };

  const startAssessment = (patientId: string) => {
    navigate('/asha/assessment', { state: { patientId } });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* 1. Header & Register CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Community Patient Directory
            </h1>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Village Registry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Registered village households, demographics, and screening schedules
          </p>
        </div>

        <Button 
          variant="primary"
          size="sm"
          onClick={() => {
            setRegisterError(null);
            setShowAddModal(true);
          }}
          className="self-start sm:self-auto gap-2 text-xs font-semibold h-9 px-3.5"
        >
          <UserPlus size={16} />
          <span>Register Patient</span>
        </Button>
      </div>

      {/* 2. Search & Village Filter Bar */}
      <FloatingCard className="p-3 sm:p-4 border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by patient name, village, or ID..." 
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

      {/* 3. Patients Table / Grid */}
      <FloatingCard className="p-0 overflow-hidden border-slate-200">
        
        {/* Table Head */}
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Patient</span>
          <span>Age & Status</span>
          <span>Village Sector</span>
          <span>Last Screening</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw size={18} className="animate-spin text-[var(--color-primary)]" />
              <span>Loading registered community patients from database...</span>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No patients found matching "{searchQuery}".
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div 
                key={patient.id}
                className="p-4 sm:px-6 sm:py-4.5 hover:bg-slate-50/80 transition-colors flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 md:items-center"
              >
                {/* Name & ID */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-sm shrink-0">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {patient.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {patient.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Age & Status */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-700 font-medium">{patient.age} yrs</span>
                  <span className="text-slate-300">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    patient.statusBadge === 'High Risk'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {patient.statusBadge || 'Routine'}
                  </span>
                </div>

                {/* Village */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{patient.village}</span>
                </div>

                {/* Last Visit */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={13} className="text-slate-400" />
                  <span>{patient.lastVisit || 'Oct 10, 2026'}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    size="sm"
                    variant="primary"
                    onClick={() => startAssessment(patient.id)}
                    className="text-xs gap-1.5 h-8 px-3"
                  >
                    <Activity size={13} />
                    <span>Assess</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredPatients.length} of {patients.length} community patients</span>
          <span className="text-[11px] text-slate-400">Synced with Primary Health Centre</span>
        </div>

      </FloatingCard>

      {/* 4. Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Register Community Patient</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {registerError && (
              <div className="mb-3 p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                {registerError}
              </div>
            )}

            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Radhika Devi"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Age *
                  </label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max="110"
                    placeholder="e.g. 38"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
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
                    value={newPatient.village}
                    onChange={(e) => setNewPatient({ ...newPatient, village: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Phone Number (Optional)
                </label>
                <input 
                  type="tel" 
                  placeholder="10-digit mobile number"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <span>Add to Registry</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
