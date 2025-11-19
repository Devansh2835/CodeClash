'use client';
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium mb-2 text-gray-300">
            {icon && <span>{icon}</span>}
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-gray-700 border rounded-lg',
            'text-white placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-gray-600',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-danger-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;