import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { DayPickerSingleProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { he } from "date-fns/locale"
import { format } from "date-fns"

export type CalendarProps = Omit<DayPickerSingleProps, "mode"> & {
  mode?: "single"
  className?: string
  classNames?: Record<string, string>
  showOutsideDays?: boolean
  initialFocus?: boolean
  captionLayout?: "dropdown" | "dropdown-months"
  fromYear?: number
  toYear?: number
  month?: Date
  toMonth?: Date
  fromMonth?: Date
  locale?: any
  onMonthChange?: (date: Date) => void
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = he,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      mode="single"
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      locale={locale}
      formatters={{
        formatCaption: (date) => {
          return format(date, 'MMMM yyyy', { locale });
        }
      }}
      classNames={{
        root: "w-full bg-white",
        months: "flex flex-col",
        month: "space-y-3",
        caption: "relative flex w-full h-14 items-center justify-between px-4 bg-gray-50/50",
        caption_dropdowns: "flex gap-2 items-center",
        caption_label: "text-base font-medium text-[#4856CD]",
        dropdown: cn(
          "appearance-none outline-none inline-flex items-center justify-center",
          "rounded-lg px-3 py-2 text-sm font-medium",
          "bg-white border border-gray-200",
          "text-[#4856CD]",
          "hover:bg-[#4856CD]/5 hover:border-[#4856CD]/30",
          "focus:border-[#4856CD] focus:ring-2 focus:ring-[#4856CD]/10",
          "transition-all duration-200"
        ),
        dropdown_month: "min-w-[120px]",
        dropdown_year: "min-w-[100px]",
        nav: "flex items-center gap-1",
        nav_button: cn(
          "h-9 w-9 bg-transparent p-0",
          "flex items-center justify-center rounded-lg",
          "text-gray-500 hover:text-[#4856CD]",
          "hover:bg-[#4856CD]/5",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500"
        ),
        nav_button_previous: "absolute left-4",
        nav_button_next: "absolute right-4",
        table: "hidden",
        head_row: "hidden",
        head_cell: "hidden",
        row: "hidden",
        cell: "hidden",
        day: "hidden",
        day_selected: "hidden",
        day_today: "hidden",
        day_outside: "hidden",
        day_disabled: "hidden",
        day_range_middle: "hidden",
        day_hidden: "hidden",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 