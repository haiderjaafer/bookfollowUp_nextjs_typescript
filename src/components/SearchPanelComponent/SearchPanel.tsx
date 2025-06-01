'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShowMoreFields from './ShowMoreFields';
import { AnimatePresence, motion } from 'framer-motion';

const SearchPanel = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-2xl  p-6 font-arabic w-full max-w-7xl mx-auto text-right mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Field label="رقم الموظف" name="empNo" />
        <Field label="الموظف" name="employee" />
        <Field label="الجهة" name="department" />
        <Field label="القسم" name="section" />
        <Field label="الفرعة" name="branch" />
        <Field label="الوحدة" name="unit" />
      </div>

      

<div className="mt-4 flex justify-start">
  <button
    onClick={() => setShowMore(!showMore)}
    className="text-sm text-gray-600 font-extrabold hover:text-blue-600  cursor-pointer transition-colors duration-200"
  >
    {showMore ? 'إخفاء' : 'المزيد'} ▼
  </button>
</div>

<AnimatePresence>
  {showMore && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <ShowMoreFields />
    </motion.div>
  )}
</AnimatePresence>




    </div>
  );
};

const Field = ({ label, name }: { label: string; name: string }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-semibold text-gray-700">
      {label}
    </label>
    <input
      id={name}
      name={name}
      placeholder={label}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold"
    />
  </div>
);

export default SearchPanel;