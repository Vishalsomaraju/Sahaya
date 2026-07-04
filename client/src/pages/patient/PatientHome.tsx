import { useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowRight, Sparkles, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { mockCurrentPatient } from '../../data/mockData';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { motion } from 'framer-motion';
import patientIllustration from '../../assets/illustrations/patient.svg';

export default function PatientHome() {
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
        <motion.div variants={itemVariants} className="relative w-full rounded-[36px] overflow-hidden bg-gradient-to-br from-[#f0fdf4] to-[#ccfbf1] p-8 sm:p-12 shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-white/80">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Storytelling Text & CTA */}
            <div className="relative z-10 w-full md:w-[55%] flex flex-col gap-6">
              <div>
                <p className="text-[var(--color-primary)] font-bold text-sm tracking-[0.2em] uppercase mb-2">
                  Hello, {mockCurrentPatient.name.split(' ')[0]} 👋
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#064e3b] leading-[1.1] tracking-tight">
                  How are you<br />feeling today?
                </h1>
              </div>

              <FloatingCard 
                hoverable
                onClick={() => navigate('/patient/assessment')}
                className="mt-4 bg-white/90 backdrop-blur-xl border border-white p-5 cursor-pointer group flex flex-col gap-4 shadow-xl shadow-[#0F9D94]/10 rounded-[28px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[20px] bg-[var(--color-primary)] text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[var(--color-primary)]/30">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#064e3b]">Quick Assessment</h2>
                    <p className="text-[#0d9488] text-sm font-semibold">Estimated time: 2 min</p>
                  </div>
                </div>
                <Button fullWidth className="bg-[#0f766e] hover:bg-[#115e59] text-white flex items-center justify-between px-6 py-4 rounded-2xl text-lg group-hover:shadow-md transition-all font-bold">
                  <span>Start Assessment</span>
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </FloatingCard>
            </div>

            {/* Modular Illustration (40-45% width) */}
            <div className="relative z-10 w-full md:w-[45%] hidden sm:flex items-center justify-center">
              <motion.img 
                animate={{ y: [-5, 5, -5] }} 
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                src={patientIllustration} 
                alt="Patient sitting comfortably" 
                className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </motion.div>

        {/* Floating Health Metrics with Alive Animations */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          
          {/* Beating Heart Rate Card */}
          <FloatingCard className="p-8 flex flex-col justify-between h-48 bg-white shadow-sm border border-gray-100 rounded-[32px] group relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner shadow-rose-100"
              >
                <HeartPulse size={24} className="drop-shadow-sm" />
              </motion.div>
              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full uppercase tracking-wider">Normal</span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-400 mb-1 tracking-wide uppercase">Heart Rate</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold text-gray-800 tracking-tight">72</span>
                <span className="text-lg font-bold text-gray-400">bpm</span>
              </div>
            </div>
            
            {/* Animated EKG Line Background */}
            <div className="absolute bottom-4 right-0 left-20 opacity-20 text-rose-500 pointer-events-none">
              <svg viewBox="0 0 200 40" className="w-full h-16 preserve-3d">
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  d="M0 20 L40 20 L50 10 L60 30 L70 20 L200 20"
                  fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
          </FloatingCard>

          {/* Breathing SpO2 Card */}
          <FloatingCard className="p-8 flex flex-col justify-between h-48 bg-white shadow-sm border border-gray-100 rounded-[32px] group relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner shadow-blue-100">
                <Activity size={24} />
              </div>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-wider">Optimal</span>
            </div>
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-gray-400 mb-1 tracking-wide uppercase">Oxygen (SpO₂)</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-extrabold text-gray-800 tracking-tight">98</span>
                  <span className="text-lg font-bold text-gray-400">%</span>
                </div>
              </div>
              
              {/* Circular Progress Ring */}
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#eff6ff" strokeWidth="8" />
                  <motion.circle 
                    initial={{ strokeDasharray: "214", strokeDashoffset: "214" }}
                    animate={{ strokeDashoffset: "4.28" }} // 98% of 214
                    transition={{ duration: 2, ease: "easeOut" }}
                    cx="40" cy="40" r="34" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" 
                  />
                </svg>
                <motion.div 
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center text-blue-400"
                >
                  <Activity size={20} />
                </motion.div>
              </div>
            </div>
          </FloatingCard>
        </motion.div>

        {/* AI Timeline (Living Health Companion) */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6 mt-4">
          <h3 className="text-2xl font-extrabold text-[#064e3b] px-2">Health Companion</h3>
          
          <div className="flex flex-col gap-4 relative">
            {/* Timeline track */}
            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-100 hidden sm:block"></div>
            
            <FloatingCard hoverable className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 border border-transparent hover:border-gray-200 rounded-[28px] relative z-10 bg-white shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#f0fdf4] text-[#10b981] flex items-center justify-center shrink-0 shadow-inner shadow-green-100">
                <CheckCircle2 size={30} />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-xl text-gray-800 mb-1">Morning check-in complete</h4>
                <p className="text-base text-gray-500 font-medium">Heart rate normal, SpO₂ optimal. Vitals securely logged.</p>
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-full">
                <Clock size={16} />
                <span>Today</span>
              </div>
            </FloatingCard>

            <FloatingCard hoverable className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 border border-transparent hover:border-gray-200 rounded-[28px] relative z-10 bg-white shadow-sm">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 shadow-inner shadow-blue-100">
                <Sparkles size={30} />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-xl text-gray-800 mb-1">AI Health Review</h4>
                <p className="text-base text-gray-500 font-medium">Your reported symptoms indicate a slight improvement. Stay hydrated.</p>
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-full">
                <Clock size={16} />
                <span>Yesterday</span>
              </div>
            </FloatingCard>
            
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
