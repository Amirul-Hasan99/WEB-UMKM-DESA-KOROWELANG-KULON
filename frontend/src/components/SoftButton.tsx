import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const SoftButton: React.FC<SoftButtonProps> = ({
  variant = 'default',
  size = 'md',
  children,
  icon,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl font-medium',
    md: 'px-5 py-2.5 text-sm rounded-2xl font-semibold',
    lg: 'px-7 py-3.5 text-base rounded-3xl font-bold',
  };

  const variantClasses = {
    default: 'soft-button text-gray-700 hover:text-blue-600',
    primary: 'soft-button-primary text-white',
    secondary: 'soft-button text-blue-600 font-semibold',
    danger: 'bg-red-500 text-white shadow-[4px_4px_10px_#fca5a5,-2px_-2px_6px_#ffffff] hover:bg-red-600 active:scale-95 transition-all',
  };

  return (
    <button
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-2 transition-all cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          className
        )
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default SoftButton;
