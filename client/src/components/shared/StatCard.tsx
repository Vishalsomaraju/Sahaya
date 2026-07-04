import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  count: number;
  icon: ReactNode;
  colorClass: string;
}

export default function StatCard({ title, count, icon, colorClass }: StatCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-sm flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
        <p className="text-2xl font-bold text-[var(--color-text-primary)] leading-tight">{count}</p>
      </div>
    </div>
  );
}
