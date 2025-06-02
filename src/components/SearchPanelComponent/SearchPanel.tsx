'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShowMoreFields from './ShowMoreFields';
import { AnimatePresence, motion } from 'framer-motion';
import BookNoCombobox from '../BookNoComboboxComponent';

import IncomingNoCombobox from '../IncomingNoComponent';
import DirectoryNameCombobox from '../DirectoryNameSearchComponent';




const SearchPanel = () => {
  const [showMore, setShowMore] = useState(false);
  const [selectedBookNo, setSelectedBookNo] = useState<string>("");
  const [selectedDirectoryName, setSelectedDirectoryName] = useState<string>("");

  const [selectedIncomingNo, setSelectedIncomingNo] = useState<string>("");

  return (
    <div className="bg-white rounded-xl shadow-2xl  p-6 font-arabic w-full max-w-7xl mx-auto text-right mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
    
    <div className='flex flex-col'>
      <label className='font-extrabold  text-gray-700'>رقم الكتاب</label>
       <BookNoCombobox
       
         value={selectedBookNo}
            onChange={(value) => setSelectedBookNo(value)}
            fetchUrl="http://127.0.0.1:8000/api/orders/getAllForComobox"
        
       />


    </div>
       
    


       <div className='flex flex-col'>
  <label
    htmlFor="bookSType"
    className="block font-extrabold text-gray-700 mb-1 text-right"
  >
    حالة الكتاب
  </label>
  <select
    id="bookStatus"
    name="bookStatus"
    // value={formData.bookStatus}
    // onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
    required
  >
    <option value="منجز">منجز</option>
    <option value="قيد الانجاز">قيد الانجاز</option>
  </select>
</div>







<div className='flex flex-col'>

  <label
                htmlFor="directoryName"
                className="block font-extrabold  text-gray-700 mb-1 text-right"
              >
                اسم الدائرة
              </label>

              <DirectoryNameCombobox 
                value={selectedDirectoryName}
            onChange={(value) => setSelectedDirectoryName(value)}
            fetchUrl="http://127.0.0.1:8000/api/orders/getAllForComobox"
        
              
              />

</div>


 <div className='flex flex-col'>
  <label htmlFor="bookSType" className="block font-extrabold text-gray-700 mb-1 text-right">
    نوع الكتاب
  </label>
  <select
    id="bookSType"
    name="bookSType"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
    required
  >
    <option value="خارجي">خارجي</option>
    <option value="داخلي">داخلي</option>
  </select>
</div>
     


       <div className='flex flex-col'>

    <label
                htmlFor="incomingNo"
                className="block font-extrabold text-gray-700  mb-1 text-right"
              >
                 رقم الوارد
              </label>

<IncomingNoCombobox

     
                value={selectedIncomingNo}
            onChange={(value) => setSelectedIncomingNo(value)}
            fetchUrl="http://127.0.0.1:8000/api/orders/getAllForComobox"
      
/>



 </div>






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