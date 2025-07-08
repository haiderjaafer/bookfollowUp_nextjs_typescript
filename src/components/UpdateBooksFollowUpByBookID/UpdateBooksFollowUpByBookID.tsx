'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { DatePicker } from '../ui/date-picker';
import DirectoryNameInput from '../directoryName/directoryNameInput';
import SubjectInput from '../subject/subjectInput';
import DestinationInput from '../destination/destinationInput';
import { BookInsertionType } from '../../../bookInsertionType';
import { toast } from 'react-toastify';
import DropzoneComponent from '../ReactDropZoneComponont';
import axios from 'axios';
import debounce from 'debounce';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, BookOpen, Eye, Download } from 'lucide-react'; // Icons for visual appeal
import DirectoryNameCombobox from '../BookInsertionForm/DirectoryNameComboboxAutoComplete';
import ArabicDatePicker from '../ArabicDatePicker';
import BookActionInput from '../BookInsertionForm/bookActionDialogInput/bookActionInput';
import SubjectAutoCompleteComboBox from '../BookInsertionForm/SubjectAutoComplete';
import DestinationAutoComplete from '../BookInsertionForm/DestinationAutoComplete';
import { JWTPayload } from '@/utiles/verifyToken';

// Define the response type based on the FastAPI model
interface PDFResponse {
  id: number;
  bookNo: string | null;
  pdf: string | null;
  currentDate: string | null;
  username: string | null;
}

interface BookFollowUpResponse {
  id: number;
  bookType: string | null;
  bookNo: string | null;
  bookDate: string | null;
  directoryName: string | null;
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

console.log("UpdateBooksFollowUpByBookID CLIENT",payload);

   // Safe conversion with fallback
  const userID = payload.id?.toString() || '';
  const username = payload.username || '';
  const permission = payload.permission || '';

 

  // Additional validation in client component
  if (!userID) {
    return <div>Error: Invalid user data...{userID}</div>;
  }


