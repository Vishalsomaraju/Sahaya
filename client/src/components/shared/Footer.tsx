import { useNavigate } from "react-router-dom";
import { Activity, ShieldCheck } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative z-10 bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-8 pb-8 border-b border-slate-800">
          
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div 
              className="flex items-center gap-2.5 cursor-pointer inline-flex"
              onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="flex items-center justify-center bg-[var(--color-primary)] text-white w-7 h-7 rounded-md">
                <Activity size={16} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-base tracking-tight text-white">SAHAYA</span>
              <span className="text-[10px] font-semibold bg-teal-900/60 text-teal-300 border border-teal-700/60 px-1.5 py-0.5 rounded">
                Tele-Triage
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Standardized healthcare tele-triage connecting rural patients, ASHA community field workers, and Primary Health Centre physicians.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-400 font-medium">
              <ShieldCheck size={14} />
              <span>Standard Clinical Decision Protocol Architecture</span>
            </div>
          </div>

          {/* Role Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Role Workspaces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => navigate('/patient')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Patient Self-Assessment Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/asha')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ASHA Community Health Desk
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/doctor')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Doctor Clinical Case Review
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/patient/assessment')} 
                  className="hover:text-white transition-colors cursor-pointer text-teal-400"
                >
                  Direct Symptom Triage →
                </button>
              </li>
            </ul>
          </div>

          {/* System & Clinical Disclaimer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Clinical Notice
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal mb-3">
              SAHAYA provides structured algorithmic decision support for symptom screening and care navigation. In life-threatening emergencies, contact emergency medical transport (108) immediately.
            </p>
            <span className="text-[10px] font-mono text-slate-600 block">
              Version 2.4.0 • FHIR/ABDM Aligned Prototype
            </span>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SAHAYA Healthcare Systems. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">Primary Healthcare Tele-triage Unit</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500">Rampur Field Cluster Pilot</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
