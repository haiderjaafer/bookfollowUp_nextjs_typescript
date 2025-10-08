'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { arSA } from 'date-fns/locale'; // Use arSA for Arabic day names
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import './ArabicDatePicker.css'; // custom override

registerLocale('ar', arSA);

const iraqiArabicMonths = [
  'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
  'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
];

interface ArabicDatePickerProps {
  selected: string;
  onChange: (date: string) => void;
  label?: string;
  allowEmpty?: boolean;
  disabled?: boolean; // Add disabled prop
}

export default function ArabicDatePicker({
  selected,
  onChange,
  allowEmpty = true,
  disabled = false, // Default to false
}: ArabicDatePickerProps) {
  const [date, setDate] = useState<Date | null>(null);
  
  const onChangeRef = useRef(onChange);
  const previousValueRef = useRef<string>('');
  const selectedRef = useRef<string>('');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (selected !== selectedRef.current) {
      selectedRef.current = selected;
      
      if (!selected || selected.trim() === '') {
        setDate(null);
      } else {
        try {
          const newDate = new Date(selected);
          if (!isNaN(newDate.getTime())) {
            setDate(newDate);
          } else {
            setDate(null);
          }
        } catch (error) {
          console.warn('Invalid date format:', selected);
          console.log(`${error}`);
          setDate(null);
        }
      }
    }
  }, [selected, allowEmpty]);

  useEffect(() => {
    const newValue = date ? format(date, 'yyyy-MM-dd') : '';
    
    if (newValue !== previousValueRef.current && newValue !== selectedRef.current) {
      previousValueRef.current = newValue;
      selectedRef.current = newValue;
      onChangeRef.current(newValue);
    }
  }, [date]);

  const handleDateChange = useCallback((newDate: Date | null) => {
    if (!disabled) {
      setDate(newDate);
    }
  }, [disabled]);

  return (
    <div className="mb-4" dir="rtl">
      <div className="relative">
        <DatePicker
          selected={date}
          onChange={handleDateChange}
          locale="ar"
          dateFormat="yyyy-MM-dd"
          placeholderText={disabled ? "" : "اختر التاريخ"}
          className={`w-full h-12 p-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
          }`}
          calendarStartDay={6}
          isClearable={!disabled}
          showPopperArrow={false}
          popperPlacement="bottom-end"
          disabled={disabled} // Pass disabled to DatePicker
          renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
            <div className="flex justify-between items-center px-2 py-1 bg-gray-100 text-sm font-bold text-gray-700">
              <button 
                type="button" 
                onClick={decreaseMonth} 
                className="px-2 py-1 hover:text-red-600"
                disabled={disabled}
              >
                ◀
              </button>
              <span>
                {iraqiArabicMonths[date.getMonth()]} {date.getFullYear()}
              </span>
              <button 
                type="button" 
                onClick={increaseMonth} 
                className="px-2 py-1 hover:text-green-600"
                disabled={disabled}
              >
                ▶
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}