"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  value?: DateRange
  onChange?: (date: DateRange | undefined) => void
  date?: DateRange
  setDate?: (date: DateRange | undefined) => void
  onDateChange?: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  value,
  onChange,
  date,
  setDate,
  onDateChange,
}: DatePickerWithRangeProps) {
  const selectedValue = value || date
  const handleSelect = (range: DateRange | undefined) => {
    if (onChange) onChange(range)
    if (setDate) setDate(range)
    if (onDateChange) onDateChange(range)
  }
  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !selectedValue && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedValue?.from ? (
              selectedValue.to ? (
                <>
                  {format(selectedValue.from, "LLL dd, y")} -{" "}
                  {format(selectedValue.to, "LLL dd, y")}
                </>
              ) : (
                format(selectedValue.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedValue?.from}
            selected={selectedValue}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DatePickerWithRange as DateRangePicker };