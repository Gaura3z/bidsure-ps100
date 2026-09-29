import React from 'react';

interface BadgeProps {
  variant: 'pass' | 'review' | 'fail' | 'mock' | 'live' | 'manual' | 'neutral' | 'info';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantClasses = {
    pass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    review: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    fail: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    mock: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    live: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    manual: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-sans tracking-tight transition-colors ${sizeClasses} ${variantClasses} ${className}`}
    >
      {variant === 'pass' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {variant === 'review' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {variant === 'fail' && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
      {variant === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
      {variant === 'mock' && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
      {children}
    </span>
  );
};
