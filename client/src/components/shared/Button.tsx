import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "ai";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      children, 
      variant = "primary", 
      size = "md", 
      fullWidth = false,
      className,
      ...props 
    },
    ref
  ) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-colors duration-150 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] cursor-pointer";
  
    const variants = {
      primary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm font-semibold",
      secondary: "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] hover:bg-[var(--color-primary-subtle)] font-semibold border border-[var(--color-primary)]/20",
      outline: "border border-slate-300 bg-white text-[var(--color-text-primary)] hover:bg-slate-50 hover:border-slate-400 font-medium shadow-sm",
      ghost: "text-[var(--color-text-muted)] hover:bg-slate-100 hover:text-[var(--color-text-primary)] font-medium",
      danger: "bg-[var(--color-danger)] hover:bg-red-600 text-white shadow-sm font-semibold",
      ai: "bg-[var(--color-ai)] hover:bg-indigo-600 text-white shadow-sm font-semibold"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
      md: "px-4 py-2 text-sm rounded-lg gap-2",
      lg: "px-5 py-2.5 text-base rounded-lg gap-2"
    };

    return (
      <button 
        ref={ref}
        className={twMerge(
          clsx(
            baseClasses,
            variants[variant],
            sizes[size],
            fullWidth && "w-full",
            className
          )
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
