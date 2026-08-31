import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white shadow-[var(--shadow-button)] hover:bg-[var(--color-primary-hover)]',
  secondary:
    'border border-[var(--color-border-strong)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]',
  ghost:
    'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]',
  danger: 'bg-[var(--color-danger)] text-white hover:bg-red-700',
} as const;

const sizes = {
  sm: 'min-h-10 px-4 py-2 text-sm',
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-14 px-6 py-3 text-base',
  icon: 'size-11 p-0',
} as const;

export function Button({
  className,
  type = 'button',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-bold transition-[background-color,color,border-color,box-shadow,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none',
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
