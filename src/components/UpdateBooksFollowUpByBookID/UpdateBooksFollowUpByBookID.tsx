'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import DropzoneComponent, { DropzoneComponentRef } from '../ReactDropZoneComponont';
import axios from 'axios';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { FileText, BookOpen, Eye } from 'lucide-react';
import DirectoryNameCombobox from '../BookInsertionForm/DirectoryNameComboboxAutoComplete';
import ArabicDatePicker from '../DatePicker/ArabicDatePicker';
import BookActionInput from '../BookInsertionForm/bookActionDialogInput/bookActionInput';
import SubjectAutoCompleteComboBox from '../BookInsertionForm/SubjectAutoComplete';
import { JWTPayload } from '@/utiles/verifyToken';
import CommitteeSelect from '../Company_Structure/CommitteeSelect';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import MultiSelectDepartments from '../Company_Structure/DepartmentSelect';


// Updated BookInsertionType interface for multi-department support
export interface BookInsertionType {
  bookType: string;
  bookNo: string;
  bookDate: string;
  directoryName: string;
  selectedCommittee: number | undefined;
  deIDs: number[]; // Changed from deID to deIDs array
  incomingNo: string;
  incomingDate: string;
  subject: string;
  bookAction: string;
  bookStatus: string;
  notes: string;
  userID: string;
}

// Define the response type based on the FastAPI model
interface PDFResponse {
  id: number;
  bookNo: string | null;
  pdf: string | null;
  currentDate: string | null;
  username: string | null;
}

interface DepartmentInfo {
  deID: number;
  departmentName: string;
  coID: number;
  Com: string;
}

interface BookFollowUpResponse {
  id: number;
  bookType: string | null;
  bookNo: string | null;
  bookDate: string | null;
  directoryName: string | null;
  junctionID: number | null;
  incomingNo: string | null;
  incomingDate: string | null;
  subject: string | null;
  destination: string | null;
  bookAction: string | null;
  bookStatus: string | null;
  notes: string | null;
  currentDate: string | null;
  userID: number | null;
  username: string | null;
  countOfPDFs: number | null;
  
  // Primary department info (from junctionID)
  deID: number | null;
  departmentName: string | null;
  coID: number | null;
  Com: string | null;
  
  // Multi-department info
  all_departments: DepartmentInfo[];
  department_names: string | null;
  department_count: number;
  
  pdfFiles: PDFResponse[];
}

// Animation variants for Framer Motion
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

interface UpdateBooksFollowUpByBookIDProps {
  bookId: string;
  payload: JWTPayload;
}

