'use client';

import React from 'react';
import { Button } from '@/components/theme/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/theme/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/theme/ui/tooltip';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Languages,
  Type,
  TextQuote,
  Link2,
  Unlink,
  Image
} from 'lucide-react';
import { Dictionary } from '@/dictionaries/dictionary';
import { FormatButton, FONTS, FONT_SIZES } from '@/types/editor';

interface EditorToolbarProps {
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  direction: string;
  setDirection: (dir: string) => void;
  handleFormat: (command: string, value?: string) => void;
  dictionary: Dictionary;
  lang: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const formatButtons: FormatButton[] = [
  { icon: <Bold />, command: 'bold', tooltip: 'Bold' },
  { icon: <Italic />, command: 'italic', tooltip: 'Italic' },
  { icon: <Underline />, command: 'underline', tooltip: 'Underline' },
  { icon: <AlignLeft />, command: 'justifyLeft', tooltip: 'Align Left' },
  { icon: <AlignCenter />, command: 'justifyCenter', tooltip: 'Align Center' },
  { icon: <AlignRight />, command: 'justifyRight', tooltip: 'Align Right' },
  { icon: <List />, command: 'insertUnorderedList', tooltip: 'Bullet List' },
  { icon: <ListOrdered />, command: 'insertOrderedList', tooltip: 'Number List' },
  { icon: <TextQuote />, command: 'indent', tooltip: 'Indent' },
  { icon: <Link2 />, command: 'createLink', tooltip: 'Add Link' },
  { icon: <Unlink />, command: 'unlink', tooltip: 'Remove Link' },
  { icon: <Image />, command: 'insertImage', tooltip: 'Add Image' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  selectedFont,
  setSelectedFont,
  fontSize,
  setFontSize,
  direction,
  setDirection,
  handleFormat,
  dictionary,
  lang,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const fontOptions = FONTS.map(font => font.name);
  
  return (
    <TooltipProvider>
      <div className="sticky top-0 z-50 bg-background border-b p-2 flex flex-wrap gap-2 items-center shadow-md">
        {/* History Controls */}
        <div className="flex gap-1">
          <Tooltip content={dictionary.editor.undo}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label={dictionary.editor.undo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>

          <Tooltip content={dictionary.editor.redo}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label={dictionary.editor.redo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Font Controls */}
        <Select
          value={selectedFont}
          onValueChange={setSelectedFont}
          aria-label={dictionary.editor.selectFont}
        >
          <SelectTrigger>
            <Type className="h-4 w-4" />
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={fontSize}
          onValueChange={setFontSize}
          aria-label={dictionary.editor.selectSize}
        >
          <SelectTrigger>
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-border" />

        {/* Format Controls */}
        <div className="flex flex-wrap gap-1">
          {formatButtons.map((button) => (
            <Tooltip key={button.command} content={button.tooltip}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleFormat(button.command)}
                  aria-label={button.tooltip}
                >
                  {button.icon}
                </Button>
              </TooltipTrigger>
            </Tooltip>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Direction Control */}
        <Tooltip content={dictionary.editor.toggleDirection}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setDirection(direction === 'ltr' ? 'rtl' : 'ltr')}
              aria-label={dictionary.editor.toggleDirection}
            >
              <Languages className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}; 