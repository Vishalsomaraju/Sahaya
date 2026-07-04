import { Calendar, FileText, Activity, ChevronRight } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import { motion } from 'framer-motion';
import Button from '../../components/shared/Button';
import { useNavigate } from 'react-router-dom';

const mockHistory = [
  {
    id: 1,
    date: 'Today, 10:30 AM',
    type: 'Assessment',
    result: 'Video Consult Recommended',
    symptoms: ['Fever', 'Cough'],
    color: 'bg-[var(--color-primary)]'
  },
  {
    id: 2,
    date: 'Oct 15, 2023',
    type: 'Consultation',
    doctor: 'Dr. Priya Sharma',
    notes: 'Prescribed antibiotics for 5 days. Rest recommended.',
    color: 'bg-indigo-500'
  },
  {
    id: 3,
    date: 'Sep 22, 2023',
    type: 'Assessment',
    result: 'Self Care',
    symptoms: ['Headache'],
    color: 'bg-[var(--color-success)]'
  }
];

export default function PatientHistory() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 pt-6 max-w-4xl mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Health History</h1>
          <p className="text-lg text-[var(--color-text-muted)] font-medium mt-2">Your past assessments and consultations</p>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[27px] top-8 bottom-8 w-1 bg-gray-100 rounded-full hidden md:block"></div>
        
        <div className="space-y-8 relative">
          {mockHistory.map((item, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item.id} 
              className="flex flex-col md:flex-row gap-6 md:gap-10"
            >
              {/* Timeline Node */}
              <div className="hidden md:flex flex-col items-center pt-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg ${item.color} z-10`}>
                  {item.type === 'Assessment' ? <FileText size={24} /> : <Activity size={24} />}
                </div>
              </div>

              {/* Content Card */}
              <FloatingCard className="flex-1 p-8 rounded-[32px] border-2 border-gray-100 hover:border-gray-200 transition-colors group cursor-pointer" onClick={() => {}}>
                <div className="flex items-center gap-3 mb-4 md:hidden">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ${item.color}`}>
                    {item.type === 'Assessment' ? <FileText size={18} /> : <Activity size={18} />}
                  </div>
                  <span className="font-bold text-[var(--color-text-primary)]">{item.type}</span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[var(--color-text-muted)] font-extrabold text-sm uppercase tracking-widest mb-3">
                      <Calendar size={16} />
                      {item.date}
                    </div>
                    
                    {item.type === 'Assessment' ? (
                      <>
                        <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-3">{item.result}</h3>
                        <div className="flex gap-2 flex-wrap">
                          {item.symptoms?.map(sym => (
                            <span key={sym} className="px-4 py-1.5 bg-gray-100 text-[var(--color-text-muted)] font-bold rounded-full text-sm">
                              {sym}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-2">{item.doctor}</h3>
                        <p className="text-lg text-[var(--color-text-muted)] font-medium leading-relaxed">{item.notes}</p>
                      </>
                    )}
                  </div>
                  
                  <div className="hidden md:flex w-12 h-12 rounded-full bg-gray-50 items-center justify-center text-gray-400 group-hover:bg-[var(--color-primary-light)] group-hover:text-[var(--color-primary)] transition-colors">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          ))}
        </div>
      </div>
      
      <Button 
        size="lg"
        onClick={() => navigate('/patient/assessment')}
        className="w-full md:w-auto self-center mt-8 h-16 px-10 text-xl font-bold rounded-2xl shadow-xl shadow-[var(--color-primary)]/20"
      >
        Start New Assessment
      </Button>
    </div>
  );
}
