import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/theme/ui/input';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  className?: string;
  placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  isEditing,
  className = '',
  placeholder = ''
}) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setLocalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(localValue);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleBlur = () => {
    onChange(localValue);
  };

  if (!isEditing) {
    return <span className={className}>{value}</span>;
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={`bg-transparent border-none focus:border-none focus:ring-0 p-0 m-0 w-auto ${className}`}
      style={{
        fontSize: 'inherit',
        fontFamily: 'inherit',
        color: 'inherit',
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit'
      }}
      placeholder={placeholder}
    />
  );
}; 