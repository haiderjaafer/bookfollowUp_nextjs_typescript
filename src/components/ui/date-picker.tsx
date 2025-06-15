"use client";

import * as React from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface DatePickerProps {
  startYear?: number;
  endYear?: number;
  onDateChange?: (date: Date) => void;
  initialDate?: Date;
}

export function DatePicker({
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  onDateChange,
  initialDate,
}: DatePickerProps) {
  // CHANGED: Initialize date with initialDate or new Date(), and track if initialized
  const [date, setDate] = React.useState<Date>(initialDate || new Date());
  const [isOpen, setIsOpen] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // CHANGED: Update date when initialDate changes, but only if not already initialized
  React.useEffect(() => {
    if (initialDate && !isInitialized) {
      setDate(initialDate);
      setIsInitialized(true);
    }
  }, [initialDate, isInitialized]);

  // Arabic month names for RTL support
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  // CHANGED: Removed onDateChange from useEffect to prevent premature calls
  // onDateChange is now only called in handleSelect

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(date, months.indexOf(month));
    setDate(newDate);
    onDateChange?.(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(date, parseInt(year));
    setDate(newDate);
    onDateChange?.(newDate);
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setIsOpen(false);
      onDateChange?.(selectedDate);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-end text-right font-arabic",
            !date && "text-muted-foreground"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {date ? format(date, "yyyy-MM-dd") : <span>اختر تاريخاً</span>}
          <CalendarIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 font-arabic" dir="rtl">
        <div className="flex justify-between p-2">
          <Select onValueChange={handleMonthChange} value={months[getMonth(date)]}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="الشهر" />
            </SelectTrigger>
            <SelectContent className="font-arabic">
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  <div className="font-arabic">{month}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleYearChange} value={getYear(date).toString()}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="السنة" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => handleSelect(day)}
          initialFocus
          month={date}
          onMonthChange={setDate}
          dir="rtl"
          className="text-lg text-black font-serif font-extrabold"
        />
      </PopoverContent>
    </Popover>
  );
}