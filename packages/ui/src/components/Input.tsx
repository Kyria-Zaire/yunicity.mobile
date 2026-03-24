import { cn } from '../lib/utils.js';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  icon,
  className,
  id,
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? props.name ?? 'input-field';

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="block font-body text-sm font-medium text-[#374151] mb-1.5">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none [&_svg]:w-[18px] [&_svg]:h-[18px]">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full h-12 rounded-xl border bg-white text-[#0D0F2E] text-sm',
            'px-4 placeholder:text-[#9CA3AF]',
            'focus:border-[#2A2FFF] focus:outline-none focus:shadow-[0_0_0_4px_rgba(42,47,255,0.08)]',
            'disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:cursor-not-allowed',
            'transition-all duration-200',
            icon && 'pl-10',
            error ? 'border-[#DC2626] focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]' : 'border-[#D1D5DB]',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-err`} className="flex items-center gap-1 text-[#DC2626] text-sm mt-1.5" role="alert">
          <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[#9CA3AF] text-sm mt-1.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
