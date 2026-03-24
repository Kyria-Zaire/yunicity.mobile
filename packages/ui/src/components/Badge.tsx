import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';
import type { HTMLAttributes } from 'react';

const PREFIX: Partial<Record<string, string>> = {
  verified: '✓ ',
  pending: '⏳ ',
  under_review: '👁 ',
  rejected: '✕ ',
};

const badgeVariants = cva(
  'inline-flex items-center font-mono uppercase tracking-widest rounded-full border border-transparent',
  {
    variants: {
      variant: {
        yunicitizen: 'bg-[#E8E9FF] text-[#2A2FFF]',
        commercial: 'bg-[#DCFCE7] text-[#16A34A]',
        association: 'bg-[#FEF3C7] text-[#D97706]',
        freelance: 'bg-[#F5F3FF] text-[#7C3AED]',
        ecole: 'bg-[#ECFDF5] text-[#059669]',
        verified: 'bg-[#DCFCE7] text-[#16A34A]',
        pending: 'bg-[#FEF3C7] text-[#D97706]',
        under_review: 'bg-[#DBEAFE] text-[#2563EB]',
        rejected: 'bg-[#FEE2E2] text-[#DC2626]',
      },
      size: {
        sm: 'text-[10px] px-2.5 py-0.5 tracking-wider',
        md: 'text-[11px] px-3 py-1 tracking-widest',
        lg: 'text-[13px] px-3.5 py-1.5 tracking-wide',
      },
    },
    defaultVariants: {
      variant: 'yunicitizen',
      size: 'md',
    },
  },
);

type ProfileVariant = 'yunicitizen' | 'commercial' | 'association' | 'freelance' | 'ecole';
type StatusVariant = 'verified' | 'pending' | 'under_review' | 'rejected';

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant: ProfileVariant | StatusVariant;
  label: string;
  size?: VariantProps<typeof badgeVariants>['size'];
  showStatusPrefix?: boolean;
}

export function Badge({
  variant,
  label,
  size,
  showStatusPrefix = true,
  className,
  ...props
}: BadgeProps) {
  const prefix =
    showStatusPrefix && variant in PREFIX ? PREFIX[variant as StatusVariant] ?? '' : '';

  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {prefix}
      {label}
    </span>
  );
}
