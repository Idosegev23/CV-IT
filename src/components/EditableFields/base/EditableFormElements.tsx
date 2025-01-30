import React from 'react';
import { Input } from '@/components/theme/ui/input';
import { Textarea } from '@/components/theme/ui/textarea';
import { Button } from '@/components/theme/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EditableInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  className?: string;
}

export const EditableInput: React.FC<EditableInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  icon: Icon,
  error,
  dir = 'auto',
  className
}) => {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        dir={dir}
        className={cn(
          "pl-10",
          "bg-white text-gray-900",
          "rounded-xl border-gray-200",
          "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
          error && "border-red-500 focus:border-red-500",
          className
        )}
      />
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      )}
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

interface EditableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  dir?: 'ltr' | 'rtl' | 'auto';
  className?: string;
}

export const EditableTextarea: React.FC<EditableTextareaProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  dir = 'auto',
  className
}) => {
  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        onBlur={onBlur}
        placeholder={placeholder}
        dir={dir}
        className={cn(
          "p-4 overflow-hidden",
          "bg-white text-gray-900",
          "rounded-xl border-gray-200",
          "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
          "resize-none min-h-[100px]",
          className
        )}
        maxLength={maxLength}
      />
      {maxLength && (
        <div className={cn(
          "text-right text-sm text-gray-500 mt-2",
          value.length >= maxLength && "text-red-500"
        )}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

interface ActionButtonsProps {
  onCancel: () => void;
  onSave: () => void;
  isLoading?: boolean;
  isRTL?: boolean;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onSave,
  isLoading = false,
  isRTL = false,
  disabled = false
}) => {
  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={onCancel}
        disabled={isLoading}
        className={cn(
          "flex-1 px-4 py-2.5",
          "rounded-full border-2 border-[#4856CD]",
          "text-[#4856CD] hover:bg-[#4856CD]/5",
          "transition-colors font-medium",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        {isRTL ? 'ביטול' : 'Cancel'}
      </button>
      <button
        onClick={onSave}
        disabled={isLoading || disabled}
        className={cn(
          "flex-1 px-4 py-2.5",
          "rounded-full bg-[#4856CD]",
          "text-white hover:bg-[#4856CD]/90",
          "transition-colors font-medium",
          (isLoading || disabled) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading 
          ? (isRTL ? 'מעבד...' : 'Processing...') 
          : (isRTL ? 'שמירה' : 'Save')
        }
      </button>
    </div>
  );
}; 