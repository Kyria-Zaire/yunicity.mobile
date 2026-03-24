'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2',
    'font-semibold rounded-xl',
    'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2FFF] focus-visible:ring-offset-2',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:scale-100',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[#2A2FFF] text-white',
          'shadow-[0_8px_32px_rgba(42,47,255,0.25),0_2px_8px_rgba(42,47,255,0.15)]',
          'hover:bg-[#1A1ECC] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(42,47,255,0.45)]',
          'active:scale-[0.97]',
        ],
        secondary: [
          'bg-[#E8E9FF] text-[#2A2FFF]',
          'hover:bg-[#D4D5FF] hover:scale-[1.01]',
          'active:scale-[0.97]',
        ],
        ghost: [
          'bg-transparent text-[#6B7280]',
          'hover:bg-[#F3F4F6] hover:text-[#0D0F2E]',
          'active:scale-[0.98]',
        ],
        outline: [
          'bg-transparent border-2 border-[#2A2FFF] text-[#2A2FFF]',
          'hover:bg-[#2A2FFF] hover:text-white hover:scale-[1.01]',
          'active:scale-[0.97]',
        ],
        danger: [
          'bg-[#DC2626] text-white',
          'shadow-[0_4px_16px_rgba(220,38,38,0.25)]',
          'hover:bg-[#B91C1C] hover:scale-[1.01]',
          'active:scale-[0.97]',
        ],
      },
      size: {
        sm: 'h-8 px-4 text-sm',
        md: 'h-10 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      <span className={cn(loading && 'opacity-0')}>{children}</span>
    </button>
  );
}
