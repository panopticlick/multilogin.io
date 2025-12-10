import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        success:
          'border-transparent bg-success text-success-foreground shadow hover:bg-success/80',
        warning:
          'border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80',
        outline: 'text-foreground',
        ghost: 'border-transparent bg-muted text-muted-foreground',
        // Soft variants with transparent backgrounds
        'soft-primary': 'border-primary/20 bg-primary/10 text-primary',
        'soft-success': 'border-success/20 bg-success/10 text-success',
        'soft-warning': 'border-warning/20 bg-warning/10 text-warning',
        'soft-destructive': 'border-destructive/20 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Status badge with dot indicator
interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'online' | 'offline' | 'busy' | 'away' | 'available' | 'in_use' | 'locked';
  label?: string;
}

function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  const statusConfig = {
    online: { color: 'bg-success', text: 'Online' },
    available: { color: 'bg-success', text: 'Available' },
    offline: { color: 'bg-muted-foreground', text: 'Offline' },
    busy: { color: 'bg-destructive', text: 'Busy' },
    in_use: { color: 'bg-warning', text: 'In Use' },
    away: { color: 'bg-warning', text: 'Away' },
    locked: { color: 'bg-destructive', text: 'Locked' },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-transparent bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground',
        className
      )}
      {...props}
    >
      <span className={cn('h-2 w-2 rounded-full', config.color)} />
      {label || config.text}
    </div>
  );
}

// Plan badge
interface PlanBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  plan: 'free';
}

function PlanBadge({ plan, className, ...props }: PlanBadgeProps) {
  const planConfig = {
    free: { variant: 'ghost' as const, text: 'Free Forever' },
  };

  const config = planConfig[plan];

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.text}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge, PlanBadge };
