import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-foreground/80 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">
              {icon}
            </div>
          )}
          <motion.input
            ref={ref as any}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
              w-full h-12 rounded-full px-5 bg-white/50 border border-white/40 
              shadow-inner backdrop-blur-sm transition-all
              focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
              placeholder:text-foreground/30
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-300 focus:ring-red-200' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <motion.span 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 ml-2"
          >
            {error}
          </motion.span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
