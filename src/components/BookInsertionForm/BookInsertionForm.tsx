'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DatePicker } from '../ui/date-picker';
import DirectoryNameInput from '../directoryName/directoryNameInput';
import SubjectInput from '../subject/subjectInput';
import DestinationInput from '../destination/destinationInput';
import { BookInsertionType } from '../../../bookInsertionType';
import { toast } from 'react-toastify';
import DropzoneComponent from '../ReactDropZoneComponont';
import axios from 'axios';
import debounce from 'debounce'; // Import debounce
import DirectoryNameCombobox from './DirectoryNameComboboxAutoComplete';
import SubjectAutoCompleteComboBox from './SubjectAutoComplete';
import ArabicDatePicker from '../ArabicDatePicker';
import DestinationAutoComplete from './DestinationAutoComplete';

import BookActionInput from './bookActionDialogInput/bookActionInput';


// Define animation variants for Framer Motion
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const inputVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function BookInsertionForm() {

  
// Memoize API base URL
  const API_BASE_URL = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || '', []);



  // State for the selected PDF file from DropzoneComponent
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State for form fields
  const [formData, setFormData] = useState<BookInsertionType>({
    bookType: '',
    bookNo: '',
    bookDate: format(new Date(), 'yyyy-MM-dd'), // Default to current date
    directoryName: '',
    incomingNo: '',
    incomingDate: format(new Date(), 'yyyy-MM-dd'), // Default to current date
    subject: '',
    destination: '',
    bookAction: '',
    bookStatus: '',
    notes: '',
    userID: '1', // Default userID (adjust based on auth context if needed)
  });
  // State for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for book existence validation
  const [bookExists, setBookExists] = useState<boolean | null>(null);

  // Function to check if book exists (will be debounced)
  const checkBookExists = useCallback(
    async (bookType: string, bookNo: string, bookDate: string) => {
      if (!bookType || !bookNo || !bookDate) return; // Skip if any field is empty
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/checkBookNoExistsForDebounce`,
          { params: { bookType, bookNo, bookDate } }
        );
        setBookExists(response.data.exists);
        if (response.data.exists) {
          toast.warning('رقم الكتاب موجود بالفعل لهذا العام');
        }
      } catch (error) {
        console.error('Error checking book existence:', error);
        setBookExists(false); // Assume non-existent on error to avoid blocking user
      }
    },
    []
  );

  // Create debounced version of checkBookExists (500ms delay)
  const debouncedCheckBookExists = useCallback(
    debounce(checkBookExists, 500),
    [checkBookExists]
  );

  // Monitor bookNo, bookType, and bookDate changes to trigger debounced check
  useEffect(() => {
    if (formData.bookNo && formData.bookType && formData.bookDate) {
      debouncedCheckBookExists(
        formData.bookType,
        formData.bookNo,
        formData.bookDate
      );
    } else {
      setBookExists(null); // Reset existence state if fields are incomplete
    }
    // Cleanup debounce on unmount
    return () => {
      debouncedCheckBookExists.clear();
    };
  }, [formData.bookNo, formData.bookType, formData.bookDate, debouncedCheckBookExists]);

  // Handle text input and select changes
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // Handle bookDate selection
  const handleChangeBookDate = useCallback((date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setFormData((prev) => ({
      ...prev,
      bookDate: formattedDate,
    }));
  }, []);

  // Handle incomingDate selection
  const handleChangeIncomingDate = useCallback((date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setFormData((prev) => ({
      ...prev,
      incomingDate: formattedDate,
    }));
  }, []);

  // Handle file acceptance from DropzoneComponent
  const handleFilesAccepted = useCallback((files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      toast.info(`File ${files[0].name} selected`);
    }
  }, []);

  // Handle file removal from DropzoneComponent
  const handleFileRemoved = useCallback((fileName: string) => {
    setSelectedFile(null);
    toast.info(`File ${fileName} removed`);
  }, []);

  // Handle form submission to FastAPI endpoint
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validate required fields
      const requiredFields = [
        'bookNo',
        'bookType',
        'bookDate',
        'directoryName',
        'subject',
        'destination',
        'bookAction',
        'bookStatus',
        'userID',
      ];
      for (const field of requiredFields) {
        if (!formData[field as keyof BookInsertionType]) {
          toast.error(`يرجى ملء حقل ${field}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Validate file
      if (!selectedFile) {
        toast.error('يرجى تحميل ملف PDF');
        setIsSubmitting(false);
        return;
      }

      // Optional: Warn if book exists before submitting
      // if (bookExists) {
      //   toast.warning('تحذير: رقم الكتاب موجود بالفعل. هل تريد المتابعة؟');
      //   // Proceed with submission despite warning
      // }

      // Create FormData object for multipart/form-data submission
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append('file', selectedFile);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 200) {
          toast.success('تم حفظ الكتاب وملف PDF بنجاح!');
          setFormData({
            bookType: '',
            bookNo: '',
            bookDate: format(new Date(), 'yyyy-MM-dd'),
            directoryName: '',
            incomingNo: '',
            incomingDate: format(new Date(), 'yyyy-MM-dd'),
            subject: '',
            destination: '',
            bookAction: '',
            bookStatus: '',
            notes: '',
            userID: '1',
          });
          setSelectedFile(null);
          setBookExists(null); // Reset existence state
        } else {
          throw new Error('Failed to add book');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('فشل في إرسال النموذج. يرجى المحاولة مرة أخرى');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, selectedFile, bookExists]
  );

 const handleDateChange = useCallback(
  (key: "bookDate" | "incomingDate", value: string) => {
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      toast.error("يرجى إدخال التاريخ بصيغة YYYY-MM-DD");
      return;
    }
    setFormData((prev) => ({ ...prev, [key]: value }));
  },
  []
);
  

  // JSX remains unchanged, but ensure bookNo input uses handleChange
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-sky-50/50 py-4 sm:py-6 md:py-8 lg:py-12"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-sky-100/50">
        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl font-bold font-arabic text-center text-sky-600 mb-6 sm:mb-8">
          إضافة كتاب جديد
        </h1>
        <form  onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 align-middle">
            {/* Book Type */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookType"
                className="block text-sm  font-san font-extrabold text-gray-700 mb-1 lg:text-right text-center "
              >
                نوع الكتاب
              </label>
              <select
                id="bookType"
                name="bookType"
                value={formData.bookType}
                onChange={handleChange}
                className="w-full h-12 px-4 py-2 border border-gray-300 font-extrabold rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              >
                <option className='font-extrabold' value="">اختر نوع الكتاب</option>
                <option className='font-extrabold' value="خارجي">خارجي</option>
                <option className='font-extrabold' value="داخلي">داخلي</option>
                <option className='font-extrabold' value="فاكس">فاكس</option>
              </select>
            </motion.div>

             {/* Book Date */}
            <motion.div variants={inputVariants} className="text-center ">
              <label
                htmlFor="bookDate"
                className="block text-sm  font-sans font-extrabold text-gray-700 mb-1  lg:text-center text-center "
              >
                تاريخ الكتاب
              </label>
              {/* <DatePicker onDateChange={handleChangeBookDate} /> */}
              <ArabicDatePicker
                selected={formData.bookDate}
                onChange={(value) => handleDateChange('bookDate', value)}
                label="تأريخ الكتاب"
              />
            </motion.div>


            {/* Book Number */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookNo"
                className="block text-sm  font-san font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                رقم الكتاب
              </label>
              <input
                id="bookNo"
                name="bookNo"
                type="text"
                value={formData.bookNo}
                onChange={handleChange}
                placeholder='رقم الكتاب'
                className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              />
            </motion.div>

           
            {/* Directory Name */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">

<div className="flex flex-col">
                       <label className="font-extrabold text-gray-700 lg:text-right text-center">اسم الدائرة</label>

              <DirectoryNameCombobox
  value={formData.directoryName}
  onChange={(val) => setFormData((prev) => ({ ...prev, directoryName: val }))}
  fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getAllDirectoryNames`}
/>

             
          </div>    
              {/* <div className="flex flex-col">
                       <label className="font-extrabold text-gray-700">اسم الدائرة</label>
                       <DirectoryNameCombobox
  value={formData.directoryName}
  onChange={(val) => setFormData((prev) => ({ ...prev, directoryName: val }))}
  fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getAllDirectoryNames`}
/>

                     </div> */}
             
             
             
              {/* <label
                htmlFor="directoryName"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                اسم الدائرة
              </label>
              <DirectoryNameInput formData={formData} setFormData={setFormData} /> */}
            </motion.div>

            {/* Incoming Number */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="incomingNo"
                className="block text-sm font-extrabold font-san  text-gray-700 mb-1 lg:text-right text-center"
              >
                رقم الوارد
              </label>
              <input
                id="incomingNo"
                name="incomingNo"
                type="text"
                value={formData.incomingNo}
                onChange={handleChange}
                placeholder='رقم الوارد'
                className="w-full px-4 py-2 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
              />
            </motion.div>

            {/* Incoming Date */}
            <motion.div variants={inputVariants} className='text-center'>
              <label
                htmlFor="incomingDate"
                className="block text-sm font-extrabold  font-arabic text-gray-700 mb-1 lg:text-center   text-center"
              >
                تاريخ الوارد
              </label>
              {/* <DatePicker onDateChange={handleChangeIncomingDate} /> */}

                  <ArabicDatePicker
                selected={formData.incomingDate}
                onChange={(value) => handleDateChange('incomingDate', value)}
                label="تأريخ الوارد"
              />
            </motion.div>

            {/* Subject */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="subject"
                className="block text-sm font-extrabold font-san text-gray-700 mb-1 lg:text-right text-center"
              >
                الموضوع
              </label>

             <SubjectAutoCompleteComboBox
  value={formData.subject}
  onChange={(val) => setFormData((prev) => ({ ...prev, subject: val }))}
  fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getSubjects`}
/>

              {/* <SubjectInput formData={formData} setFormData={setFormData} /> */}
            </motion.div>

            {/* Destination */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-3">
              <label
                htmlFor="destination"
                className="block text-sm font-extrabold font-san text-gray-700 mb-1 lg:text-right text-center"
              >
                جهة تحويل البريد
              </label>

                           <DestinationAutoComplete
  value={formData.destination}
  onChange={(val) => setFormData((prev) => ({ ...prev, destination: val }))}
  fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getDestination`}
/>
              {/* <DestinationInput formData={formData} setFormData={setFormData} /> */}

            </motion.div>

            {/* Book Action */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="bookAction"
                className="block text-sm font-extrabold font-san text-gray-700 mb-1 lg:text-right text-center"
              >
                إجراء الكتاب
              </label>
< BookActionInput formData={formData} setFormData={setFormData}/>

              {/* <input
                id="bookAction"
                name="bookAction"
                type="text"
                value={formData.bookAction}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              /> */}
            </motion.div>

            {/* Book Status */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookStatus"
                className="block text-sm font-extrabold font-san text-gray-700 mb-1 lg:text-right text-center"
              >
                حالة الكتاب
              </label>
              <select
                id="bookStatus"
                name="bookStatus"
                value={formData.bookStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-extrabold focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              >
                <option  value="">اختر حالة الكتاب</option>
                <option className='font-extrabold' value="منجز">منجز</option>
                <option className='font-extrabold' value="قيد الانجاز">قيد الانجاز</option>
                <option className='font-extrabold' value="مداولة">مداولة</option>
              </select>
            </motion.div>

            {/* Notes */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-3">
              <label
                htmlFor="notes"
                className="block text-sm font-extrabold font-san text-gray-700 mb-1 lg:text-right text-center"
              >
                ملاحظات
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder='الملاحظات '
                className="w-full px-4 py-2 border placeholder:text-center  placeholder:font-extrabold placeholder:text-gray-300 placeholder:italic border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 font-arabic text-right resize-y"
                rows={4}
              />
            </motion.div>
          </div>

          {/* Dropzone for PDF Upload */}
          <motion.div variants={inputVariants} className="mt-6">
            <label className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right">
              تحميل ملف PDF
            </label>
            <DropzoneComponent
              onFilesAccepted={handleFilesAccepted}
              onFileRemoved={handleFileRemoved}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            className="flex justify-center mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-2 bg-sky-600 hover:bg-sky-700 text-white font-arabic font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'إضافة الكتاب'}
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}