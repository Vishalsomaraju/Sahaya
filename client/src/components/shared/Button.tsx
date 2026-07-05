import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
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
    const baseClasses = "inline-flex items-center justify-center rounded-[16px] font-medium transition-all duration-200 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm hover:shadow",
    secondary: "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] hover:bg-[#d0f0ee]",
    outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]",
    ghost: "text-[var(--color-text-muted)] hover:bg-gray-100 hover:text-[var(--color-text-primary)]"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-semibold"
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
          props.disabled && "opacity-50 cursor-not-allowed active:scale-100",
          className
        )
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
