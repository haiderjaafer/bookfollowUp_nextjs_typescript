'use client';

import { useEffect, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import {ar} from 'date-fns/locale/ar';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

registerLocale('ar', ar);

interface ArabicDatePickerProps {
  selected: string;
  onChange: (date: string) => void;
  label: string;
}

export default function ArabicDatePicker({
  selected,
  onChange,
  label,
}: ArabicDatePickerProps) {
  const [date, setDate] = useState<Date | null>(
    selected ? new Date(selected) : null
  );

 useEffect(() => {
  if (date) {
    const formatted = format(date, 'yyyy-MM-dd'); // Local format
    onChange(formatted);
  }
}, [date]);


  return (
    <div className="mb-4" dir="rtl">
      <label className="block text-sm font-extrabold text-gray-700 mb-2">{label}</label>
      <DatePicker
        selected={date}
        onChange={(date) => setDate(date as Date)}
        locale="ar"
        dateFormat="yyyy-MM-dd"
        placeholderText="اختر التاريخ"
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        calendarStartDay={6}
        // isClearable
        showPopperArrow={false}
        popperPlacement="bottom-end"
      />
    </div>
  );
}
