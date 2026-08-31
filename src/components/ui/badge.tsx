import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'blue' | 'purple' | 'gold' | 'green' | 'neutral';
};

export function Badge({ tone = 'blue', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn('ui-badge', `ui-badge-${tone}`, className)}
      {...props}
    />
  );
}
