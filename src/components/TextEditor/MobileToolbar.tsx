'use client';

import React, { useState } from 'react';
import { Button } from '@/components/theme/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/theme/ui/sheet';
import { Menu, Type, Languages } from 'lucide-react';
import { formatButtons } from './EditorToolbar';
import { Dictionary } from '@/dictionaries/dictionary';
import { FONTS, FONT_SIZES } from '@/types/editor';

interface MobileToolbarProps {
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  direction: string;
  setDirection: (dir: string) => void;
  handleFormat: (command: string, value?: string) => void;
  dictionary: Dictionary;
  lang: string;
}

export const MobileToolbar: React.FC<MobileToolbarProps> = ({
  selectedFont,
  setSelectedFont,
  fontSize,
  setFontSize,
  direction,
  setDirection,
  handleFormat,
  dictionary,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-background border-b p-2 flex items-center justify-between">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label={dictionary.editor.openToolbar}>
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="w-full">
          <div className="grid grid-cols-4 gap-2 p-4">
            {formatButtons.map((button) => (
              <Button
                key={button.command}
                size="sm"
                variant="outline"
                onClick={() => {
                  handleFormat(button.command);
                  setIsOpen(false);
                }}
                aria-label={button.tooltip}
              >
                {button.icon}
                <span className="sr-only">{button.tooltip}</span>
              </Button>
            ))}
          </div>
          
          <div className="flex flex-col gap-2 p-4">
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full p-2 border rounded"
              aria-label={dictionary.editor.selectFont}
            >
              {FONTS
                .filter(font => lang === 'he' ? font.rtl : true)
                .map(font => (
                  <option key={font.name} value={font.name}>{font.name}</option>
                ))}
            </select>

            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full p-2 border rounded"
              aria-label={dictionary.editor.selectSize}
            >
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setDirection(direction === 'ltr' ? 'rtl' : 'ltr')}
          aria-label={dictionary.editor.toggleDirection}
        >
          <Languages className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}; 