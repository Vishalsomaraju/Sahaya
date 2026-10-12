import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  ClipboardList, 
  Calendar, 
  UserCircle, 
  Settings, 
  Activity,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAsha = location.pathname.startsWith('/asha');
  const isDoctor = location.pathname.startsWith('/doctor');
  const isPatient = location.pathname.startsWith('/patient');

  let navItems: { label: string; icon: any; path: string; badge?: string }[] = [];
  let roleTitle = "Clinical Portal";
  let roleBadge = "Staff";
  
  if (isDoctor) {
    roleTitle = "Doctor Workspace";
    roleBadge = "MD";
    navItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor' },
      { label: 'Patient Queue', icon: Users, path: '/doctor/patients', badge: '3' },
      { label: 'Consultations', icon: Stethoscope, path: '/doctor/consultations' },
    ];
  } else if (isAsha) {
    roleTitle = "ASHA Health Desk";
    roleBadge = "Field";
    navItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/asha' },
      { label: 'Assessments', icon: ClipboardList, path: '/asha/assessments' },
      { label: 'Patients', icon: Users, path: '/asha/patients' },
    ];
  } else if (isPatient) {
    roleTitle = "Patient Portal";
    roleBadge = "User";
    navItems = [
      { label: 'Overview', icon: LayoutDashboard, path: '/patient' },
      { label: 'Health History', icon: ClipboardList, path: '/patient/history' },
      { label: 'Reminders', icon: Calendar, path: '/patient/reminders' },
      { label: 'Health Profile', icon: UserCircle, path: '/patient/profile' },
    ];
  } else {
    return null; // Don't show sidebar on landing
  }

  return (
    <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div 
        className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => navigate('/')}
        title="Return to SAHAYA Home"
      >
        <div className="flex items-center justify-center bg-[var(--color-primary)] text-white w-9 h-9 rounded-lg shadow-sm">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900">SAHAYA</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200 rounded">
              {roleBadge}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Healthcare Tele-Triage</span>
        </div>
      </div>

      {/* Role Context Bar */}
      <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">{roleTitle}</span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active
        </span>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={twMerge(
                clsx(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left group cursor-pointer",
                  isActive 
                    ? "bg-[var(--color-primary)] text-white shadow-sm font-semibold" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon 
                  size={18} 
                  className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 transition-colors"} 
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={clsx(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Portal Switcher Shortcuts */}
        <div className="pt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Switch Workspace
        </div>
        <div className="space-y-0.5">
          {!isDoctor && (
            <button 
              onClick={() => navigate('/doctor')}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              <span>Doctor Portal</span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          )}
          {!isAsha && (
            <button 
              onClick={() => navigate('/asha')}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              <span>ASHA Portal</span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          )}
          {!isPatient && (
            <button 
              onClick={() => navigate('/patient')}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              <span>Patient Portal</span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          )}
        </div>
      </nav>
      
      {/* Clinical Reference Support Box */}
      <div className="p-3 mx-3 mb-2 rounded-lg bg-teal-50/70 border border-teal-100 text-[11px] text-teal-900">
        <div className="flex items-center gap-1.5 font-semibold mb-1 text-[var(--color-primary-dark)]">
          <ShieldCheck size={14} />
          <span>Clinical Protocol</span>
        </div>
        <p className="text-slate-600 leading-tight">
          Standard triage protocols verified with primary care guidelines.
        </p>
      </div>

      {/* Footer Settings */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          title="Role Switcher"
        >
          <ExternalLink size={15} className="text-slate-400" />
          <span>Exit Workspace</span>
        </button>
        <button 
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          title="System Settings"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </aside>
  );
}
