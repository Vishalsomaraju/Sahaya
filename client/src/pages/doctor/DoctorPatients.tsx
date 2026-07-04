import { Search, MapPin, Activity, FileText, ChevronRight } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import { mockPatients } from '../../data/mockData';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 pt-6 max-w-5xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Patient Directory</h1>
          <p className="text-lg text-[var(--color-text-muted)] font-medium mt-2">Manage your patients and their records</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={24} />
        </div>
        <input 
          type="text" 
          placeholder="Search patients by name or ID..." 
          className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] py-5 pl-16 pr-6 text-xl font-bold text-[var(--color-text-primary)] shadow-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-6">
        {mockPatients
          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((patient, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={patient.id}
          >
            <FloatingCard className="p-8 rounded-[32px] border-2 border-gray-100 hover:border-[var(--color-primary)] transition-colors group cursor-pointer flex justify-between items-center">
              
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/30">
                  {patient.name.charAt(0)}
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight mb-2 group-hover:text-[var(--color-primary-dark)] transition-colors">{patient.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-extrabold uppercase tracking-widest text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1.5"><Activity size={16} /> {patient.age} YRS</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1.5"><MapPin size={16} /> {patient.village}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1.5 text-[var(--color-primary)]"><FileText size={16} /> 3 Records</span>
                  </div>
                </div>
              </div>

              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                <ChevronRight size={28} />
              </div>

            </FloatingCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
