import { useState } from 'react';
import { AlertCircle, MapPin, ChevronDown, ChevronUp, FileText, Activity } from 'lucide-react';
import FloatingCard from './FloatingCard';
import AnimatedButton from './AnimatedButton';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, slideInLeft } from '../../lib/animations';

interface Facility {
  id: string;
  name: string;
  type: string;
  distance: string;
}

interface TriageResultProps {
  level: string;
  title: string;
  risk: string;
  nextAction: string;
  explanation: string[];
  facilities: Facility[];
  onDownloadSummary: () => void;
  onConnectDoctor?: () => void;
}

export default function TriageResult({
  level,
  title,
  risk,
  nextAction,
  explanation,
  facilities,
  onDownloadSummary,
  onConnectDoctor
}: TriageResultProps) {
  const [whyExpanded, setWhyExpanded] = useState(true);

  const getUrgencyColor = () => {
    switch (level) {
      case 'EMERGENCY': return 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20';
      case 'VISIT_PHC': return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20';
      case 'VIDEO_CONSULT': return 'bg-gradient-to-r from-[var(--color-primary)] to-teal-400 text-white shadow-lg shadow-[var(--color-primary)]/20';
      case 'SELF_CARE': return 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/20';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  const getRiskColor = () => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'text-red-600';
      case 'moderate': return 'text-orange-500';
      case 'low-moderate': return 'text-[var(--color-primary-dark)]';
      case 'low': return 'text-emerald-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* Urgency Block */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, filter: "brightness(1.2)" }}
        animate={{ scale: 1, opacity: 1, filter: "brightness(1)" }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <FloatingCard className="text-center flex flex-col items-center border-t-8 border-t-[var(--color-primary)] rounded-3xl p-10 relative overflow-hidden">
          {/* Subtle initial glow effect overlay */}
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute inset-0 z-0 pointer-events-none ${getUrgencyColor().split(' ')[0]} mix-blend-overlay opacity-30`}
          />
          <div className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-extrabold mb-8 tracking-widest ${getUrgencyColor()}`}>
            {level.replace('_', ' ')}
          </div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] mb-5 tracking-tight">
          {title}
        </h2>
        
        <div className="flex items-center gap-3 mb-8 bg-gray-50 px-6 py-3 rounded-full border border-gray-200">
          <Activity size={20} className={getRiskColor()} />
          <span className="text-base font-extrabold text-[var(--color-text-muted)] uppercase tracking-wider">Estimated Risk:</span>
          <span className={`text-lg font-extrabold ${getRiskColor()}`}>{risk}</span>
        </div>
        
        <div className="relative z-10 w-full bg-[var(--color-primary-light)]/30 rounded-3xl p-8 border border-[var(--color-primary)]/20">
          <span className="text-sm text-[var(--color-text-muted)] block mb-3 font-extrabold uppercase tracking-widest">Recommended Action</span>
          <p className="text-2xl md:text-3xl text-[var(--color-primary-dark)] font-extrabold leading-tight">{nextAction}</p>
        </div>
      </FloatingCard>
      </motion.div>

      {/* Why Section */}
      <FloatingCard className="p-0 overflow-hidden rounded-3xl border-2 border-gray-100">
        <button 
          onClick={() => setWhyExpanded(!whyExpanded)}
          className="w-full p-8 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle size={24} />
            </div>
            <span className="font-extrabold text-xl text-[var(--color-text-primary)]">Why this recommendation?</span>
          </div>
          {whyExpanded ? <ChevronUp size={24} className="text-[var(--color-text-muted)]" /> : <ChevronDown size={24} className="text-[var(--color-text-muted)]" />}
        </button>
        
        <AnimatePresence>
          {whyExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t-2 border-gray-100"
            >
              <div className="p-8">
                <motion.ul 
                  variants={staggerContainer(0.1)} 
                  initial="hidden" 
                  animate="show" 
                  className="space-y-5"
                >
                  {explanation.map((exp, idx) => (
                    <motion.li key={idx} variants={slideInLeft} transition={{ duration: 0.4 }} className="flex gap-4 items-start text-lg font-medium text-[var(--color-text-primary)] leading-relaxed">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0 shadow-sm" />
                      <span>{exp}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingCard>

      {/* Find Nearest Facility or Connect Doctor */}
      {facilities.length > 0 && (
        <FloatingCard className="p-8 rounded-3xl border-2 border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <h3 className="font-extrabold text-2xl text-[var(--color-text-primary)]">Nearby Facilities</h3>
          </div>
          
          <div className="space-y-4">
            {facilities.map(facility => (
              <div key={facility.id} className="flex items-center justify-between p-6 rounded-2xl border-2 border-gray-100 hover:border-[var(--color-primary)] transition-all cursor-pointer group bg-gray-50/50 hover:bg-white hover:shadow-md">
                <div>
                  <h4 className="font-extrabold text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{facility.name}</h4>
                  <p className="text-base font-medium text-[var(--color-text-muted)] mt-1">{facility.type}</p>
                </div>
                <div className="bg-white border-2 border-gray-200 shadow-sm px-4 py-2 rounded-full text-sm font-extrabold text-[var(--color-text-primary)] tracking-wide">
                  {facility.distance}
                </div>
              </div>
            ))}
          </div>
        </FloatingCard>
      )}

      {level === 'VIDEO_CONSULT' && onConnectDoctor && (
        <AnimatedButton 
          size="lg"
          onClick={onConnectDoctor}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xl font-bold h-20 shadow-xl shadow-[var(--color-primary)]/20 rounded-2xl"
        >
          Connect to Doctor Now
        </AnimatedButton>
      )}

      {/* Actions */}
      <AnimatedButton 
        variant="outline"
        size="lg"
        onClick={onDownloadSummary}
        className="h-20 text-xl font-bold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[var(--color-text-primary)]"
      >
        <FileText size={24} className="mr-3" />
        View Patient Summary
      </AnimatedButton>

    </div>
  );
}
