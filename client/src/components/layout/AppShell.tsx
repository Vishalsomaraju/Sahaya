import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { Home, Stethoscope, ClipboardList, Calendar, UserCircle, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function BottomNav() {
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
      { label: 'Consults', icon: Stethoscope, path: '/doctor/consultations' },
    ];
  } else if (isAsha) {
    navItems = [
      { label: 'Dashboard', icon: Home, path: '/asha' },
      { label: 'Assess', icon: ClipboardList, path: '/asha/assessments' },
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
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-[var(--color-border)] pb-safe pt-2 px-2 flex justify-around items-center z-50 md:hidden shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <button 
            key={item.label}
            onClick={() => navigate(item.path)}
            className={twMerge(
              clsx(
                "flex flex-col items-center gap-1 p-2 w-16 transition-all duration-200",
                isActive ? "text-[var(--color-primary)] -translate-y-1" : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              )
            )}
          >
            <item.icon size={24} className={isActive ? "drop-shadow-sm" : ""} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        )
      })}
    </div>
  );
}

export default function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 relative">
        <TopBar />
        <main className="flex-1 overflow-x-hidden p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
