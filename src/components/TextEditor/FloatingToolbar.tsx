'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/theme/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/theme/ui/tooltip';
import { Bold, Italic, Underline, List, Link2, Plus } from 'lucide-react';

interface FloatingToolbarProps {
  selection: Selection | null;
  onFormat: (command: string, value?: string) => void;
  dictionary: any;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ selection, onFormat, dictionary }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      if (!selection || selection.isCollapsed) {
        setIsVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setPosition({
        top: rect.top - 50, // Position above the selection
        left: rect.left + (rect.width / 2) - 100 // Center horizontally
      });
      setIsVisible(true);
    };

    updatePosition();
  }, [selection]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed z-50"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <TooltipProvider>
          <div className="flex items-center gap-1 p-1.5 rounded-lg bg-background/95 backdrop-blur-sm border shadow-lg">
            <Tooltip content={dictionary.toolbar.bold}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onFormat('bold')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
            
            <Tooltip content={dictionary.toolbar.italic}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onFormat('italic')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </Tooltip>

            <Tooltip content={dictionary.toolbar.list}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onFormat('insertUnorderedList')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </Tooltip>

            <Tooltip content={dictionary.toolbar.link}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const url = prompt(dictionary.prompts.enterUrl);
                    if (url) onFormat('createLink', url);
                  }}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
        </TooltipProvider>
      </motion.div>
    </AnimatePresence>
  );
}; 