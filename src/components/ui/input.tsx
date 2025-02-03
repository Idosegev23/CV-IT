import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          text-sm
          border
          border-gray-300
          rounded-md
          focus:outline-none
          focus:ring-1
          focus:ring-blue-500
          focus:border-transparent
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input'; 