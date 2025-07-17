'use client';

import React, { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { FileText, Trash2, Paperclip, Book, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

interface PreviewFile {
  file?: File;
  name: string;
  preview: string;
  size?: number;
  isFromBackend?: boolean;
}

export interface DropzoneComponentRef {
  reset: (silent?: boolean) => void;
  fetchBookPdf: () => Promise<void>;
}

interface DropzoneComponentProps {
  onFilesAccepted: (files: File[]) => void;
  onFileRemoved: (fileName: string) => void;
  onBookPdfLoaded?: (success: boolean, file?: File) => void;
}

const DropzoneComponent = forwardRef<DropzoneComponentRef, DropzoneComponentProps>(
  ({ onFilesAccepted, onFileRemoved, onBookPdfLoaded }, ref) => {
    const [files, setFiles] = useState<PreviewFile[]>([]);
    const [isLoadingBookPdf, setIsLoadingBookPdf] = useState(false);

    // Clean up blob URLs
    const revokePreviousUrls = useCallback((currentFiles: PreviewFile[]) => {
      currentFiles.forEach((file) => {
        if (file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    }, []);

    // Error handling helper
    

    const getErrorMessage = useCallback(async (error: unknown): Promise<string> => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        try {
          let detail = 'No additional details provided';


        
          
          // Handle Blob response (when responseType is 'blob')
          if (axiosError.response?.data instanceof Blob) {
            const text = await axiosError.response.data.text();
            const json = JSON.parse(text);
            detail = json.detail || detail;
          } else if (axiosError.response?.data) {
            // Handle JSON response directly
            detail = (axiosError.response.data as any).detail || detail;
          }

         // console.error('............ error detail:', detail);   will got detail from backend 

          // Log minimal error info for debugging (optional)
          console.log('Axios error:', {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
          });

          // Customize user-facing message based on status code
          if (axiosError.response?.status === 404) {
            return `${detail}`;
          } else if (axiosError.response?.status === 400) {
            return `${detail}. يرجى التأكد من أن الملف صالح.`;
          } else if (axiosError.response?.status === 500) {
            return `خطأ في الخادم: ${detail}. يرجى التواصل مع الدعم الفني.`;
          } else if (axiosError.code === 'ERR_NETWORK') {
            return 'خطأ في الاتصال بالخادم. يرجى التحقق من الشبكة.';
          }

          return `خطأ غير متوقع: ${detail}`;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          return 'فشل في تحليل استجابة الخطأ من الخادم';
        }
      }

      console.error('Non-Axios error:', error);
      return 'حدث خطأ غير متوقع';
    }, []);

    // Fetch book.pdf from backend
    const fetchBookPdf = useCallback(async (): Promise<void> => {
      setIsLoadingBookPdf(true);
      revokePreviousUrls(files);
      setFiles([]);

      try {
        console.log('🔍 Fetching book.pdf from:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/files/book`);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/files/book`,
          {
            responseType: 'blob',
            withCredentials: true,
            timeout: 10000,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
            params: { t: Date.now() },
          }
        );

        if (!response.data || response.data.size === 0) {
          throw new Error('الملف المُحمل فارغ');
        }

        if (response.data.type !== 'application/pdf') {
          throw new Error('الملف المُحمل ليس PDF صالح');
        }

        // Create a File object from the blob
        const file = new File([response.data], 'book.pdf', { type: 'application/pdf' });
        const previewUrl = URL.createObjectURL(file);

        const previewFile: PreviewFile = {
          file,
          name: 'book.pdf',
          preview: previewUrl,
          size: file.size,
          isFromBackend: true,
        };

        setFiles([previewFile]);
        onFilesAccepted([file]);
        onBookPdfLoaded?.(true, file);
        toast.success('تم تحميل ملف book.pdf بنجاح');
        console.log('📄 PDF file loaded:', previewFile);
      } catch (error: unknown) {
        console.log('❌ Failed to load book.pdf:', error); // Reduced verbosity
        setFiles([]);
        const errorMessage = await getErrorMessage(error);
        toast.error(errorMessage); // Show error detail in toast only
        onBookPdfLoaded?.(false);
      } finally {
        setIsLoadingBookPdf(false);
      }
    }, [onFilesAccepted, onBookPdfLoaded, revokePreviousUrls, getErrorMessage]);


    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      reset(silent = false) {
        if (files.length > 0) {
          revokePreviousUrls(files);
          const fileNames = files.map((f) => f.name);
          setFiles([]);
          if (!silent) {
            fileNames.forEach((fileName) => onFileRemoved(fileName));
          }
        }
      },
      fetchBookPdf,
    }));

    // Handle file drop
    const onDrop = useCallback<NonNullable<DropzoneOptions['onDrop']>>(
      (acceptedFiles) => {
        if (acceptedFiles.length) {
          revokePreviousUrls(files);
          const previewFiles = acceptedFiles.map((file) => ({
            file,
            name: file.name,
            preview: URL.createObjectURL(file),
            size: file.size,
            isFromBackend: false,
          }));
          setFiles([previewFiles[0]]);
          onFilesAccepted([acceptedFiles[0]]);
        }
      },
      [files, onFilesAccepted, revokePreviousUrls]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: { 'application/pdf': [] },
      maxSize: 10 * 1024 * 1024,
      maxFiles: 1,
      onDrop,
    });

    // Cleanup on unmount
    useEffect(() => {
      return () => revokePreviousUrls(files);
    }, [files, revokePreviousUrls]);

    const removeFile = useCallback(
      (fileName: string) => {
        const fileToRemove = files.find((file) => file.name === fileName);
        if (fileToRemove) {
          revokePreviousUrls([fileToRemove]);
        }
        setFiles([]);
        onFileRemoved(fileName);
      },
      [files, onFileRemoved, revokePreviousUrls]
    );

    return (
      <div className="flex items-center justify-between bg-gray-300 rounded-lg w-full flex-col sm:flex-row gap-2">
        <section className="flex flex-col items-center">
          <div className="flex justify-center items-center w-full h-16 mb-1 cursor-pointer bg-red-300 rounded-lg border-2 border-dashed m-1">
            <button
              onClick={fetchBookPdf}
              type="button"
              title="تحميل ملف book.pdf"
              disabled={isLoadingBookPdf}
              className={cn(
                'text-white w-full h-full flex items-center cursor-pointer justify-center gap-2 transition-colors',
                isLoadingBookPdf ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600'
              )}
            >
              {isLoadingBookPdf ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <strong>جاري التحميل...</strong>
                </>
              ) : (
                <>
                  <Book className="w-5 h-5" />
                  <strong>سحب ملف</strong>
                </>
              )}
            </button>
          </div>

          <div
            {...getRootProps({
              className: cn(
                'border-2 border-dashed p-6 rounded-md cursor-pointer w-full sm:w-auto',
                isDragActive ? 'border-sky-500 bg-sky-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              ),
            })}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center h-[100px] justify-center text-center">
              <Paperclip className="w-8 h-8 text-gray-500" />
              <p className="text-sky-500 font-serif font-extrabold text-sm mt-2">
                {isDragActive ? 'اسقط الملف هنا...' : 'اختار الملف | سحب وإفلات'}
              </p>
              <p className="text-xs text-gray-500 font-serif font-bold mt-1">
                فقط ملفات PDF (بحد أقصى 10 ميجابايت)
              </p>
            </div>
          </div>
        </section>

        {files.map((file) => (
          <div
            key={file.name}
            className="relative w-full h-[200px] rounded-lg overflow-hidden border shadow-md"
          >
            <iframe
              src={file.preview}
              className="absolute inset-0 w-full h-full border-0"
              title={`معاينة ${file.name}`}
            />
            {/* {file.isFromBackend && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                من الخادم
              </div>
            )} */}
            <div className="absolute inset-0 z-10 flex items-center justify-end pointer-events-none">
              <div className="flex flex-col gap-4 bg-transparent p-3 rounded-xl shadow-lg pointer-events-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="bg-sky-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-sky-600 transition-colors cursor-pointer"
                      aria-label="عرض ملف PDF"
                      title="عرض الملف "
                  
                    >
                      <FileText className="w-4 h-4 hover:scale-110 transition duration-300" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="relative resize overflow-auto bg-white shadow-lg rounded-lg w-[min(90vw,700px)] h-[400px] p-0"
                    side="top"
                    align="end"
                  >
                    <iframe
                      src={file.preview}
                      className="w-full h-full border-0"
                      title={`معاينة ${file.name}`}
                    />
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-gray-400 pointer-events-none" />
                  </PopoverContent>
                </Popover>
                <button
                  type="button"
                  onClick={() => window.open(file.preview, '_blank')}
                  className="bg-purple-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-purple-600 transition-colors cursor-pointer"
                  aria-label="فتح PDF في نافذة جديدة"
                  title="فتح PDF في نافذة جديدة"
                >
                  <svg className="w-4 h-4 hover:scale-110 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
                <Trash2
                  className="w-6 h-6 text-red-600 cursor-pointer hover:scale-110 transition duration-300"
                  onClick={() => removeFile(file.name)}
                  
                />
              </div>
            </div>
            {/* <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {file.name} {file.size && `(${(file.size / 1024 / 1024).toFixed(1)} MB)`}
            </div> */}
          </div>
        ))}
      </div>
    );
  }
);

DropzoneComponent.displayName = 'DropzoneComponent';
export default DropzoneComponent;