import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isHome = location.pathname.split('/').length <= 2;
  const isAsha = location.pathname.startsWith('/asha');
  const isDoctor = location.pathname.startsWith('/doctor');

  const title = isDoctor ? 'Doctor Portal' : isAsha ? 'ASHA Portal' : 'Patient Portal';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {!isHome && (
            <button 
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 rounded-full text-[var(--color-text-muted)] hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2 md:hidden" onClick={() => navigate('/')}>
            <div className="flex items-center justify-center bg-[var(--color-primary)] text-white w-8 h-8 rounded-lg shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                <path d="M7 11h2.5L11 7l3 10 1.5-4H18" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-extrabold tracking-tight text-[var(--color-text-primary)]">SAHAYA</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--color-text-muted)] hidden sm:block">
            {title}
          </span>
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
