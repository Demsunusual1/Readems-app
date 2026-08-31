import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'section' | 'div';
  tone?: 'default' | 'subtle' | 'navy';
};

export function Card({
  as: Element = 'div',
  tone = 'default',
  className,
  ...props
}: CardProps) {
  return (
    <Element
      className={cn('ui-card', `ui-card-${tone}`, className)}
      {...props}
    />
  );
}
