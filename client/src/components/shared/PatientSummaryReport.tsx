import { useEffect, useState } from 'react';
import { X, Printer, Share2, Check, Activity, ShieldCheck, Heart, Wind, Thermometer, Droplets } from 'lucide-react';
import Button from './Button';

export interface PatientSummaryData {
  patientName: string;
  age: number | string;
  symptoms?: string[];
  severity?: string;
  duration?: string;
  triageLevel?: string;
  priority?: string;
  assessmentId?: string;
  vitals?: {
    heartRate?: number | string;
    restingHeartRate?: number | string;
    hr?: number | string;
    spo2?: number | string;
    temperature?: number | string;
    temp?: number | string;
    bloodPressure?: string;
    bp?: string;
    device?: string;
    source?: string;
  } | null;
  recommendation: string;
  generatedAt?: string;
}

export interface PatientSummaryReportProps {
  summary: PatientSummaryData;
  onClose: () => void;
}

export default function PatientSummaryReport({ summary, onClose }: PatientSummaryReportProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const vitals = summary.vitals || null;
  const hrVal = vitals?.heartRate ?? vitals?.hr;
  const spo2Val = vitals?.spo2;
  const tempVal = vitals?.temperature ?? vitals?.temp;
  const bpVal = vitals?.bloodPressure ?? vitals?.bp;
  const hasAnyVitals = !!(hrVal || spo2Val || tempVal || bpVal);

  const formatVitalsForText = () => {
    if (!hasAnyVitals) return 'Not recorded';
    const parts: string[] = [];
    if (hrVal) parts.push(`HR: ${hrVal} bpm`);
    if (spo2Val) parts.push(`SpO2: ${spo2Val}%`);
    if (tempVal) parts.push(`Temp: ${tempVal}°`);
    if (bpVal) parts.push(`BP: ${bpVal}`);
    return parts.join(' | ');
  };

  const handleShare = async () => {
    const refCode = summary.assessmentId ? summary.assessmentId.slice(0, 8).toUpperCase() : 'N/A';
    const shareText = `SAHAYA Clinical Assessment Record:
Patient: ${summary.patientName} (${summary.age} yrs)
Assessment ID: #${refCode}
Triage Decision: ${summary.recommendation}
Reported Symptoms: ${summary.symptoms?.join(', ') || 'None recorded'}
Severity: ${summary.severity || 'Not specified'} | Duration: ${summary.duration || 'Not specified'}
Vitals: ${formatVitalsForText()}
Generated: ${summary.generatedAt || new Date().toLocaleString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Clinical Report - ${summary.patientName}`,
          text: shareText
        });
      } catch {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Patient Summary Report"
    >
      <div className="bg-white rounded-xl w-full max-w-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[var(--color-primary)]" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Clinical Assessment Summary Record
            </span>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close report"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Clinical Document Content (Printable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-900 text-xs sm:text-sm print:overflow-visible print:p-0">
          
          {/* Document Letterhead */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs">
                  <Activity size={14} />
                </div>
                <span className="font-bold text-base tracking-tight text-slate-900">SAHAYA CLINICAL NETWORK</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Community Tele-Triage & Field Referral Record</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600 font-bold mb-1">
                REF #{summary.assessmentId ? summary.assessmentId.slice(0, 8).toUpperCase() : 'PENDING'}
              </span>
              <p className="text-[11px] text-slate-400">Date: {summary.generatedAt || new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient Demographics Box */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{summary.patientName}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Age / Demographics</span>
              <span className="font-bold text-slate-900">{summary.age} years old</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Assessment Type</span>
              <span className="font-medium text-slate-700">Digital Triage Evaluation</span>
            </div>
          </div>

          {/* Triage Decision Section */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Assessed Recommendation
            </h4>
            <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-200 text-[var(--color-primary-dark)]">
              <span className="text-xs font-bold block mb-0.5">Primary Directive:</span>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {summary.recommendation}
              </p>
            </div>
          </div>

          {/* Reported Symptoms, Severity, Duration */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Reported Symptoms & Timeline
            </h4>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {summary.symptoms && summary.symptoms.length > 0 ? (
                summary.symptoms.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No symptoms specified</span>
              )}
            </div>
            {(summary.severity || summary.duration) && (
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                {summary.severity && (
                  <span>Reported Severity: <strong>{summary.severity}</strong></span>
                )}
                {summary.duration && (
                  <span>Duration: <strong>{summary.duration}</strong></span>
                )}
              </div>
            )}
          </div>

          {/* Clinical Vitals Snapshot - Strictly Real Readings Only */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Vitals Baseline Telemetry
              </h4>
              {vitals?.source && (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Source: {vitals.device || vitals.source}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              {/* Heart Rate */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                  <Heart size={12} className="text-red-500" />
                  <span>Heart Rate</span>
                </div>
                {hrVal != null && hrVal !== '' ? (
                  <span className="font-bold text-slate-900 text-sm">
                    {hrVal} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                  </span>
                ) : (
                  <span className="font-medium text-slate-400 text-xs italic">Not recorded</span>
                )}
              </div>

              {/* SpO2 */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                  <Wind size={12} className="text-blue-500" />
                  <span>SpO₂</span>
                </div>
                {spo2Val != null && spo2Val !== '' ? (
                  <span className="font-bold text-slate-900 text-sm">
                    {spo2Val}%
                  </span>
                ) : (
                  <span className="font-medium text-slate-400 text-xs italic">Not recorded</span>
                )}
              </div>

              {/* Temperature */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                  <Thermometer size={12} className="text-amber-500" />
                  <span>Temperature</span>
                </div>
                {tempVal != null && tempVal !== '' ? (
                  <span className="font-bold text-slate-900 text-sm">
                    {tempVal}°{Number(tempVal) < 50 ? 'C' : 'F'}
                  </span>
                ) : (
                  <span className="font-medium text-slate-400 text-xs italic">Not recorded</span>
                )}
              </div>

              {/* Blood Pressure */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                  <Droplets size={12} className="text-teal-600" />
                  <span>Blood Pressure</span>
                </div>
                {bpVal != null && bpVal !== '' ? (
                  <span className="font-bold text-slate-900 text-sm">
                    {bpVal} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                  </span>
                ) : (
                  <span className="font-medium text-slate-400 text-xs italic">Not recorded</span>
                )}
              </div>

            </div>

            {!hasAnyVitals && (
              <p className="text-[11px] text-slate-400 italic mt-1.5">
                * Note: Objective vital signs were not captured during this assessment. Triage urgency is based on reported clinical symptoms.
              </p>
            )}
          </div>

          {/* Clinical Advisory & Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Notice for Healthcare Referral: </strong>
            Please present this assessment document to the Primary Health Centre (PHC) medical officer upon presentation. Generated in compliance with SAHAYA clinical triage protocols.
          </div>

        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 print:hidden">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShare}
            className="flex-1 text-xs gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span>{copied ? 'Copied to Clipboard' : 'Share Summary'}</span>
          </Button>

          <Button 
            variant="primary" 
            size="sm"
            onClick={handlePrint}
            className="flex-1 text-xs gap-1.5"
          >
            <Printer size={14} />
            <span>Print Clinical Record</span>
          </Button>
        </div>

      </div>
    </div>
  );
}
