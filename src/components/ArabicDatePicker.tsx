

'use client';

import { useEffect, useState } from 'react';
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
  label: string;
}

export default function ArabicDatePicker({
  selected,
  onChange,
  label ,
}: ArabicDatePickerProps) {
  const [date, setDate] = useState<Date | null>(
    selected ? new Date(selected) : null
  );

    useEffect(() => {
    if (date) {
      const formatted = format(date, 'yyyy-MM-dd');
      onChange(formatted);
    } else {
      onChange(''); // Clear date
    }
  }, [date]);

  return (
    <div className="mb-4" dir="rtl">
      {/* <label className="block text-sm font-extrabold text-gray-700 mb-1 ">{label}</label> */}
      <div className="relative ">
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date as Date)}
          locale="ar"
          dateFormat="yyyy-MM-dd"
          placeholderText="اختر التاريخ"
          className="w-full h-12 p-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          calendarStartDay={6}
          isClearable
          showPopperArrow={false}
          popperPlacement="bottom-end"
          renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
            <div className="flex justify-between items-center px-2 py-1 bg-gray-100 text-sm font-bold text-gray-700">
              <button type="button" onClick={decreaseMonth} className="px-2 py-1 hover:text-red-600">
                ◀
              </button>
              <span>
                {iraqiArabicMonths[date.getMonth()]} {date.getFullYear()}
              </span>
              <button type="button" onClick={increaseMonth} className="px-2 py-1 hover:text-green-600">
                ▶
              </button>
            </div>
          )}
        />

        
      </div>
    </div>
  );
}







