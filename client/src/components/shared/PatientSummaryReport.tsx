import { X, Printer, Share2 } from 'lucide-react';

interface PatientSummaryReportProps {
  summary: {
    patientName: string;
    age: number;
    symptoms: string[];
    vitals: {
      hr: number;
      spo2: number;
      temp: number;
      bp: string;
    };
    recommendation: string;
    generatedAt: string;
  };
  onClose: () => void;
}

export default function PatientSummaryReport({ summary, onClose }: PatientSummaryReportProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
          <h2 className="font-bold text-[var(--color-text-primary)]">Patient Summary Report</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-[var(--color-text-muted)] hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          <div className="text-center pb-4 border-b border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{summary.patientName}, {summary.age}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Generated: {summary.generatedAt}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">AI Triage Recommendation</h4>
            <div className="bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold p-4 rounded-xl border border-[var(--color-primary)] text-center">
              {summary.recommendation}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Reported Symptoms</h4>
            <div className="flex flex-wrap gap-2">
              {summary.symptoms.map(s => (
                <span key={s} className="bg-gray-100 text-[var(--color-text-primary)] px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-border)]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Vitals Snapshot</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                <span className="text-xs text-[var(--color-text-muted)] block mb-1">Heart Rate</span>
                <span className="font-bold text-[var(--color-text-primary)]">{summary.vitals.hr} <span className="text-xs font-normal">bpm</span></span>
              </div>
              <div className="bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                <span className="text-xs text-[var(--color-text-muted)] block mb-1">SpO₂</span>
                <span className="font-bold text-[var(--color-text-primary)]">{summary.vitals.spo2} <span className="text-xs font-normal">%</span></span>
              </div>
              <div className="bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                <span className="text-xs text-[var(--color-text-muted)] block mb-1">Temperature</span>
                <span className="font-bold text-[var(--color-text-primary)]">{summary.vitals.temp} <span className="text-xs font-normal">°F</span></span>
              </div>
              <div className="bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                <span className="text-xs text-[var(--color-text-muted)] block mb-1">Blood Pressure</span>
                <span className="font-bold text-[var(--color-text-primary)]">{summary.vitals.bp}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)] flex gap-3">
          <button className="flex-1 bg-white border border-[var(--color-border)] hover:bg-gray-50 text-[var(--color-text-primary)] p-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <Share2 size={18} />
            Share
          </button>
          <button className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white p-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Printer size={18} />
            Print
          </button>
        </div>

      </div>
    </div>
  );
}