export default function UpdateBooksFollowUpByBookID({ bookId, payload }: UpdateBooksFollowUpByBookIDProps) {
  console.log("UpdateBooksFollowUpByBookID CLIENT", payload);

  // Updated helper function to handle date fields safely
  const getDateValue = (dateValue: string | null | undefined, useCurrentAsDefault = false) => {
    if (!dateValue || dateValue.trim() === '') {
      return useCurrentAsDefault ? format(new Date(), 'yyyy-MM-dd') : '';
    }
    try {
      const testDate = new Date(dateValue);
      if (isNaN(testDate.getTime())) {
        return useCurrentAsDefault ? format(new Date(), 'yyyy-MM-dd') : '';
      }
      return dateValue;
    } catch {
      return useCurrentAsDefault ? format(new Date(), 'yyyy-MM-dd') : '';
    }
  };
  
  // Memoize API base URL
  const API_BASE_URL = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || '', []);

  const queryClient = useQueryClient();
  const dropzoneRef = useRef<DropzoneComponentRef>(null);

  const [selectedCommittee, setSelectedCommittee] = useState<number | undefined>(undefined);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]); // Changed to array
  const [comName, setComName] = useState<string | null>(null);
  const [allDepartments, setAllDepartments] = useState<DepartmentInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfFiles, setPdfFiles] = useState<PDFResponse[]>([]);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [bookID, SetboookID] = useState<string>("");

  // Safe conversion with fallback
  const userID = payload.id?.toString() || '';

  console.log("bookID" + bookID);

  // Updated formData state for multi-department support
  const [formData, setFormData] = useState<BookInsertionType>({
    bookType: '',
    bookNo: '',
    bookDate: format(new Date(), 'yyyy-MM-dd'),
    directoryName: '',
    incomingNo: '',
    incomingDate: format(new Date(), 'yyyy-MM-dd'),
    subject: '',
    selectedCommittee: undefined,
    deIDs: [], // Changed to array
    bookAction: '',
    bookStatus: '',
    notes: '',
    userID: userID,
  });

  // Handle committee change - Updated
  const handleCommitteeChange = useCallback(
    (coID: number | undefined) => {
      console.log('Committee changed:', coID);
      setSelectedCommittee(coID);
      setSelectedDepartments([]); // Reset departments array
      setFormData((prev) => ({
        ...prev,
        selectedCommittee: coID,
        deIDs: [], // Reset departments in form data
      }));
      if (coID) {
        queryClient.invalidateQueries({ queryKey: ['departments', coID] as QueryKey });
      }
    },
    [queryClient]
  );

  // Handle departments change - Updated for multi-select
  const handleDepartmentsChange = useCallback(
    (deIDs: number[]) => {
      console.log('Departments changed:', deIDs);
      setSelectedDepartments(deIDs);
      setFormData((prev) => ({
        ...prev,
        deIDs: deIDs, // Update formData with array
      }));
    },
    []
  );

  // Fetch book data - Updated for multi-department response
  const fetchBookData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<BookFollowUpResponse>(
        `${API_BASE_URL}/api/bookFollowUp/getBookFollowUpByBookID/${bookId}`
      );
      const book = response.data;
      
      console.log("book coID ...", book.coID);
      console.log("book all_departments ...", book.all_departments);
      console.log("book primary deID ...", book.deID);
      console.log("book ID", book.id);

      SetboookID(book.id.toString());

      // Extract department IDs from all_departments
      const departmentIds = book.all_departments?.map(dept => dept.deID) || [];
      
      // Set form data
      setFormData({
        bookType: book.bookType || '',
        bookNo: book.bookNo || '',
        bookDate: getDateValue(book.bookDate, true),
        directoryName: book.directoryName || '',
        incomingNo: book.incomingNo || '',
        incomingDate: getDateValue(book.incomingDate, false),
        subject: book.subject || '',
        selectedCommittee: book.coID || undefined,
        deIDs: departmentIds, // Set all department IDs
        bookAction: book.bookAction || '',
        bookStatus: book.bookStatus || '',
        notes: book.notes || '',
        userID: book.userID?.toString() || '1',
      });

      // Set the state variables for the select components
      setSelectedCommittee(book.coID || undefined);
      setSelectedDepartments(departmentIds);
      setComName(book.Com);
      setAllDepartments(book.all_departments || []);
      setPdfFiles(book.pdfFiles || []);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching book data:', error);
      toast.error('فشل في جلب بيانات الكتاب. يرجى المحاولة مرة أخرى');
      setIsLoading(false);
    }
  }, [bookId, API_BASE_URL]);

  useEffect(() => {
    fetchBookData();
  }, [fetchBookData]);

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
    (key: "bookDate" | "incomingDate", value: string) => {
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        toast.error("يرجى إدخال التاريخ بصيغة YYYY-MM-DD");
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

  // Handle file removal
  const handleFileRemoved = useCallback((fileName: string) => {
    setSelectedFile(null);
    toast.info(`تم إزالة الملف ${fileName}`);
  }, []);

  // Handle book PDF loading result
  const handleBookPdfLoaded = useCallback((success: boolean, file?: File) => {
    console.log(`📄 Book PDF loaded: ${success ? 'SUCCESS' : 'FAILED'}`);
    if (success && file) {
      setSelectedFile(file);
      toast.info('تم تحميل ملف book.pdf بنجاح');
    } else {
      setSelectedFile(null);
    }
  }, []);


  // Updated handleSubmit function - Complete working version
const handleSubmit = useCallback(
  async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("form data client", formData);

    // Required fields validation
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

    // Validate required fields
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

    // Check if we have a valid file
    const hasValidFile = selectedFile && 
                        selectedFile instanceof File && 
                        selectedFile.size > 0 && 
                        selectedFile.type === 'application/pdf';

    console.log('File validation:', {
      selectedFile: !!selectedFile,
      isFile: selectedFile instanceof File,
      size: selectedFile?.size,
      type: selectedFile?.type,
      hasValidFile
    });

    try {
      let response;

      if (hasValidFile) {
        // Scenario 1: WITH FILE - Use FormData
        console.log('📁 Updating WITH file...');
        
        const formDataToSend = new FormData();
        
        // Map form fields to backend expectations
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'selectedCommittee') {
            // Map to coID for backend
            if (value) {
              formDataToSend.append('coID', value.toString());
            }
          } else if (key === 'deIDs') {
            // Convert array to comma-separated string
            formDataToSend.append('deIDs', (value as number[]).join(','));
          } else if (key === 'userID') {
            formDataToSend.append('userID', value.toString());
          } else if (key === 'incomingDate' || key === 'bookDate') {
            // Handle dates properly
            if (value && value.trim() !== '') {
              formDataToSend.append(key, value);
            }
          } else {
            if (value !== undefined && value !== null && value !== '') {
              formDataToSend.append(key, value.toString());
            }
          }
        });
        
        // Add file and username
        formDataToSend.append('file', selectedFile);
        formDataToSend.append('username', payload.username);

        console.log('FormData entries:');
        for (const [key, value] of formDataToSend.entries()) {
          console.log(key, ':', value);
        }

        response = await axios.patch(
          `${API_BASE_URL}/api/bookFollowUp/${bookId}`,
          formDataToSend
        );

        console.log('FormData response:', response.status, response.data);
        
      } else {
        // Scenario 2: WITHOUT FILE - Use JSON
        console.log('📄 Updating WITHOUT file...');
        
        const jsonData = {
          bookNo: formData.bookNo,
          bookType: formData.bookType,
          bookDate: formData.bookDate?.trim() || null,
          directoryName: formData.directoryName,
          incomingNo: formData.incomingNo || null,
          incomingDate: formData.incomingDate?.trim() || null,
          subject: formData.subject,
          bookAction: formData.bookAction,
          bookStatus: formData.bookStatus,
          notes: formData.notes || null,
          userID: parseInt(userID),
          coID: formData.selectedCommittee || null,  // Map selectedCommittee to coID
          deIDs: formData.deIDs.join(','), // Convert array to comma-separated string
        };

        console.log('JSON data:', jsonData);

        response = await axios.patch(
          `${API_BASE_URL}/api/bookFollowUp/${bookId}/json`,
          jsonData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('JSON response:', response.status, response.data);
      }

      // Handle success for BOTH scenarios - SIMPLIFIED VERSION
      console.log('Final response status:', response.status);
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ About to show success toast...');
        
        // Show success message IMMEDIATELY - no other operations first
        toast.success('تم تعديل الكتاب بنجاح!');
        
        console.log('✅ Success toast called');
        console.log('Response data:', response.data);
        
        // Reset file-related state only if file was uploaded
        if (hasValidFile) {
          setSelectedFile(null);
          if (dropzoneRef.current) {
            dropzoneRef.current.reset(true);
          }
          console.log('🗑️ File state reset');
        }
        
        // DO NOT refresh data automatically - remove the problematic fetchBookData call
        // User can manually refresh the page if they want to see updates
        console.log('✅ Update completed successfully');
        
      } else {
        console.log('❌ Unexpected status:', response.status);
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Error updating book:', error);
      
      let message = 'فشل في تحديث الكتاب. يرجى المحاولة مرة أخرى';

      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          console.error('Server error response:', error.response.data);
          
          if (typeof error.response.data === 'string') {
            message += `: ${error.response.data}`;
          } else if (error.response.data.detail) {
            message += `: ${error.response.data.detail}`;
          } else if (error.response.data.message) {
            message += `: ${error.response.data.message}`;
          }
        } else if (error.message) {
          message += `: ${error.message}`;
        }
      } else if (error instanceof Error) {
        message += `: ${error.message}`;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  },
  [formData, selectedFile, bookId, userID, API_BASE_URL, payload.username, fetchBookData]
);


  // Render PDFs function
  const renderPDFs = useMemo(() => {
    if (pdfFiles.length === 0) {
      return (
        <motion.div variants={inputVariants} className="mt-6 text-center">
          <p className="font-arabic text-gray-500">لا توجد ملفات PDF مرفقة</p>
        </motion.div>
      );
    }

    return (
      <motion.div variants={inputVariants} className="mt-6">
        <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-teal-500 text-white font-arabic hover:from-blue-600 hover:to-teal-600 transition-all duration-300"
              onClick={() => setPdfDialogOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              عرض ملفات PDF ({pdfFiles.length})
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[90vw] md:max-w-[700px] lg:max-w-[800px] p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl max-h-[80vh] overflow-y-auto"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-bold text-blue-700 font-arabic text-center">
                ملفات PDF المرتبطة بالكتاب
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {pdfFiles.map((pdf, index) => (
                <motion.div
                  key={pdf.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl border border-blue-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-100 to-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600 animate-pulse" />
                        <div>
                          <p className="text-lg font-bold text-gray-800 font-arabic">
                            رقم الكتاب: {pdf.bookNo || 'غير متوفر'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 text-right space-y-3">
                      <div className="flex items-center gap-x-2 text-gray-700 font-arabic">
                        <span className="font-semibold">تاريخ الإضافة:</span>
                        <span>{pdf.currentDate || 'غير متوفر'}</span>
                      </div>
                      <div className="flex items-center gap-x-2 text-gray-700 font-arabic">
                        <span className="font-semibold">المستخدم:</span>
                        <span className="text-blue-600 font-bold">
                          {pdf.username || 'غير معروف'}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end p-4 bg-gray-50">
                      <Button
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-arabic font-semibold flex items-center gap-2 transition-transform duration-200 hover:scale-105"
                        onClick={() => {
                          window.open(
                            `${API_BASE_URL}/api/bookFollowUp/pdf/file/${pdf.id}`,
                            '_blank'
                          );
                        }}
                      >
                        <BookOpen className="h-4 w-4" />
                        عرض الملف
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }, [pdfFiles, pdfDialogOpen, API_BASE_URL]);

  // Show department summary
  const departmentSummary = useMemo(() => {
    if (allDepartments.length === 0) return null;
    
    return (
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm font-arabic text-blue-800 mb-1">
          الأقسام المرتبطة بالكتاب ({allDepartments.length}):
        </p>
        <p className="text-sm font-arabic text-blue-600">
          {allDepartments.map(dept => dept.departmentName).join(', ')}
        </p>
      </div>
    );
  }, [allDepartments]);

  // Loading and error states
  if (!userID) {
    return <div>Error: Invalid user data...{userID}</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-arabic text-xl">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-sky-50/50 py-4 sm:py-6 md:py-8 lg:py-12"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-sky-100/50">
        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl font-bold font-arabic text-center text-sky-600 mb-6 sm:mb-8 item-center">
          تحديث الكتاب رقم <strong className='text-green-500'>{formData.bookNo}</strong>
        </h1>
        
        {/* Show current department summary */}
        {departmentSummary}
        
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Book Type */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookType"
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
              >
                نوع الكتاب
              </label>
              <select
                id="bookType"
                name="bookType"
                value={formData.bookType}
                onChange={handleChange}
                className="w-full px-4 py-2 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              >
                <option value="">اختر نوع الكتاب</option>
                <option value="خارجي">خارجي</option>
                <option value="داخلي">داخلي</option>
                <option value="فاكس">فاكس</option>
              </select>
            </motion.div>

            {/* Book Date */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookDate"
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
              >
                تاريخ الكتاب
              </label>
              <ArabicDatePicker
                selected={formData.bookDate}
                onChange={(date) => handleDateChange('bookDate', date)}
                allowEmpty={false}
              />
            </motion.div>

            {/* Book Number */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookNo"
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
              >
                رقم الكتاب
              </label>
              <input
                id="bookNo"
                name="bookNo"
                type="text"
                value={formData.bookNo}
                onChange={handleChange}
                className="w-full px-4 py-4 border h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              />
            </motion.div>

            {/* Directory Name */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="directoryName"
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
              >
                اسم الدائرة
              </label>
              <DirectoryNameCombobox
                value={formData.directoryName}
                onChange={(val) => setFormData((prev) => ({ ...prev, directoryName: val }))}
                fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getAllDirectoryNames`}
              />
            </motion.div>

            {/* Incoming Number */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="incomingNo"
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
              >
                رقم الوارد
              </label>
              <input
                id="incomingNo"
                name="incomingNo"
                type="text"
                value={formData.incomingNo}
                onChange={handleChange}
                className="w-full px-4 py-2 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
              />
            </motion.div>

            {/* Incoming Date */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="incomingDate"
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
              >
                تاريخ الوارد
              </label>
              <ArabicDatePicker
                selected={formData.incomingDate}
                onChange={(date) => handleDateChange('incomingDate', date)}
                allowEmpty={true}
              />
            </motion.div>

            {/* Subject */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="subject"
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
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
                htmlFor="committee"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                الهيأة
              </label>
              <CommitteeSelect
                value={selectedCommittee}
                onChange={handleCommitteeChange}
                comName={comName}
                className="w-full"
              />
            </motion.div>

            {/* Multi-Select Departments */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="departments"
                className="block text-sm font-extrabold text-gray-700 mb-1 lg:text-right text-center"
              >
                الأقسام
              </label>
              <MultiSelectDepartments
                coID={selectedCommittee}
                value={selectedDepartments}
                onChange={handleDepartmentsChange}
                className="w-full"
              />
            </motion.div>
{/* 
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-2 bg-sky-600 hover:bg-sky-700 text-white font-arabic font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
            >
             update 
            </Button> */}
            

            {/* Book Action */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="bookAction"
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
              >
                إجراء الكتاب
              </label>
              <BookActionInput formData={formData} setFormData={setFormData} />
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
                <option value="">اختر حالة الكتاب</option>
                <option className='font-extrabold' value="منجز">منجز</option>
                <option className='font-extrabold' value="قيد الانجاز">قيد الانجاز</option>
                <option className='font-extrabold' value="مداولة">مداولة</option>
              </select>
            </motion.div>

            {/* Notes */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-3">
              <label
                htmlFor="notes"
                className="block text-sm font- font-extrabold font-sans text-gray-700 mb-1 text-right"
              >
                ملاحظات
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200 font-arabic text-right resize-y text-sm leading-6 placeholder:text-center placeholder:font-extrabold placeholder:text-gray-300 placeholder:italic"
                rows={4}
              />
            </motion.div>
          </div>

          {/* Dropzone for PDF Upload */}
          <motion.div variants={inputVariants} className="mt-6">
            <label className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right">
              تحميل ملف PDF جديد
            </label>
            <DropzoneComponent
              ref={dropzoneRef}
              onFilesAccepted={handleFilesAccepted}
              onFileRemoved={handleFileRemoved}
              onBookPdfLoaded={handleBookPdfLoaded} 
              username={payload.username}           
            />
          </motion.div>

          {/* Display PDFs */}
          {renderPDFs}

          
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
              {isSubmitting ? 'جاري التحديث...' : 'تحديث الكتاب'}
            </Button>
          </motion.div>

          {/* Debug Info - Remove in production */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-arabic text-gray-600">
              اللجنة المحددة: {selectedCommittee || 'غير محدد'} | 
              الأقسام المحددة: {selectedDepartments.length} | 
              أسماء الأقسام: {allDepartments.filter(d => selectedDepartments.includes(d.deID)).map(d => d.departmentName).join(', ') || 'لا توجد'}
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}