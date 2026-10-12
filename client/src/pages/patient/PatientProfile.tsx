import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  LogOut, 
  ShieldCheck, 
  Building2
} from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import Button from '../../components/shared/Button';
import { mockCurrentPatient, mockAshaWorker } from '../../data/mockData';

export default function PatientProfile() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16 animate-fade-in">
      
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Health Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Personal identification, emergency contacts, and assigned community healthcare provider
        </p>
      </div>

      {/* Main Patient Identity Card */}
      <FloatingCard className="p-5 sm:p-6 border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-xl shrink-0">
              AK
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {mockCurrentPatient.name}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200">
                  <ShieldCheck size={12} />
                  Verified Health ID
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="font-mono text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                  ID: SAH-2023-8942
                </span>
                <span className="text-slate-300">•</span>
                <span>{mockCurrentPatient.age} years old</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  {mockCurrentPatient.village}, UP
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              Blood Group: O+
            </span>
          </div>

        </div>
      </FloatingCard>

      {/* Two Column Grid: Contact Details & Emergency / ASHA Provider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Contact & Residential Details */}
        <FloatingCard className="p-5 border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Phone size={16} className="text-[var(--color-primary)]" />
            <h3 className="text-sm font-bold text-slate-900">Contact & Residential Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Primary Phone Number
              </span>
              <span className="text-sm font-semibold text-slate-800 font-mono">
                +91 98765 43210
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Permanent Residence
              </span>
              <p className="text-xs font-medium text-slate-700 leading-relaxed">
                House 42, Main Street<br />
                {mockCurrentPatient.village}, Uttar Pradesh, India
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Primary Health Facility
              </span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} className="text-slate-400" />
                Rampur Primary Health Centre (PHC)
              </span>
            </div>
          </div>
        </FloatingCard>

        {/* Support: Emergency Contact & ASHA Community Worker */}
        <div className="flex flex-col gap-4">
          
          {/* Emergency Contact */}
          <FloatingCard className="p-4.5 border-slate-200 bg-red-50/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-950">
                  Designated Emergency Contact
                </h4>
              </div>
            </div>

            <div className="text-xs text-slate-800">
              <span className="font-bold block text-sm">Rajesh Kumar (Son)</span>
              <span className="font-mono text-slate-600 font-medium">+91 98765 00000</span>
            </div>
          </FloatingCard>

          {/* Assigned ASHA Worker */}
          <FloatingCard className="p-4.5 border-slate-200 bg-teal-50/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[var(--color-primary)]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-950">
                  Assigned ASHA Community Worker
                </h4>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-sm text-slate-900 block">{mockAshaWorker.name}</span>
                <span className="text-slate-500">{mockAshaWorker.village} Sector Healthcare Worker</span>
              </div>

              <Button 
                size="sm" 
                variant="outline"
                onClick={() => alert(`Calling ASHA Worker ${mockAshaWorker.name} (+91 98765 11223)...`)}
                className="text-xs bg-white"
              >
                Contact
              </Button>
            </div>
          </FloatingCard>

        </div>

      </div>

      {/* Account Exit Action */}
      <div className="pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/')}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1.5"
        >
          <LogOut size={14} />
          <span>Exit Patient Workspace</span>
        </Button>
      </div>

    </div>
  );
}
