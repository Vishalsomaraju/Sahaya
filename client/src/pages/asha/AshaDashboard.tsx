import { useNavigate } from 'react-router-dom';
import { Plus, Users, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { mockPatients, mockAshaWorker } from '../../data/mockData';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { motion } from 'framer-motion';
import ashaIllustration from '../../assets/illustrations/asha.svg';

export default function AshaDashboard() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12 px-4 sm:px-0">
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-10">
        
        {/* Massive Editorial Hero Section (40% width illustration) */}
        <motion.div variants={itemVariants} className="relative w-full rounded-[36px] overflow-hidden bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] p-8 sm:p-12 shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-white/80">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Storytelling Text & CTA */}
            <div className="relative z-10 w-full md:w-[55%] flex flex-col gap-6">
              <div>
                <p className="text-[#ea580c] font-bold text-sm tracking-[0.2em] uppercase mb-2">
                  {mockAshaWorker.village} Sector
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#7c2d12] leading-[1.1] tracking-tight">
                  Good Morning,<br />{mockAshaWorker.name.split(' ')[0]}
                </h1>
              </div>

              <FloatingCard 
                hoverable
                onClick={() => navigate('/asha/assessment')}
                className="mt-4 bg-white/90 backdrop-blur-xl border border-white p-5 cursor-pointer group flex flex-col gap-4 shadow-xl shadow-orange-900/5 rounded-[28px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/30">
                    <Plus size={28} strokeWidth={3} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#7c2d12]">New Assessment</h2>
                    <p className="text-orange-600 text-sm font-semibold">Triage a patient in your village</p>
                  </div>
                </div>
                <Button fullWidth className="bg-[#ea580c] hover:bg-[#c2410c] text-white flex items-center justify-between px-6 py-4 rounded-2xl text-lg group-hover:shadow-md transition-all font-bold">
                  <span>Start Now</span>
                  <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </FloatingCard>
            </div>

            {/* Modular Illustration (40-45% width) */}
            <div className="relative z-10 w-full md:w-[45%] hidden sm:flex items-center justify-center">
              <motion.img 
                animate={{ y: [-5, 5, -5] }} 
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                src={ashaIllustration} 
                alt="ASHA Worker" 
                className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </motion.div>

        {/* Floating Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-2">
          <FloatingCard className="p-8 flex flex-col justify-between h-44 bg-white shadow-sm border border-gray-100 rounded-[32px] group">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4 shadow-inner shadow-blue-100">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Total Patients</p>
              <span className="text-4xl font-extrabold text-gray-800">124</span>
            </div>
          </FloatingCard>

          <FloatingCard className="p-8 flex flex-col justify-between h-44 bg-white shadow-sm border border-gray-100 rounded-[32px] group relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4 shadow-inner shadow-amber-100 relative z-10">
              <Clock size={24} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full"></div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Pending Visits</p>
              <span className="text-4xl font-extrabold text-gray-800">8</span>
            </div>
            
            {/* Soft decorative background pulse */}
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-100 rounded-full"
            />
          </FloatingCard>

          <FloatingCard className="p-8 flex flex-col justify-between h-44 bg-white shadow-sm border border-gray-100 rounded-[32px] group col-span-2 md:col-span-1 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 shadow-inner shadow-rose-100 z-10 relative">
              <AlertTriangle size={24} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">High Risk Alerts</p>
              <span className="text-4xl font-extrabold text-rose-600">2</span>
            </div>
          </FloatingCard>
        </motion.div>

        {/* Patient List */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-2xl font-extrabold text-[#7c2d12]">Recent Patients</h3>
            <button className="text-orange-600 font-bold text-sm hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {mockPatients.map(patient => (
              <FloatingCard 
                key={patient.id} 
                hoverable
                className="p-6 flex items-center justify-between cursor-pointer group border border-transparent hover:border-orange-100 rounded-[28px] bg-white shadow-sm"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center font-extrabold text-xl text-orange-600 border border-orange-100 group-hover:bg-orange-100 transition-colors shadow-inner shadow-orange-100/50">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-800 text-xl mb-1">{patient.name}</h3>
                    <p className="text-sm font-medium text-gray-400">{patient.age} yrs • {patient.village}</p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all text-gray-400 group-hover:text-orange-500">
                  <ChevronRight size={24} />
                </div>
              </FloatingCard>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
