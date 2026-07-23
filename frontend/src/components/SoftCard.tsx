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
          hoverEffect && !inset && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_24px_#cbd5e1,-12px_-12px_24px_#ffffff]',
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
