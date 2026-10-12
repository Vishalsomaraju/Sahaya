import { useState } from 'react';
import { 
  AlertCircle, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Activity, 
  Video, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Clock,
  Check
} from 'lucide-react';
import FloatingCard from './FloatingCard';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';

export interface Facility {
  id: string;
  name: string;
  type: string;
  distance: string;
}

export interface TriageResultProps {
  level: string;
  title?: string;
  risk?: string;
  nextAction: string;
  explanation?: string[];
  nextSteps?: string[];
  limitations?: string[];
  escalationGuidance?: string;
  disclaimer?: string;
  facilities?: Facility[];
  onDownloadSummary: () => void;
  onConnectDoctor?: () => void;
  symptoms?: string[];
  assessmentId?: string;
}

export default function TriageResult({
  level = 'SELF_CARE',
  title,
  risk,
  nextAction,
  explanation = [],
  nextSteps = [],
  limitations = [],
  escalationGuidance,
  disclaimer,
  facilities = [],
  onDownloadSummary,
  onConnectDoctor,
  symptoms,
  assessmentId
}: TriageResultProps) {
  const [whyExpanded, setWhyExpanded] = useState(true);

  // Clinical Urgency Configuration
  const getUrgencyConfig = () => {
    switch (level?.toUpperCase()) {
      case 'EMERGENCY':
        return {
          label: 'Critical Emergency',
          badgeClass: 'bg-red-50 text-red-700 border-red-200',
          dotClass: 'bg-red-600',
          borderClass: 'border-l-4 border-l-red-500',
          bannerBg: 'bg-red-50/70 border-red-200',
          textColor: 'text-red-900',
          actionBg: 'bg-red-50/80 border-red-200 text-red-950',
          icon: <ShieldAlert size={18} className="text-red-600" />
        };
      case 'VISIT_PHC':
        return {
          label: 'Referral Required • Visit PHC',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-600',
          borderClass: 'border-l-4 border-l-amber-500',
          bannerBg: 'bg-amber-50/60 border-amber-200',
          textColor: 'text-amber-950',
          actionBg: 'bg-amber-50/80 border-amber-200 text-amber-950',
          icon: <AlertTriangle size={18} className="text-amber-600" />
        };
      case 'VIDEO_CONSULT':
        return {
          label: 'Tele-Consultation Recommended',
          badgeClass: 'bg-teal-50 text-[var(--color-primary-dark)] border-teal-200',
          dotClass: 'bg-[var(--color-primary)]',
          borderClass: 'border-l-4 border-l-[var(--color-primary)]',
          bannerBg: 'bg-teal-50/50 border-teal-200',
          textColor: 'text-slate-900',
          actionBg: 'bg-teal-50/80 border-teal-200 text-teal-950',
          icon: <Video size={18} className="text-[var(--color-primary)]" />
        };
      case 'SELF_CARE':
      default:
        return {
          label: 'Low Risk • Self-Care at Home',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotClass: 'bg-emerald-600',
          borderClass: 'border-l-4 border-l-emerald-500',
          bannerBg: 'bg-emerald-50/50 border-emerald-200',
          textColor: 'text-slate-900',
          actionBg: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
          icon: <CheckCircle2 size={18} className="text-emerald-600" />
        };
    }
  };

  const computedRisk = risk || (
    level === 'EMERGENCY' ? 'Critical' :
    level === 'VISIT_PHC' ? 'Moderate' :
    level === 'VIDEO_CONSULT' ? 'Low-Moderate' : 'Low'
  );

  const getRiskBadge = () => {
    switch (computedRisk?.toLowerCase()) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'moderate':
      case 'high':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low-moderate':
      case 'medium':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'low':
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  const config = getUrgencyConfig();

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto animate-fade-in">
      
      {/* 1. Clinical Disclaimer Header */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
        <Info size={15} className="text-indigo-600 shrink-0" />
        <span className="font-medium">
          <strong>Clinical Decision Support Disclaimer: </strong>
          {disclaimer || "This is an algorithmic triage recommendation for informational guidance only. It does not replace professional clinical evaluation by a qualified physician."}
        </span>
      </div>

      {/* 2. Core Urgency & Triage Outcome Card */}
      <FloatingCard className={`p-5 sm:p-6 border-slate-200 ${config.borderClass}`}>
        
        {/* Top Badges: Urgency Status + Assessed Risk + Record ID */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${config.dotClass}`}></span>
              {config.label}
            </span>
            {assessmentId && (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                ID: #{assessmentId.slice(0, 8)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Activity size={14} className="text-slate-400" />
            <span>Assessed Risk:</span>
            <span className={`px-2 py-0.5 rounded-md font-semibold text-xs border ${getRiskBadge()}`}>
              {computedRisk}
            </span>
          </div>
        </div>

        {/* Primary Triage Title / Outcome */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4">
          {title || (
            level === 'EMERGENCY' ? 'Emergency Medical Escalation Required' :
            level === 'VISIT_PHC' ? 'Primary Health Centre Evaluation Advised' :
            level === 'VIDEO_CONSULT' ? 'Physician Consultation Recommended' :
            'Home Care & Symptom Monitoring Advised'
          )}
        </h2>

        {/* Recommended Action Card */}
        <div className={`p-4 rounded-lg border ${config.actionBg} mb-4`}>
          <span className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-80">
            Recommended Next Action
          </span>
          <p className="text-base sm:text-lg font-bold leading-snug">
            {nextAction || 'Follow clinical guidance and monitor symptoms closely.'}
          </p>
        </div>

        {/* Symptoms Overview */}
        {symptoms && symptoms.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Evaluated symptoms:</span>
            {symptoms.map(s => (
              <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        )}

      </FloatingCard>

      {/* 3. Clinical Data Limitations Banner (e.g. absent vitals notification) */}
      {limitations && limitations.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle size={15} className="text-amber-600" />
            <span>Clinical Data Limitations & Notice</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-900/90 pl-1">
            {limitations.map((lim, idx) => (
              <li key={idx} className="leading-relaxed">
                {lim}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Actionable Next Steps Checklist */}
      {nextSteps && nextSteps.length > 0 && (
        <FloatingCard className="p-5 border-slate-200">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Clock size={16} className="text-[var(--color-primary)]" />
            <h3 className="font-bold text-sm text-slate-900">Recommended Clinical Actions</h3>
          </div>
          <ul className="space-y-2">
            {nextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="w-4 h-4 rounded-full bg-teal-50 border border-teal-300 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </FloatingCard>
      )}

      {/* 5. Clinical Rationale Accordion */}
      {explanation && explanation.length > 0 && (
        <FloatingCard className="p-0 overflow-hidden border-slate-200">
          <button 
            onClick={() => setWhyExpanded(!whyExpanded)}
            aria-expanded={whyExpanded}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center">
                <AlertCircle size={15} />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">Clinical Assessment Rationale</span>
                <span className="text-xs text-slate-500 font-normal">Deterministic rules and medical evidence used in evaluation</span>
              </div>
            </div>
            {whyExpanded ? (
              <ChevronUp size={18} className="text-slate-400" />
            ) : (
              <ChevronDown size={18} className="text-slate-400" />
            )}
          </button>
          
          <AnimatePresence initial={false}>
            {whyExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-slate-100 bg-slate-50/50"
              >
                <ul className="p-4 sm:p-5 space-y-2.5">
                  {explanation.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </FloatingCard>
      )}

      {/* 6. Escalation Guidance Box */}
      {escalationGuidance && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-0.5">Escalation & Monitoring Guidance:</strong>
            <p className="leading-relaxed">{escalationGuidance}</p>
          </div>
        </div>
      )}

      {/* 7. Nearby Healthcare Facilities (when applicable) */}
      {facilities && facilities.length > 0 && (
        <FloatingCard className="p-5 border-slate-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--color-primary)]" />
              <h3 className="font-bold text-sm text-slate-900">Recommended Healthcare Facilities</h3>
            </div>
            <span className="text-xs text-slate-400">{facilities.length} available</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facilities.map(facility => (
              <div 
                key={facility.id} 
                className="p-3.5 rounded-lg border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">
                    {facility.name}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5 inline-block">
                    Facility Type: {facility.type}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold text-[var(--color-primary-dark)] bg-teal-50 border border-teal-200 shrink-0">
                  {facility.distance}
                </span>
              </div>
            ))}
          </div>
        </FloatingCard>
      )}

      {/* 8. Primary Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {level === 'VIDEO_CONSULT' && onConnectDoctor && (
          <Button 
            size="md"
            variant="primary"
            fullWidth
            onClick={onConnectDoctor}
            className="text-sm font-semibold shadow-clinical"
          >
            <Video size={16} />
            <span>Connect to Doctor Online</span>
          </Button>
        )}

        <Button 
          variant={level === 'VIDEO_CONSULT' && onConnectDoctor ? "outline" : "primary"}
          size="md"
          fullWidth
          onClick={onDownloadSummary}
          className="text-sm font-semibold shadow-clinical"
        >
          <FileText size={16} />
          <span>View Patient Summary Report</span>
        </Button>
      </div>

    </div>
  );
}
