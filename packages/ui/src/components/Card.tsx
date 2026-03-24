import { cn } from '../lib/utils.js';
import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'dark' | 'accent' | 'flat';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  hoverable?: boolean;
  accent?: boolean;
  asLink?: boolean;
}

export function Card({
  children,
  variant = 'default',
  hoverable = true,
  accent = false,
  asLink = false,
  className,
  ...props
}: CardProps) {
  const base = {
    default: [
      'bg-white rounded-2xl border border-[#F3F4F6]',
      'shadow-[0_2px_12px_rgba(13,15,46,0.07)]',
    ],
    dark: [
      'bg-[#1C1F4A] rounded-2xl border border-[#2A2FFF]/10 text-white',
      'shadow-[0_2px_12px_rgba(13,15,46,0.07)]',
    ],
    accent: [
      'bg-white rounded-2xl border border-[#F3F4F6] border-t-4 border-t-[#2A2FFF]',
      'shadow-[0_2px_12px_rgba(13,15,46,0.07)]',
    ],
    flat: 'bg-[#F3F4F6] rounded-xl border-0 shadow-none',
  };

  const hover =
    hoverable && variant !== 'flat'
      ? [
          'transition-all duration-300',
          asLink || props.onClick ? 'cursor-pointer' : '',
          'hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(13,15,46,0.12)]',
        ]
      : [];

  const v = accent && variant === 'default' ? 'accent' : variant;

  return (
    <div
      className={cn(base[v], hover, className)}
      {...props}
    >
      {children}
    </div>
  );
}
