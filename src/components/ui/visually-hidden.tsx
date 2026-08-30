import type { HTMLAttributes } from 'react';

export function VisuallyHidden({
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className="sr-only" {...props}>
      {children}
    </span>
  );
}
