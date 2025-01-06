import React, { useState, useEffect } from 'react';
import { Input } from '@/components/theme/ui/input';
import { Button } from '@/components/theme/ui/button';
import { Plus, Minus } from 'lucide-react';

interface EditableListProps {
  items: string[];
  onChange: (value: string[]) => void;
  isEditing: boolean;
  className?: string;
  itemClassName?: string;
  placeholder?: string;
  lang?: 'he' | 'en';
}

export const EditableList: React.FC<EditableListProps> = ({
  items,
  onChange,
  isEditing,
  className = '',
  itemClassName = '',
  placeholder = '',
  lang = 'he'
}) => {
  const [localItems, setLocalItems] = useState<string[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index] = value;
    setLocalItems(newItems);
    onChange(newItems.filter(item => item.trim() !== ''));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    onChange(newItems.filter(item => item.trim() !== ''));
  };

  if (!isEditing) {
    return (
      <ul className={className}>
        {items.filter(item => item.trim() !== '').map((item, index) => (
          <li key={index} className={itemClassName}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={className}>
      {localItems.map((item, index) => (
        <li key={index} className={`${itemClassName} flex items-center gap-2`}>
          <div className="flex-1 flex items-center gap-2">
            <Input
              type="text"
              value={item}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, e.target.value)}
              className="bg-transparent border-none focus:border-none focus:ring-0 w-full"
              placeholder={placeholder}
            />
            <Button
              type="button"
              onClick={() => handleRemoveItem(index)}
              variant="ghost"
              size="icon"
              className="h-6 w-6 min-w-[24px] p-0 shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}; 