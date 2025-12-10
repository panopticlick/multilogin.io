import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, errorMessage, icon, iconPosition = 'left', 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    // Compute ARIA attributes
    const computedAriaInvalid = ariaInvalid ?? (error ? 'true' : undefined);
    const computedAriaDescribedBy = ariaDescribedBy ?? (errorMessage && error ? `${props.id}-error` : undefined);

    const inputProps = {
      type,
      'aria-invalid': computedAriaInvalid,
      'aria-describedby': computedAriaDescribedBy,
      ref,
      ...props,
    };

    if (icon) {
      return (
        <div className="relative">
          {iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}
          <input
            {...inputProps}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              iconPosition === 'left' && 'pl-10',
              iconPosition === 'right' && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
          />
          {iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        {...inputProps}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
