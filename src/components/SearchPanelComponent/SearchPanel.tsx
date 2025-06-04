'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ShowMoreFields from './ShowMoreFields';
import { AnimatePresence, motion } from 'framer-motion';
import BookNoCombobox from '../BookNoComboboxComponent';
import IncomingNoCombobox from '../IncomingNoComponent';
import DirectoryNameCombobox from '../DirectoryNameSearchComponent';
import RotatingCoin from '../Rotate';
import { Search } from "lucide-react";

const SearchPanel = () => {
  const [showMore, setShowMore] = useState(false);

  const [selectedBookNo, setSelectedBookNo] = useState<string>('');
  const [selectedDirectoryName, setSelectedDirectoryName] = useState<string>('');
  const [selectedIncomingNo, setSelectedIncomingNo] = useState<string>('');
  const [bookType, setBookType] = useState('');
  const [bookStatus, setBookStatus] = useState('');

  const resetAll = () => {
    setSelectedBookNo('');
    setSelectedDirectoryName('');
    setSelectedIncomingNo('');
    setBookType('');
    setBookStatus('');
  };

  const handleSelect = (field: string, value: string) => {

      console.log("value in parent" + value)

    resetAll();
    switch (field) {
      case 'bookNo':
        setSelectedBookNo(value);
        break;
      case 'directoryName':
        setSelectedDirectoryName(value);
        break;
      case 'incomingNo':
        setSelectedIncomingNo(value);
        break;
      case 'bookType':
        setBookType(value);
        break;
      case 'bookStatus':
        setBookStatus(value);
        break;
    }
  };

  const handleSearch = () => {
    if (selectedBookNo)
      return console.log({ searchBy: 'bookNo', value: selectedBookNo });

    if (selectedDirectoryName)
      return console.log({ searchBy: 'directoryName', value: selectedDirectoryName });

    if (selectedIncomingNo)
      return console.log({ searchBy: 'incomingNo', value: selectedIncomingNo });

    if (bookType)
      return console.log({ searchBy: 'bookType', value: bookType });

    if (bookStatus)
      return console.log({ searchBy: 'bookStatus', value: bookStatus });

    console.log('لم يتم اختيار أي معيار بحث');
  };



  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 font-arabic w-full max-w-7xl mx-auto text-right mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        
        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">رقم الكتاب</label>
          <BookNoCombobox
            value={selectedBookNo}
            onChange={(value) => handleSelect('bookNo', value)}
            
            fetchUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/getAllBooksNo`}  
            
          />
        </div>

        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">حالة الكتاب</label>
          <select
            value={bookStatus}
            onChange={(e) => handleSelect('bookStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-arabic text-right"
          >
            <option value="">-- اختر الحالة --</option>
            <option value="منجز">منجز</option>
            <option value="قيد الانجاز">قيد الانجاز</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">اسم الدائرة</label>
        <DirectoryNameCombobox
  value={selectedDirectoryName}
  onChange={(value) => handleSelect('directoryName', value)}
  fetchUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/getAllDirectoryNames`}   
  
/>

        </div>

        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">نوع الكتاب</label>
          <select
            value={bookType}
            onChange={(e) => handleSelect('bookType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-arabic text-right"
          >
            <option value="">-- اختر النوع --</option>
            <option value="خارجي">خارجي</option>
            <option value="داخلي">داخلي</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">رقم الوارد</label>
          <IncomingNoCombobox
            value={selectedIncomingNo}
            onChange={(value) => handleSelect('incomingNo', value)}
           
            fetchUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/getAllIncomingNo`}
          />
        </div>
      </div>

 
   <div className="w-ful flex justify-center mt-4 sm:mt-0">
    
      <Button className="bg-sky-600 hover:bg-sky-700 w-full sm:w-[120px] font-extrabold" onClick={handleSearch}
>
        <span className='flex items-center '><Search className='ml-2 ' />  بحث </span>
      </Button>
    </div>

   {/* <RotatingCoin/> */}



    </div>
  );
};

export default SearchPanel;
