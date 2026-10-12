import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface StatCardProps {
  title: string;
  count: number | string;
  icon: ReactNode;
  colorClass?: string;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export default function StatCard({ 
  title, 
  count, 
  icon, 
  colorClass = "bg-teal-50 text-[var(--color-primary)] border border-teal-100", 
  trend,
  trendPositive,
  subtitle,
  className,
  onClick
}: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={twMerge(
        clsx(
          "bg-white rounded-xl p-4 md:p-5 border border-slate-200/90 shadow-clinical flex flex-col justify-between transition-all duration-150",
          onClick && "cursor-pointer hover:border-slate-300 hover:shadow-clinical-md",
          className
        )
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] line-clamp-1">{title}</p>
        <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm", colorClass)}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          {count}
        </span>
        {subtitle && (
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            {subtitle}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium">
          <span className={clsx(trendPositive ? "text-emerald-600" : "text-amber-600")}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
