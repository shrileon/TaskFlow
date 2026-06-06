import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: boolean;
}

export function Card({ children, hover, padding = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        padding && 'p-4',
        hover && 'transition-shadow hover:shadow-md cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}