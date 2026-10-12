"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DateRangePickerProps {
  date?: DateRange | undefined
  setDate?: (date: DateRange | undefined) => void
  onDateChange?: (date: DateRange | undefined) => void
  value?: any
  onChange?: (date: any) => void
  className?: string
}

export function DateRangePicker({
  date,
  setDate,
  onDateChange,
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const effectiveDate = date || value
  const handleSelect = (newDate: DateRange | undefined) => {
    if (setDate) setDate(newDate)
    if (onDateChange) onDateChange(newDate)
    if (onChange) onChange(newDate)
  }
  return (
    <div className={cn("grid gap-2", className)}>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !effectiveDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {effectiveDate?.from ? (
              effectiveDate.to ? (
                <>
                  {format(effectiveDate.from, "LLL dd, y")} -{" "}
                  {format(effectiveDate.to, "LLL dd, y")}
                </>
              ) : (
                format(effectiveDate.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select date range</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={effectiveDate?.from}
              selected={effectiveDate}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 