import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SoftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  hoverEffect?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const SoftCard: React.FC<SoftCardProps> = ({
  inset = false,
  hoverEffect = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          inset ? 'soft-card-inset p-5' : 'soft-card p-6',
          hoverEffect && !inset && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_20px_rgba(166,180,200,0.45),-3px_-3px_8px_rgba(255,255,255,0.7)]',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default SoftCard;
