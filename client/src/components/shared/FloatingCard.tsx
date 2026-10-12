import type { ReactNode, KeyboardEvent } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  role?: string;
  tabIndex?: number;
}

export default function FloatingCard({ 
  children, 
  className, 
  onClick, 
  hoverable = false,
  role,
  tabIndex,
}: FloatingCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={role || (onClick ? "button" : undefined)}
      tabIndex={tabIndex ?? (onClick ? 0 : undefined)}
      className={twMerge(
        clsx(
          "bg-white rounded-xl p-5 border border-slate-200/90 shadow-clinical transition-all duration-150 text-[var(--color-text-primary)]",
          hoverable && "hover:border-slate-300 hover:shadow-clinical-md cursor-pointer",
          onClick && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
          className
        )
      )}
    >
      {children}
    </div>
  );
}
