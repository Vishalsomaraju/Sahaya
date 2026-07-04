import type { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function FloatingCard({ children, className, onClick, hoverable = false }: FloatingCardProps) {
  return (
    <div 
      onClick={onClick}
      className={twMerge(
        clsx(
          "bg-white rounded-[20px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100",
          hoverable && "transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer",
          onClick && "cursor-pointer",
          className
        )
      )}
    >
      {children}
    </div>
  );
}
