import { useParams, useNavigate } from 'react-router-dom';
import { mockIncomingCases, mockVitals } from '../../data/mockData';
import { ArrowLeft, Video, Sparkles, Activity, FileText, Heart, Thermometer, Wind, Droplets } from 'lucide-react';
import { useState } from 'react';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { motion } from 'framer-motion';

export default function DoctorCaseReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoStarted, setVideoStarted] = useState(false);
  
  const caseData = mockIncomingCases.find(c => c.id === id) || mockIncomingCases[0];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20';
      case 'VISIT_PHC': return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20';
      case 'VIDEO_CONSULT': return 'bg-gradient-to-r from-[var(--color-primary)] to-teal-400 text-white shadow-md shadow-[var(--color-primary)]/20';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  if (videoStarted) {
    return (
      <div className="flex flex-col h-[85vh] max-w-5xl mx-auto mt-6 items-center justify-center animate-fade-in bg-gray-900 rounded-[40px] overflow-hidden relative shadow-2xl border-4 border-gray-800">
        <div className="text-white text-center">
          <div className="w-32 h-32 rounded-full bg-gray-800/80 flex items-center justify-center mx-auto mb-8 shadow-inner shadow-black/50">
            <Video size={64} className="opacity-80 text-teal-400" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Connecting to {caseData.patient}...</h2>
          <p className="opacity-70 text-xl font-medium">Waiting for patient to join</p>
        </div>
        <Button 
          size="lg"
          onClick={() => setVideoStarted(false)}
          className="absolute bottom-12 bg-red-500 hover:bg-red-600 text-white h-16 px-10 text-xl font-bold shadow-lg shadow-red-500/30 border-none rounded-2xl"
        >
          End Call
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 pt-6 max-w-6xl mx-auto px-4 md:px-0">
      
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all font-bold">
          <ArrowLeft size={20} />
          Back to Queue
        </button>
      </div>

      {/* Patient Header */}
      <FloatingCard className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 border-l-8 border-l-[var(--color-primary)] rounded-[32px]">
        <div>
          <div className="flex items-center gap-5 mb-3 flex-wrap">
            <h1 className="text-5xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{caseData.patient}</h1>
            <span className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest ${getUrgencyColor(caseData.urgency)}`}>
              {caseData.urgency.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xl text-[var(--color-text-muted)] font-medium">
            {caseData.age} yrs • Referred by <strong className="text-[var(--color-text-primary)]">{caseData.asha}</strong>
          </p>
        </div>
        
        {caseData.urgency === 'VIDEO_CONSULT' && (
          <Button 
            size="lg"
            onClick={() => setVideoStarted(true)}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[#4fd1c5] hover:opacity-90 text-white h-20 px-8 text-xl font-bold shadow-xl shadow-[var(--color-primary)]/20 w-full md:w-auto rounded-[24px]"
          >
            <Video size={28} className="mr-3" />
            Join Video Call
          </Button>
        )}
      </FloatingCard>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
        
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          
          {/* AI Summary Card */}
          <FloatingCard className="bg-gradient-to-br from-[#e6fcf9] to-white p-10 border-2 border-[var(--color-primary)]/20 rounded-[32px] shadow-sm">
            <div className="flex items-center gap-4 mb-6 text-[var(--color-primary-dark)] font-extrabold">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <Sparkles size={24} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="text-2xl">AI Case Summary</h2>
            </div>
            <p className="text-[var(--color-text-primary)] leading-relaxed font-medium text-xl">
              Based on the reported symptoms of <span className="font-extrabold text-[var(--color-primary-dark)] bg-[var(--color-primary-light)]/50 px-2 py-0.5 rounded-md">{caseData.symptoms.join(', ')}</span> over the last few days, and a slightly elevated temperature, this appears to be a moderate respiratory infection. Vitals are currently stable, but a video consultation is recommended to confirm diagnosis and prescribe basic medication before deciding if an in-person visit is necessary.
            </p>
          </FloatingCard>

          {/* Symptoms */}
          <FloatingCard className="p-10 rounded-[32px] border-2 border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8 text-[var(--color-text-primary)] font-extrabold">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <FileText size={24} className="text-blue-500" />
              </div>
              <h2 className="text-2xl">Reported Symptoms</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {caseData.symptoms.map(s => (
                <span key={s} className="px-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-base font-extrabold text-[var(--color-text-primary)] shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          </FloatingCard>
          
        </div>

        {/* Right Column: Vitals */}
        <FloatingCard className="p-10 h-fit rounded-[32px] border-2 border-gray-100 shadow-sm flex flex-col gap-8">
          <div className="flex items-center gap-4 text-[var(--color-text-primary)] font-extrabold">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
              <Activity size={24} className="text-indigo-500" />
            </div>
            <h2 className="text-2xl">Latest Vitals</h2>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Heart size={20} className="text-red-500" />
                  </div>
                  <p className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">Heart Rate</p>
                </div>
                <p className="text-3xl font-black text-[var(--color-text-primary)]">{mockVitals.hr} <span className="text-lg font-bold text-gray-400">bpm</span></p>
              </div>
              <div className="w-full bg-gray-200 h-3 mt-4 rounded-full overflow-hidden shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1 }} className="bg-gradient-to-r from-emerald-400 to-green-500 h-full"></motion.div>
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wind size={20} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">SpO₂</p>
                </div>
                <p className="text-3xl font-black text-[var(--color-warning)]">{mockVitals.spo2} <span className="text-lg font-bold text-gray-400">%</span></p>
              </div>
              <div className="w-full bg-gray-200 h-3 mt-4 rounded-full overflow-hidden shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1 }} className="bg-gradient-to-r from-amber-400 to-orange-500 h-full"></motion.div>
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Thermometer size={20} className="text-amber-500" />
                  </div>
                  <p className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">Temperature</p>
                </div>
                <p className="text-3xl font-black text-[var(--color-danger)]">{mockVitals.temp} <span className="text-lg font-bold text-gray-400">°F</span></p>
              </div>
              <div className="w-full bg-gray-200 h-3 mt-4 rounded-full overflow-hidden shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ duration: 1 }} className="bg-gradient-to-r from-red-500 to-rose-600 h-full"></motion.div>
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Droplets size={20} className="text-indigo-500" />
                  </div>
                  <p className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">Blood Pressure</p>
                </div>
                <p className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{mockVitals.bp}</p>
              </div>
            </div>
          </div>
        </FloatingCard>

      </div>
    </div>
  );
}
