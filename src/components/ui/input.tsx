import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leadingIcon, trailing, invalid = false, ...props },
  ref,
) {
  return (
    <span className="ui-input-shell">
      {leadingIcon && (
        <span className="ui-input-icon" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'ui-input',
          leadingIcon && 'ui-input-with-icon',
          trailing && 'ui-input-with-trailing',
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
      {trailing && <span className="ui-input-trailing">{trailing}</span>}
    </span>
  );
});
