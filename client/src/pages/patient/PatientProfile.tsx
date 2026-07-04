import { User, MapPin, Phone, Heart, Activity, ShieldAlert, LogOut } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import { mockCurrentPatient, mockAshaWorker } from '../../data/mockData';
import Button from '../../components/shared/Button';
import { useNavigate } from 'react-router-dom';

export default function PatientProfile() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 pt-6 max-w-4xl mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Profile</h1>
          <p className="text-lg text-[var(--color-text-muted)] font-medium mt-2">Your personal health ID</p>
        </div>
      </div>

      {/* Main Profile Card */}
      <FloatingCard className="p-10 rounded-[32px] border-2 border-[var(--color-primary)]/20 bg-gradient-to-br from-[#e6fcf9] to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-light)] rounded-full -translate-y-1/2 translate-x-1/3 opacity-50 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <User size={64} />
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight mb-2">{mockCurrentPatient.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[var(--color-text-muted)] font-bold mb-6">
              <span className="flex items-center gap-1.5 bg-white/60 px-4 py-1.5 rounded-full"><Activity size={18} /> {mockCurrentPatient.age} years old</span>
              <span className="flex items-center gap-1.5 bg-white/60 px-4 py-1.5 rounded-full"><Heart size={18} /> Blood: O+</span>
              <span className="flex items-center gap-1.5 bg-white/60 px-4 py-1.5 rounded-full"><MapPin size={18} /> {mockCurrentPatient.village}</span>
            </div>
            
            <div className="inline-block bg-[var(--color-primary-dark)] text-white px-6 py-2.5 rounded-full font-extrabold tracking-widest text-sm shadow-md">
              ID: SAH-2023-8942
            </div>
          </div>
        </div>
      </FloatingCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <FloatingCard className="p-8 rounded-[32px] border-2 border-gray-100">
          <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-6 flex items-center gap-3">
            <Phone className="text-[var(--color-primary)]" /> Contact Details
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Mobile Number</p>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">+91 98765 43210</p>
            </div>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Address</p>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">House 42, Main Street<br/>{mockCurrentPatient.village}, Uttar Pradesh</p>
            </div>
          </div>
        </FloatingCard>

        {/* Emergency & ASHA */}
        <FloatingCard className="p-8 rounded-[32px] border-2 border-gray-100 flex flex-col gap-8">
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-4 flex items-center gap-3">
              <ShieldAlert className="text-rose-500" /> Emergency Contact
            </h3>
            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
              <p className="text-lg font-bold text-rose-900">Rajesh Kumar (Son)</p>
              <p className="text-rose-700 font-medium">+91 98765 00000</p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-4 flex items-center gap-3">
              <User className="text-indigo-500" /> Your ASHA Worker
            </h3>
            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-indigo-900">{mockAshaWorker.name}</p>
                <p className="text-indigo-700 font-medium">{mockAshaWorker.village} Region</p>
              </div>
              <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100">
                Contact
              </Button>
            </div>
          </div>
        </FloatingCard>
      </div>

      <Button 
        variant="outline" 
        size="lg"
        onClick={() => navigate('/')}
        className="self-center md:self-start mt-8 h-16 px-10 text-xl font-bold rounded-2xl border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
      >
        <LogOut size={24} className="mr-3" />
        Sign Out
      </Button>

    </div>
  );
}
