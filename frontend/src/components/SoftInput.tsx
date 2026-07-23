import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const SoftInput: React.FC<SoftInputProps> = ({
  label,
  icon,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold tracking-wide uppercase text-gray-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-4 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={twMerge(
            clsx(
              'soft-input w-full py-3 text-sm text-gray-800 rounded-2xl transition-all duration-200 placeholder-gray-400',
              icon ? 'pl-11 pr-4' : 'px-4',
              error && 'border-red-400 focus:border-red-500',
              className
            )
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
};

export default SoftInput;
