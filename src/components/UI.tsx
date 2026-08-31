import * as React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-[#7b68ee] text-white hover:bg-[#6a5ad6] shadow-sm',
      secondary: 'bg-white text-[#475569] border border-slate-200 hover:bg-slate-50 shadow-sm',
      tertiary: 'text-[#7b68ee] hover:bg-[#7b68ee]/5',
      ghost: 'text-slate-500 hover:text-[#1e293b] hover:bg-slate-100',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'healthy' | 'on-hold' | 'review' | 'default';
  children?: React.ReactNode;
  className?: string;
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const variants = {
    healthy: 'bg-emerald-100 text-emerald-700',
    'on-hold': 'bg-slate-100 text-slate-600',
    review: 'bg-amber-100 text-amber-700',
    default: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'bg-white p-6 rounded-lg border border-slate-200 shadow-sm transition-all duration-200',
      className
    )}
    {...props}
  />
);
