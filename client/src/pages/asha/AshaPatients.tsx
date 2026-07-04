import { Search, MapPin, Activity, UserPlus, Phone } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import { mockPatients } from '../../data/mockData';
import { motion } from 'framer-motion';
import Button from '../../components/shared/Button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function AshaPatients() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 pt-6 max-w-5xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">My Patients</h1>
          <p className="text-lg text-[var(--color-text-muted)] font-medium mt-2">Manage patients in your village</p>
        </div>
        <Button 
          className="bg-white border-2 border-orange-100 hover:border-orange-200 text-orange-600 h-14 px-8 text-lg font-bold shadow-sm rounded-2xl"
        >
          <UserPlus size={24} className="mr-3" />
          Add Patient
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={24} />
        </div>
        <input 
          type="text" 
          placeholder="Search by name or location..." 
          className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] py-5 pl-16 pr-6 text-xl font-bold text-[var(--color-text-primary)] shadow-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockPatients
          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.village.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((patient, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            key={patient.id}
          >
            <FloatingCard className="p-8 rounded-[32px] border-2 border-gray-100 flex flex-col justify-between h-full group hover:border-[var(--color-primary)] transition-colors">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight mb-2 group-hover:text-[var(--color-primary-dark)] transition-colors">{patient.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-extrabold uppercase tracking-widest text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1.5"><Activity size={16} /> {patient.age} YRS</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1.5"><MapPin size={16} /> {patient.village}</span>
                  </div>
                </div>
                <button className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-100 transition-colors shrink-0 shadow-sm">
                  <Phone size={20} />
                </button>
              </div>

              <Button 
                variant="outline"
                className="w-full h-14 rounded-2xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 font-bold text-lg"
                onClick={() => navigate('/asha/assessment')}
              >
                Start Triage
              </Button>
            </FloatingCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
