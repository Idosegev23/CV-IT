import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/theme/ui/dialog';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BaseEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isRTL?: boolean;
  template?: string;
  size?: 'default' | 'large';
}

export const BaseEditDialog: React.FC<BaseEditDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  isRTL = document.documentElement.lang === 'he',
  template = 'professional',
  size = 'default'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className={cn(
            "p-0 gap-0",
            size === 'default' ? "sm:max-w-[600px]" : "sm:max-w-[900px]",
            "bg-gradient-to-b from-white to-gray-50",
            "rounded-2xl shadow-xl border-0",
            "max-h-[80vh] overflow-y-auto",
            isRTL ? "rtl" : "ltr",
            template === 'professional' && "font-rubik",
            template === 'creative' && "font-heebo",
            template === 'general' && "font-opensans",
            template === 'classic' && "font-assistant",
          )}>
            <div className="p-6 border-b border-[#4856CD]/10">
              <DialogHeader>
                <DialogTitle className={cn(
                  "text-center text-2xl font-bold",
                  "bg-gradient-to-r from-[#4856CD] to-[#4856CD]/80 text-transparent bg-clip-text"
                )}>
                  {title}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6">
              {children}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 