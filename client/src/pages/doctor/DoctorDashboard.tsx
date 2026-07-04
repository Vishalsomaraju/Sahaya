import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertCircle, Clock, ChevronRight, Stethoscope } from 'lucide-react';
import { mockDoctor, mockIncomingCases } from '../../data/mockData';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { motion } from 'framer-motion';
import doctorIllustration from '../../assets/illustrations/doctor.svg';

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-extrabold rounded-full shadow-inner border border-red-100 uppercase tracking-wider">Emergency</span>;
      case 'VISIT_PHC': return <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-extrabold rounded-full shadow-inner border border-amber-100 uppercase tracking-wider">Visit PHC</span>;
      case 'VIDEO_CONSULT': return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full shadow-inner border border-blue-100 uppercase tracking-wider">Video Consult</span>;
      default: return null;
    }
  };

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

  // Determine next case for the CTA
  const nextCase = mockIncomingCases[0];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12 px-4 sm:px-0">
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-10">
        
        {/* Massive Editorial Hero Section (40% width illustration) */}
        <motion.div variants={itemVariants} className="relative w-full rounded-[36px] overflow-hidden bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] p-8 sm:p-12 shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-white/80">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Storytelling Text & CTA */}
            <div className="relative z-10 w-full md:w-[55%] flex flex-col gap-6">
              <div>
                <p className="text-[#4f46e5] font-bold text-sm tracking-[0.2em] uppercase mb-2">
                  {mockDoctor.role}
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#312e81] leading-[1.1] tracking-tight mb-4">
                  Good Morning,<br />{mockDoctor.name.replace('Dr. ', 'Dr ')}
                </h1>
                <p className="text-lg text-indigo-900/70 font-medium">
                  You have <strong className="text-red-500 font-extrabold">2 Critical</strong>, 5 Waiting, and 1 Consultation starting in 10 minutes.
                </p>
              </div>

              <FloatingCard 
                hoverable
                onClick={() => navigate(`/doctor/case/${nextCase?.id}`)}
                className="mt-2 bg-white/90 backdrop-blur-xl border border-white p-5 cursor-pointer group flex flex-col gap-4 shadow-xl shadow-indigo-900/5 rounded-[28px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/30">
                    <ClipboardList size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#312e81]">Next: {nextCase?.patient}</h2>
                    <p className="text-indigo-600 text-sm font-semibold">Wait time: 5 mins • {nextCase?.urgency}</p>
                  </div>
                </div>
                <Button fullWidth className="bg-[#4f46e5] hover:bg-[#4338ca] text-white flex items-center justify-between px-6 py-4 rounded-2xl text-lg group-hover:shadow-md transition-all font-bold">
                  <span>Review Patient</span>
                  <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </FloatingCard>
            </div>

            {/* Modular Illustration (40-45% width) */}
            <div className="relative z-10 w-full md:w-[45%] hidden sm:flex items-center justify-center">
              <motion.img 
                animate={{ y: [-5, 5, -5] }} 
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                src={doctorIllustration} 
                alt="Doctor working" 
                className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </motion.div>

        {/* Floating Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-2">
          <FloatingCard className="p-8 flex flex-col justify-between h-44 bg-white shadow-sm border border-gray-100 rounded-[32px] group">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4 shadow-inner shadow-indigo-100">
              <Stethoscope size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Today's Cases</p>
              <span className="text-4xl font-extrabold text-gray-800">8</span>
            </div>
          </FloatingCard>

          <FloatingCard className="p-8 flex flex-col justify-between h-44 bg-white shadow-sm border border-gray-100 rounded-[32px] group relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 shadow-inner shadow-red-100 z-10 relative">
              <AlertCircle size={24} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Critical Queue</p>
              <span className="text-4xl font-extrabold text-red-600">2</span>
            </div>
            
            {/* Soft decorative background pulse */}
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-50 rounded-full pointer-events-none"
            />
          </FloatingCard>

          <FloatingCard className="p-8 flex flex-col justify-between h-44 bg-white shadow-sm border border-gray-100 rounded-[32px] group col-span-2 md:col-span-1 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4 shadow-inner shadow-amber-100 z-10 relative">
              <Clock size={24} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Waiting</p>
              <span className="text-4xl font-extrabold text-gray-800">5</span>
            </div>
          </FloatingCard>
        </motion.div>

        {/* Case Queue */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-2xl font-extrabold text-[#312e81]">Patient Queue</h2>
            <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {mockIncomingCases.map(c => (
              <FloatingCard 
                key={c.id} 
                hoverable
                className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-transparent hover:border-indigo-100 cursor-pointer group rounded-[32px] bg-white shadow-sm"
                onClick={() => navigate(`/doctor/case/${c.id}`)}
              >
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h3 className="font-extrabold text-gray-800 text-2xl group-hover:text-indigo-600 transition-colors">{c.patient}</h3>
                    <span className="text-base font-bold text-gray-400">• {c.age} yrs</span>
                    {getUrgencyBadge(c.urgency)}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.symptoms.map(s => (
                      <span key={s} className="px-4 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm font-bold border border-gray-100">
                        {s}
                      </span>
                    ))}
                  </div>

                  <p className="text-base font-medium text-gray-400">
                    Referred by: <strong className="text-gray-700">{c.asha}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-sm bg-gray-50 px-4 py-2 rounded-full">
                    <Clock size={16} />
                    <span>{c.time}</span>
                  </div>
                  <Button className="px-8 py-3 shadow-lg rounded-2xl md:w-full bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 font-bold">
                    Open Case
                  </Button>
                </div>

              </FloatingCard>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
