import { Calendar, Video, FileText, ChevronRight, Search } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import { motion } from 'framer-motion';
import { useState } from 'react';

const mockConsultations = [
  {
    id: 1,
    patient: 'Suresh Singh',
    date: 'Today, 09:15 AM',
    type: 'Video Consult',
    duration: '15 mins',
    notes: 'Prescribed Paracetamol 500mg. Advised rest for 2 days.'
  },
  {
    id: 2,
    patient: 'Meena Devi',
    date: 'Yesterday, 11:30 AM',
    type: 'PHC Referral',
    duration: '-',
    notes: 'Referred to PHC for chest X-Ray due to persistent cough.'
  },
  {
    id: 3,
    patient: 'Ramesh Bhai',
    date: 'Oct 12, 2023',
    type: 'Video Consult',
    duration: '10 mins',
    notes: 'Routine follow-up. Blood pressure stable at 120/80.'
  }
];

export default function DoctorConsultations() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 pt-6 max-w-5xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Consultation History</h1>
          <p className="text-lg text-[var(--color-text-muted)] font-medium mt-2">Log of your recent patient interactions</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={24} />
        </div>
        <input 
          type="text" 
          placeholder="Search consultations..." 
          className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] py-5 pl-16 pr-6 text-xl font-bold text-[var(--color-text-primary)] shadow-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-6">
        {mockConsultations
          .filter(c => c.patient.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={item.id}
          >
            <FloatingCard className="p-8 rounded-[32px] border-2 border-gray-100 hover:border-gray-200 transition-colors group cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <h3 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{item.patient}</h3>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wider uppercase border bg-indigo-50 text-indigo-600 border-indigo-100">
                    {item.type === 'Video Consult' ? <Video size={18} /> : <FileText size={18} />}
                    {item.type}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-lg font-medium text-[var(--color-text-muted)] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-gray-400" />
                    {item.date}
                  </div>
                  {item.duration !== '-' && (
                    <>
                      <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <div className="font-bold text-gray-500">Duration: {item.duration}</div>
                    </>
                  )}
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-[var(--color-text-primary)] font-medium text-lg leading-relaxed">
                  "{item.notes}"
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
