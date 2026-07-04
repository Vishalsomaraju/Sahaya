import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Stethoscope, UserCircle, ClipboardList, Calendar, Users, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAsha = location.pathname.startsWith('/asha');
  const isDoctor = location.pathname.startsWith('/doctor');
  const isPatient = location.pathname.startsWith('/patient');

  let navItems = [];
  
  if (isDoctor) {
    navItems = [
      { label: 'Dashboard', icon: Home, path: '/doctor' },
      { label: 'Patients', icon: Users, path: '/doctor/patients' },
      { label: 'Consultations', icon: Stethoscope, path: '/doctor/consultations' },
    ];
  } else if (isAsha) {
    navItems = [
      { label: 'Dashboard', icon: Home, path: '/asha' },
      { label: 'Assessments', icon: ClipboardList, path: '/asha/assessments' },
      { label: 'Patients', icon: Users, path: '/asha/patients' },
    ];
  } else if (isPatient) {
    navItems = [
      { label: 'Home', icon: Home, path: '/patient' },
      { label: 'History', icon: ClipboardList, path: '/patient/history' },
      { label: 'Reminders', icon: Calendar, path: '/patient/reminders' },
      { label: 'Profile', icon: UserCircle, path: '/patient/profile' },
    ];
  } else {
    return null; // Don't show sidebar on landing
  }

  return (
    <aside className="hidden md:flex flex-col w-[280px] bg-[#f8fafc] border-r border-gray-200 h-screen sticky top-0">
      <div className="flex items-center gap-4 p-8 cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[#4fd1c5] text-white w-12 h-12 rounded-[18px] shadow-lg shadow-[var(--color-primary)]/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
            <path d="M7 11h2.5L11 7l3 10 1.5-4H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-3xl font-black tracking-tighter text-slate-900">SAHAYA</span>
      </div>
      
      <nav className="flex-1 px-5 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={twMerge(
                clsx(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-[20px] transition-all font-bold text-left relative overflow-hidden group",
                  isActive 
                    ? "text-[var(--color-primary-dark)] bg-white shadow-sm border border-gray-100" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                )
              )}
            >
              <item.icon size={22} className={isActive ? "text-[var(--color-primary)]" : "text-slate-400 group-hover:text-slate-700 transition-colors"} />
              <span className="text-base tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-5 mt-auto">
        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[20px] transition-all font-bold text-left text-slate-500 hover:text-slate-900 hover:bg-slate-100 group">
          <Settings size={22} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
          <span className="text-base tracking-wide">Settings</span>
        </button>
      </div>
    </aside>
  );
}
