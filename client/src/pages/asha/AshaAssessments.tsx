import { Calendar, FileText, ChevronRight, Search, Activity } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import { motion } from 'framer-motion';
import Button from '../../components/shared/Button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const mockAssessments = [
  {
    id: 1,
    patient: 'Arjun Kumar',
    date: 'Today, 10:30 AM',
    result: 'Video Consult Recommended',
    urgency: 'VIDEO_CONSULT',
    symptoms: ['Fever', 'Cough']
  },
  {
    id: 2,
    patient: 'Meena Devi',
    date: 'Today, 09:15 AM',
    result: 'Visit PHC',
    urgency: 'VISIT_PHC',
    symptoms: ['Chest Pain', 'Shortness of Breath']
  },
  {
    id: 3,
    patient: 'Suresh Singh',
    date: 'Yesterday, 04:20 PM',
    result: 'Self Care',
    urgency: 'SELF_CARE',
    symptoms: ['Headache']
  }
];

export default function AshaAssessments() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'VISIT_PHC': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'VIDEO_CONSULT': return 'bg-teal-50 text-[var(--color-primary)] border-teal-100';
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === 'EMERGENCY' || urgency === 'VISIT_PHC') return <Activity size={18} />;
    return <FileText size={18} />;
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 pt-6 max-w-5xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Recent Assessments</h1>
          <p className="text-lg text-[var(--color-text-muted)] font-medium mt-2">Track the triage history of your patients</p>
        </div>
        <Button 
          onClick={() => navigate('/asha/assessment')}
          className="bg-gradient-to-r from-orange-400 to-orange-500 hover:opacity-90 text-white h-14 px-8 text-lg font-bold shadow-lg shadow-orange-500/20 border-none rounded-2xl"
        >
          New Assessment
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={24} />
        </div>
        <input 
          type="text" 
          placeholder="Search by patient name or symptom..." 
          className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] py-5 pl-16 pr-6 text-xl font-bold text-[var(--color-text-primary)] shadow-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-6">
        {mockAssessments
          .filter(a => a.patient.toLowerCase().includes(searchQuery.toLowerCase()) || a.symptoms.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))
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
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wider uppercase border ${getUrgencyStyles(item.urgency)}`}>
                    {getUrgencyIcon(item.urgency)}
                    {item.result}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-lg font-medium text-[var(--color-text-muted)]">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-gray-400" />
                    {item.date}
                  </div>
                  <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  <div className="flex flex-wrap gap-2">
                    {item.symptoms.map(sym => (
                      <span key={sym} className="text-gray-500 font-bold bg-gray-50 px-3 py-1 rounded-xl">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0">
                <ChevronRight size={28} />
              </div>

            </FloatingCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
