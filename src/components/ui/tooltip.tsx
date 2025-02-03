import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = TooltipPrimitive.Content;

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, side = 'top', align = 'center', ...props }, ref) => {
    return (
      <TooltipPrimitive.Root>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          ref={ref}
          side={side}
          align={align}
          className={cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95")}
          {...props}
        >
          {content}
        </TooltipContent>
      </TooltipPrimitive.Root>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent };