import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { LayoutDashboard, Stethoscope, ClipboardList, Calendar, UserCircle, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAsha = location.pathname.startsWith('/asha');
  const isDoctor = location.pathname.startsWith('/doctor');
  const isPatient = location.pathname.startsWith('/patient');

  let navItems: { label: string; icon: any; path: string }[] = [];
  
  if (isDoctor) {
    navItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor' },
      { label: 'Patients', icon: Users, path: '/doctor/patients' },
      { label: 'Consults', icon: Stethoscope, path: '/doctor/consultations' },
    ];
  } else if (isAsha) {
    navItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/asha' },
      { label: 'Assess', icon: ClipboardList, path: '/asha/assessments' },
      { label: 'Patients', icon: Users, path: '/asha/patients' },
    ];
  } else if (isPatient) {
    navItems = [
      { label: 'Overview', icon: LayoutDashboard, path: '/patient' },
      { label: 'History', icon: ClipboardList, path: '/patient/history' },
      { label: 'Reminders', icon: Calendar, path: '/patient/reminders' },
      { label: 'Profile', icon: UserCircle, path: '/patient/profile' },
    ];
  } else {
    return null;
  }

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-1.5 px-3 flex justify-around items-center z-40 md:hidden shadow-lg"
    >
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button 
            key={item.label}
            onClick={() => navigate(item.path)}
            className={twMerge(
              clsx(
                "flex flex-col items-center justify-center gap-1 p-1.5 w-16 rounded-md transition-colors cursor-pointer",
                isActive 
                  ? "text-[var(--color-primary)] font-semibold" 
                  : "text-slate-500 hover:text-slate-800"
              )
            )}
          >
            <Icon size={20} className={isActive ? "text-[var(--color-primary)] stroke-[2.2]" : "stroke-[1.7]"} />
            <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function AppShell() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative">
        <TopBar />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
