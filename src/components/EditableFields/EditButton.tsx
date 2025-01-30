import React from 'react';
import { Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditButtonProps {
  onClick: () => void;
  title: string;
  variant?: 'light' | 'dark';
}

export const EditButton: React.FC<EditButtonProps> = ({ onClick, title, variant = 'light' }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "edit-button",
        "absolute right-full ml-2",
        "flex items-center justify-center",
        "rounded-full",
        "transition-all duration-200",
        "hover:bg-gray-100",
        variant === 'light' ? 'text-white' : 'text-gray-600'
      )}
      title={title}
    >
      <Edit2 className="w-4 h-4" />
    </button>
  );
}; 