'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { BookInsertionType } from '../../utiles/bookInsertionType';
import { toast } from 'react-toastify';
import DropzoneComponent, { DropzoneComponentRef } from '../ReactDropZoneComponont';
import axios from 'axios';
import DirectoryNameCombobox from './DirectoryNameComboboxAutoComplete';
import SubjectAutoCompleteComboBox from './SubjectAutoComplete';
import ArabicDatePicker from '../DatePicker/ArabicDatePicker';
import BookActionInput from './bookActionDialogInput/bookActionInput';
import { JWTPayload } from '@/utiles/verifyToken';
import CommitteeSelect from '../Company_Structure/CommitteeSelect';
import MultiSelectDepartments from '../Company_Structure/DepartmentSelect';
import { QueryKey, useQueryClient } from '@tanstack/react-query';

// Animation variants
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

interface BookInsertionFormProps {
  payload: JWTPayload;
  id: string | number;
}

export default function BookInsertionForm({ payload }: BookInsertionFormProps) {
  const queryClient = useQueryClient();
  const dropzoneRef = useRef<DropzoneComponentRef>(null);
  
  const userID = payload.id?.toString() || '';
  const API_BASE_URL = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || '', []);

  const [selectedCommittee, setSelectedCommittee] = useState<number | undefined>(undefined);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);

  // State for form fields
  const [formData, setFormData] = useState<BookInsertionType>({
    bookType: '',
    bookNo: '',
    bookDate: format(new Date(), 'yyyy-MM-dd'),
    directoryName: '',
    selectedCommittee: undefined,
    deIDs: [],
    incomingNo: '',
    incomingDate: format(new Date(), 'yyyy-MM-dd'),
    subject: '',
    bookAction: '',
    bookStatus: '',
    notes: '',
    userID: userID,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if book type is SECRET
  const isSecretBook = formData.bookType === 'سري';

  // Handle committee change
  const handleCommitteeChange = useCallback(
    (coID: number | undefined) => {
      setSelectedCommittee(coID);
      setSelectedDepartments([]);
      setFormData((prev) => ({
        ...prev,
        selectedCommittee: coID,
        deIDs: [],
      }));
      if (coID) {
        queryClient.invalidateQueries({ queryKey: ['departments', coID] as QueryKey });
      }
    },
    [queryClient]
  );

  // Handle departments change
  const handleDepartmentsChange = useCallback((deIDs: number[]) => {
    setSelectedDepartments(deIDs);
    setFormData((prev) => ({
      ...prev,
      deIDs: deIDs,
    }));
  }, []);

  // Check if book exists
  const checkBookExists = useCallback(
    async (bookType: string, bookNo: string, bookDate: string) => {
      if (!bookType || !bookNo || !bookDate) return;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/bookFollowUp/checkBookNoExistsForDebounce`,
          { params: { bookType, bookNo, bookDate } }
        );
        
        if (response.data.exists) {
          toast.warning('رقم الكتاب موجود بالفعل لهذا العام');
        }
      } catch (error) {
        console.error('Error checking book existence:', error);
      }
    },
    [API_BASE_URL]
  );

  const debouncedCheckBookExistsRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debouncedCheckBookExistsRef.current) {
      clearTimeout(debouncedCheckBookExistsRef.current);
    }

    if (formData.bookNo && formData.bookType && formData.bookDate) {
      debouncedCheckBookExistsRef.current = setTimeout(() => {
        checkBookExists(formData.bookType, formData.bookNo, formData.bookDate);
      }, 500);
    }
    
    return () => {
      if (debouncedCheckBookExistsRef.current) {
        clearTimeout(debouncedCheckBookExistsRef.current);
      }
    };
  }, [formData.bookNo, formData.bookType, formData.bookDate, checkBookExists]);

  // Clear incomingDate when bookType changes to SECRET
  useEffect(() => {
    if (isSecretBook) {
      setFormData((prev) => ({
        ...prev,
        incomingDate: '',
      }));
    }
  }, [isSecretBook]);

  // Handle text input and select changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // Handle date changes
  const handleDateChange = useCallback(
    (key: 'bookDate' | 'incomingDate', value: string) => {
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        toast.error('يرجى إدخال التاريخ بصيغة YYYY-MM-DD');
        return;
      }
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Handle file acceptance
  const handleFilesAccepted = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        toast.error('يرجى تحميل ملف PDF صالح');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الملف يتجاوز 10 ميجابايت');
        return;
      }
      setSelectedFile(file);
      toast.info(`تم اختيار الملف ${file.name}`);
    }
  }, []);

  const handleFileRemoved = useCallback((fileName: string) => {
    setSelectedFile(null);
    toast.info(`تم إزالة الملف ${fileName}`);
  }, []);

  const handleBookPdfLoaded = useCallback((success: boolean, file?: File) => {
    if (success && file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validate required fields
      const requiredFields: (keyof BookInsertionType)[] = [
        'bookNo',
        'bookType',
        'bookDate',
        'directoryName',
        'subject',
        'bookAction',
        'bookStatus',
        'userID',
        'deIDs'
      ];

      const fieldLabels: Record<keyof BookInsertionType, string> = {
        bookNo: 'رقم الكتاب',
        bookType: 'نوع الكتاب',
        bookDate: 'تاريخ الكتاب',
        directoryName: 'اسم الدائرة',
        subject: 'الموضوع',
        bookAction: 'الإجراء',
        bookStatus: 'حالة الكتاب',
        userID: 'المستخدم',
        incomingNo: 'رقم الوارد',
        notes: 'الملاحظات',
        incomingDate: 'تاريخ الوارد',
        selectedCommittee: 'اللجنة',
        deIDs: 'الأقسام',
      };

      for (const field of requiredFields) {
        if (field === 'deIDs') {
          if (!formData[field] || formData[field].length === 0) {
            toast.error('يرجى اختيار قسم واحد على الأقل');
            setIsSubmitting(false);
            return;
          }
        } else if (!formData[field]) {
          const label = fieldLabels[field] || field;
          toast.error(`يرجى ملء حقل ${label}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Validate incomingDate for non-secret books
      if (!isSecretBook && !formData.incomingDate) {
        toast.error('يرجى ملء حقل تاريخ الوارد');
        setIsSubmitting(false);
        return;
      }

      if (!selectedFile) {
        toast.error('يرجى تحميل ملف PDF');
        setIsSubmitting(false);
        return;
      }

      // Create FormData for submission
      const formDataToSend = new FormData();
      
      // In handleSubmit, update FormData creation:
Object.entries(formData).forEach(([key, value]) => {
  if (key === 'selectedCommittee') {
    formDataToSend.append('coID', value.toString());
  } else if (key === 'deIDs') {
    formDataToSend.append('deIDs', (value as number[]).join(','));
  } else if (key === 'incomingNo' || key === 'incomingDate') {
    // Only append if NOT a secret book and value exists
    if (!isSecretBook && value) {
      formDataToSend.append(key, value.toString());
    }
  } else if (key === 'userID') {
    formDataToSend.append('userID', value.toString());
  } else if (value !== undefined && value !== null) {
    formDataToSend.append(key, value.toString());
  }
});

      formDataToSend.append('file', selectedFile);
      formDataToSend.append('username', payload.username);

      console.log('Submitting book type:', formData.bookType);
      console.log('Is secret book:', isSecretBook);
      console.log('IncomingDate will be sent:', !isSecretBook && formData.incomingDate);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/bookFollowUp`,
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
            selectedCommittee: undefined,
            deIDs: [],
            incomingNo: '',
            incomingDate: format(new Date(), 'yyyy-MM-dd'),
            subject: '',
            bookAction: '',
            bookStatus: '',
            notes: '',
            userID: userID,
          });
          setSelectedFile(null);
          setSelectedDepartments([]);
          setSelectedCommittee(undefined);
          dropzoneRef.current?.reset(true);
        } else {
          throw new Error('Failed to add book');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('فشل في إرسال البيانات. يرجى المحاولة مرة أخرى');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, selectedFile, userID, API_BASE_URL, payload.username, isSecretBook]
  );

  if (!userID) {
    return <div>Error: Invalid user data...{userID}</div>;
  }

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
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 align-middle">
            {/* Book Type */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookType"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                نوع الكتاب
              </label>
              <select
                id="bookType"
                name="bookType"
                value={formData.bookType}
                onChange={handleChange}
                className="w-full h-12 px-4 py-2 border text-sm font-extrabold border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              >
                <option className='text-sm font-extrabold' value="">اختر نوع الكتاب</option>
                <option className='text-sm font-extrabold' value="خارجي">خارجي</option>
                <option className='text-sm font-extrabold' value="داخلي">داخلي</option>
                <option className='text-sm font-extrabold' value="فاكس">فاكس</option>
                <option className='text-sm font-extrabold' value="سري">سري</option>
              </select>
            </motion.div>

            {/* Book Date */}
            <motion.div variants={inputVariants} className="text-center">
              <label
                htmlFor="bookDate"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-center text-center"
              >
                تاريخ الكتاب
              </label>
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
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                رقم الكتاب
              </label>
              <input
                id="bookNo"
                name="bookNo"
                type="text"
                value={formData.bookNo}
                onChange={handleChange}
                placeholder="رقم الكتاب"
                className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              />
            </motion.div>

            {/* Directory Name */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center">
                اسم الدائرة
              </label>
              <DirectoryNameCombobox
                value={formData.directoryName}
                onChange={(val) => setFormData((prev) => ({ ...prev, directoryName: val }))}
                fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getAllDirectoryNames`}
              />
            </motion.div>

      {/* Incoming Number - Disabled if SECRET */}
<motion.div variants={inputVariants}>
  <label
    htmlFor="incomingNo"
    className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
  >
    رقم الوارد {isSecretBook && <span className="text-red-500 text-xs">(غير مطلوب للسري)</span>}
  </label>
  <input
    id="incomingNo"
    name="incomingNo"
    type="text"
    value={isSecretBook ? '' : formData.incomingNo}
    onChange={handleChange}
    placeholder={isSecretBook ? '' : 'رقم الوارد'}
    disabled={isSecretBook}
    className={`w-full h-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right ${
      isSecretBook ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
    }`}
  />
</motion.div>

            {/* Incoming Date - Disabled and Empty if SECRET */}
            <motion.div variants={inputVariants} className="text-center">
              <label
                htmlFor="incomingDate"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-center text-center"
              >
                تاريخ الوارد {isSecretBook && <span className="text-red-500 text-xs">(غير مطلوب للسري)</span>}
              </label>
              <ArabicDatePicker
                selected={isSecretBook ? '' : formData.incomingDate}
                onChange={(value) => handleDateChange('incomingDate', value)}
                label="تأريخ الوارد"
                disabled={isSecretBook}
              />
            </motion.div>

            {/* Subject */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="subject"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                الموضوع
              </label>
              <SubjectAutoCompleteComboBox
                value={formData.subject}
                onChange={(val) => setFormData((prev) => ({ ...prev, subject: val }))}
                fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getSubjects`}
              />
            </motion.div>

            {/* Committee */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="destination"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                الهيأة
              </label>
              <CommitteeSelect
                value={selectedCommittee}
                onChange={handleCommitteeChange}
                className="w-full"
                comName={null}
              />
            </motion.div>

            {/* Departments */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="destination"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                القسم
              </label>
              <MultiSelectDepartments
                coID={selectedCommittee}
                value={selectedDepartments}
                onChange={handleDepartmentsChange}
                className="w-full"
              />
            </motion.div>

            {/* Book Action */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="bookAction"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                إجراء الكتاب
              </label>
              <BookActionInput formData={formData} setFormData={setFormData} />
            </motion.div>

            {/* Book Status */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookStatus"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                حالة الكتاب
              </label>
              <select
                id="bookStatus"
                name="bookStatus"
                value={formData.bookStatus}
                onChange={handleChange}
                className="w-full h-12 px-4 py-2 border text-sm font-extrabold border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              >
                <option className='text-sm font-extrabold' value="">اختر حالة الكتاب</option>
                <option className='text-sm font-extrabold' value="منجز">منجز</option>
                <option className='text-sm font-extrabold' value="قيد الانجاز">قيد الانجاز</option>
                <option className='text-sm font-extrabold' value="مداولة">مداولة</option>
              </select>
            </motion.div>

            {/* Notes */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-3">
              <label
                htmlFor="notes"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                ملاحظات
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="الملاحظات"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right resize-y"
                rows={4}
              />
            </motion.div>
          </div>

          {/* Dropzone for PDF Upload */}
          <motion.div variants={inputVariants} className="mt-6">
            <label className="block text-sm font-extrabold text-gray-700 mb-1 text-right">
              تحميل ملف PDF
            </label>
            <DropzoneComponent
              ref={dropzoneRef}
              onFilesAccepted={handleFilesAccepted}
              onFileRemoved={handleFileRemoved}
              onBookPdfLoaded={handleBookPdfLoaded}
              username={payload.username}
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