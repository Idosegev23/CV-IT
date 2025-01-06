import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/theme/ui/button';
import { cn } from '@/lib/utils';

interface EditButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
  variant?: 'dark' | 'light';
}

export const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  title,
  className = '',
  variant = 'dark'
}) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        'p-0 h-auto hover:opacity-70 transition-opacity',
        variant === 'dark' ? 'text-gray-900' : 'text-white',
        className
      )}
      title={title}
      variant="ghost"
      size="icon"
    >
      <Pencil className="h-3.5 w-3.5" />
    </Button>
  );
}; 