  // Memoize API base URL
  const API_BASE_URL = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || '', []);

  

  console.log("bookID"+ bookId);
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<BookInsertionType>({
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
    userID: userID, // Adjust based on auth context
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookExists, setBookExists] = useState<boolean | null>(null);
  const [pdfFiles, setPdfFiles] = useState<PDFResponse[]>([]);
  // NEW: State for dialog visibility
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

 // CHANGED: Updated fetchBookData to ensure bookDate is parsed correctly
const fetchBookData = useCallback(async () => {
  try {
    setIsLoading(true);
    const response = await axios.get<BookFollowUpResponse>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/getBookFollowUpByBookID/${bookId}`
    );
    const book = response.data;

    // CHANGED: Parse bookDate and incomingDate to ensure valid Date objects
    const parsedBookDate = book.bookDate
      ? parse(book.bookDate, 'yyyy-MM-dd', new Date())
      : new Date();
    const parsedIncomingDate = book.incomingDate
      ? parse(book.incomingDate, 'yyyy-MM-dd', new Date())
      : new Date();

    setFormData({
      bookType: book.bookType || '',
      bookNo: book.bookNo || '',
      bookDate: book.bookDate || format(new Date(), 'yyyy-MM-dd'),
      directoryName: book.directoryName || '',
      incomingNo: book.incomingNo || '',
      incomingDate: book.incomingDate || format(new Date(), 'yyyy-MM-dd'),
      subject: book.subject || '',
      destination: book.destination || '',
      bookAction: book.bookAction || '',
      bookStatus: book.bookStatus || '',
      notes: book.notes || '',
      userID: book.userID?.toString() || '1',
    });
    setPdfFiles(book.pdfFiles || []);
    setIsLoading(false);
  } catch (error) {
    console.error('Error fetching book data:', error);
    toast.error('فشل في جلب بيانات الكتاب. يرجى المحاولة مرة أخرى');
    setIsLoading(false);
  }
}, [bookId]);

  useEffect(() => {
    fetchBookData();
  }, [fetchBookData]);

  // // Check if book exists (for uniqueness validation during update)
  // const checkBookExists = useCallback(
  //   async (bookType: string, bookNo: string, bookDate: string) => {
  //     if (!bookType || !bookNo || !bookDate) return;
  //     try {
  //       const response = await axios.get(
  //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/checkBookNoExistsForDebounce`,
  //         { params: { bookType, bookNo, bookDate, excludeBookId: bookId } }
  //       );
  //       setBookExists(response.data.exists);
  //       if (response.data.exists) {
  //         toast.warning('رقم الكتاب موجود بالفعل لهذا العام');
  //       }
  //     } catch (error) {
  //       console.error('Error checking book existence:', error);
  //       setBookExists(false);
  //     }
  //   },
  //   [bookId]
  // );

  // const debouncedCheckBookExists = useCallback(
  //   debounce(checkBookExists, 500),
  //   [checkBookExists]
  // );

  // useEffect(() => {
  //   if (formData.bookNo && formData.bookType && formData.bookDate) {
  //     debouncedCheckBookExists(
  //       formData.bookType,
  //       formData.bookNo,
  //       formData.bookDate
  //     );
  //   } else {
  //     setBookExists(null);
  //   }
  //   return () => {
  //     debouncedCheckBookExists.clear();
  //   };
  // }, [formData.bookNo, formData.bookType, formData.bookDate, debouncedCheckBookExists]);

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

  // Handle form submission to update the book
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      console.log("form data client",formData);

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

      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

       if (formData.userID) {
        formDataToSend.append('userID', userID);
      }

      console.log("formDataToSend",formDataToSend);



      try {
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/${bookId}`,
          formDataToSend,
        
        );

        if (response.status === 200) {
          toast.success('تم تحديث الكتاب بنجاح!');
         // router.push('/'); // Redirect to the main page or table
        } else {
          throw new Error('Failed to update book');
        }
      } catch (error) {
        console.error('Error updating book:', error);
        toast.error(`فشل في تحديث الكتاب. يرجى المحاولة مرة أخرى${error}`);

          let message = 'فشل في تحديث الكتاب. يرجى المحاولة مرة أخرى';


         if (axios.isAxiosError(error)) {
    if (error.response?.data?.detail) {
      // FastAPI often returns errors like { detail: "some error" }
      message += `: ${error.response.data.detail}`;
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
    [formData, selectedFile, bookId, router]
  );

  // CHANGED: Refactored renderPDFs to use a dialog with a modern card-based design

  // CHANGED: Refactored renderPDFs to place DialogTrigger inside Dialog
const renderPDFs = useMemo(() => {
  // If no PDFs, show a message
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
                        {/* <p className="text-sm text-gray-600 font-arabic">
                          معرف الملف: {pdf.id}
                        </p> */}
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
                    {/* <div className="flex items-center gap-x-2 text-gray-700 font-arabic">
                      <span className="font-semibold">مسار الملف:</span>
                      <span className="text-sm truncate max-w-[80%]">
                        {pdf.pdf || 'غير متوفر'}
                      </span>
                    </div> */}
                  </CardContent>
                  <CardFooter className="flex justify-end p-4 bg-gray-50">
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-arabic font-semibold flex items-center gap-2 transition-transform duration-200 hover:scale-105"
                      onClick={() => {
                        window.open(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/pdf/file/${pdf.id}`,
                          '_blank'
                        );
                      }}
                    >
                      <BookOpen className="h-4 w-4" />
                      عرض الملف
                    </Button>
                    {/* <Button
                      variant="outline"
                      className="ml-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-arabic flex items-center gap-2 transition-transform duration-200 hover:scale-105"
                      onClick={() => {
                        window.open(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/pdf/file/${pdf.id}?download=true`,
                          '_blank'
                        );
                      }}
                    >
                      <Download className="h-4 w-4" />
                      تحميل
                    </Button> */}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}, [pdfFiles, pdfDialogOpen]);




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
        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl font-bold font-arabic text-center text-sky-600 mb-6 sm:mb-8">
          تحديث الكتاب رقم {formData.bookNo}
        </h1>
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
                              onChange={(value) => handleDateChange('bookDate', value)}
                              label="تأريخ الكتاب"
                            />
           

              {/* <DatePicker
  onDateChange={handleChangeBookDate}
  initialDate={formData.bookDate ? parse(formData.bookDate, 'yyyy-MM-dd', new Date()) : new Date()}
/> */}
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
              {/* <DirectoryNameInput formData={formData} setFormData={setFormData} /> */}
              
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
                onChange={(value) => handleDateChange('incomingDate', value)}
                label="تأريخ الوارد"
              />

            {/* <DatePicker
  onDateChange={handleChangeIncomingDate}
  initialDate={formData.incomingDate ? parse(formData.incomingDate, 'yyyy-MM-dd', new Date()) : new Date()}
/> */}
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
              {/* <SubjectInput formData={formData} setFormData={setFormData} /> */}
            </motion.div>

            {/* Destination */}
            <motion.div variants={inputVariants} className="sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="destination"
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
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
                className="block text-sm font-extrabold font-sans text-gray-700 mb-1 text-right"
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
                className="block text-sm font- font-extrabold font-sans text-gray-700 mb-1 text-right"
              >
                ملاحظات
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4  border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200 font-arabic text-right resize-y text-sm leading-6 placeholder:text-center placeholder:font-extrabold placeholder:text-gray-300 placeholder:italic"
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
              onFilesAccepted={handleFilesAccepted}
              onFileRemoved={handleFileRemoved}
            />
          </motion.div>

          {/* Display PDFs */}
          {renderPDFs}

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
              {isSubmitting ? 'جاري التحديث...' : 'تحديث الكتاب'}
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}