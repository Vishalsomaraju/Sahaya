import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell, Activity } from 'lucide-react';
import { mockDoctor, mockAshaWorker, mockCurrentPatient } from '../../data/mockData';

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isHome = location.pathname.split('/').filter(Boolean).length <= 1;
  const isAsha = location.pathname.startsWith('/asha');
  const isDoctor = location.pathname.startsWith('/doctor');

  // Derive active user profile info
  const user = isDoctor 
    ? { name: mockDoctor.name, role: mockDoctor.role, avatarText: 'PS', isDoctor: true }
    : isAsha
    ? { name: mockAshaWorker.name, role: `${mockAshaWorker.role} • ${mockAshaWorker.village}`, avatarText: 'RD' }
    : { name: mockCurrentPatient.name, role: `Patient • ${mockCurrentPatient.village}`, avatarText: 'AK' };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 max-w-7xl mx-auto w-full gap-4">
        
        {/* Left Section: Back button & Quick Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {!isHome ? (
            <button 
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
          ) : null}

          {/* Mobile Brand Logo */}
          <div 
            className="flex items-center gap-2 md:hidden cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="flex items-center justify-center bg-[var(--color-primary)] text-white w-7 h-7 rounded-md">
              <Activity size={16} />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-sm">SAHAYA</span>
          </div>

          {/* Global Clinical Search Bar */}
          <div className="hidden sm:flex items-center relative max-w-md w-full">
            <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder={isDoctor ? "Search patients, cases, symptoms... (Ctrl+K)" : isAsha ? "Search village patients or records..." : "Search health records..."}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white transition-colors"
            />
            <kbd className="absolute right-2.5 text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
        
        {/* Right Section: System Status & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Notification Alert */}
          <button 
            aria-label="Notifications"
            className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile Chip (Reference layout) */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-xs">
              {user.avatarText}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[150px]">
                {user.role}
              </span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
