'use client';

import React, { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { FileText, Trash2, Paperclip, Book, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import axios, { AxiosError } from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Interface for preview file handling
interface PreviewFile {
  file?: File;
  name: string;
  preview: string;
  size?: number;
  isFromBackend?: boolean;
}

// Component ref interface for parent component interaction
export interface DropzoneComponentRef {
  reset: (silent?: boolean) => void;
  fetchBookPdf: () => Promise<void>;
}

// Props interface for the dropzone component
interface DropzoneComponentProps {
  username: string; // Username for PDF file retrieval
  onFilesAccepted: (files: File[]) => void; // Callback when files are accepted
  onFileRemoved: (fileName: string) => void; // Callback when file is removed
  onBookPdfLoaded?: (success: boolean, file?: File) => void; // Callback when PDF is loaded from backend
}

const DropzoneComponent = forwardRef<DropzoneComponentRef, DropzoneComponentProps>(
  ({ username, onFilesAccepted, onFileRemoved, onBookPdfLoaded }, ref) => {
    // State for managing preview files
    const [files, setFiles] = useState<PreviewFile[]>([]);
    // State for loading indicator
    const [isLoadingBookPdf, setIsLoadingBookPdf] = useState(false);

    // Clean up blob URLs to prevent memory leaks
    const revokePreviousUrls = useCallback((currentFiles: PreviewFile[]) => {
      currentFiles.forEach((file) => {
        if (file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    }, []);

    // Enhanced error handling helper with localization support
    const getErrorMessage = useCallback(async (error: unknown): Promise<string> => {
      // Handle Axios errors with detailed response parsing
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        try {
          let detail = 'No additional details provided';

          // Parse blob response data if present
          if (axiosError.response?.data instanceof Blob) {
            const text = await axiosError.response.data.text();
            const json = JSON.parse(text);
            detail = json.detail || detail;
          } else if (axiosError.response?.data) {
            const responseData = axiosError.response.data as { detail?: string };
            detail = responseData.detail || detail;
          }

          // Return appropriate error messages based on status codes
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

      // Log and handle non-Axios errors
      console.error('Non-Axios error:', error);
      return 'حدث خطأ غير متوقع';
    }, []);

    // Log username for debugging purposes
    console.log(username);

    // Simplified and robust fetchBookPdf function for direct server fetch
    const fetchBookPdf = useCallback(async (): Promise<void> => {
      // Set loading state and clean up existing files
      setIsLoadingBookPdf(true);
      revokePreviousUrls(files);
      setFiles([]);

      try {
        console.log('🔍 Fetching book.pdf from server for user:', username);
        
        // Single optimized request with robust configuration
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/files/book`,
          {
            responseType: 'blob', // Handle binary PDF data efficiently
            withCredentials: true, // Include authentication credentials
            timeout: 30000, // 30 seconds timeout
            headers: {
              // Prevent caching to ensure fresh data
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              // Accept compression for better performance
              'Accept-Encoding': 'gzip, deflate, br',
            },
            params: { 
              t: Date.now(), // Cache busting parameter
              username: username, // User-specific parameter
            },
            // Performance and safety configurations
            decompress: true, // Enable response compression
            maxContentLength: 50 * 1024 * 1024, // 50MB limit for safety
            maxBodyLength: 50 * 1024 * 1024, // 50MB limit for safety
            validateStatus: (status) => status === 200, // Only accept 200 status
          }
        );

        // Validate response data exists and is not empty
        if (!response.data || response.data.size === 0) {
          throw new Error('الملف المُحمل فارغ أو غير صالح');
        }

        // Validate PDF content type
        if (response.data.type !== 'application/pdf') {
          throw new Error('الملف المُحمل ليس PDF صالح');
        }

        // Create File object from blob with proper metadata
        const file = new File([response.data], 'book.pdf', { 
          type: 'application/pdf',
          lastModified: Date.now()
        });
        
        // Create blob URL for preview
        const previewUrl = URL.createObjectURL(file);

        // Create preview file object with all necessary properties
        const previewFile: PreviewFile = {
          file,
          name: 'book.pdf',
          preview: previewUrl,
          size: file.size,
          isFromBackend: true,
        };

        // Update state with successful file load
        setFiles([previewFile]);
        onFilesAccepted([file]);
        onBookPdfLoaded?.(true, file);
        
        // Show success notification
        toast.success('تم تحميل ملف book.pdf بنجاح من الخادم', { 
          position: 'top-right', 
          autoClose: 3000 
        });
        
        console.log('📄 PDF file loaded successfully:', {
          name: previewFile.name,
          size: `${(previewFile.size! / 1024 / 1024).toFixed(2)} MB`,
          type: file.type
        });

      } catch (error: unknown) {
        console.error('❌ Failed to fetch PDF from server:', error);
        
        // Clear files on error
        setFiles([]);
        
        // Handle different error types with appropriate user messages
        let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل الملف';
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            errorMessage = `الملف غير موجود على الخادم للمستخدم: ${username}`;
          } else if (error.response?.status === 403) {
            errorMessage = 'ليس لديك صلاحية للوصول إلى هذا الملف';
          } else if (error.response?.status === 500) {
            errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني';
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'انتهت مهلة الاتصال. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى';
          } else if (error.code === 'ERR_NETWORK') {
            errorMessage = 'خطأ في الشبكة. يرجى التحقق من الاتصال بالإنترنت';
          } else if (error.response?.data) {
            // Try to extract error message from response
            try {
              const errorData = await getErrorMessage(error);
              errorMessage = errorData;
            } catch {
              // Fallback to generic message if parsing fails
            }
          }
        }
        
        // Show error notification
        toast.error(errorMessage, { 
          position: 'top-right', 
          autoClose: 5000 
        });
        
        // Notify parent component of failure
        onBookPdfLoaded?.(false);
        
      } finally {
        // Always clear loading state
        setIsLoadingBookPdf(false);
      }
    }, [files, username, onFilesAccepted, onBookPdfLoaded, revokePreviousUrls, getErrorMessage]);

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      // Reset function to clear all files
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
      // Expose fetchBookPdf function
      fetchBookPdf,
    }));

    // Handle file drop with validation and preview creation
    const onDrop = useCallback<NonNullable<DropzoneOptions['onDrop']>>(
      (acceptedFiles) => {
        if (acceptedFiles.length) {
          // Clean up previous files
          revokePreviousUrls(files);
          
          // Create preview files (only take the first file due to maxFiles: 1)
          const previewFiles = acceptedFiles.map((file) => ({
            file,
            name: file.name,
            preview: URL.createObjectURL(file),
            size: file.size,
            isFromBackend: false,
          }));
          
          // Update state with new file
          setFiles([previewFiles[0]]);
          onFilesAccepted([acceptedFiles[0]]);
        }
      },
      [files, onFilesAccepted, revokePreviousUrls]
    );

    // Configure dropzone with validation rules
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: { 'application/pdf': [] }, // Only accept PDF files
      maxSize: 10 * 1024 * 1024, // 10MB maximum file size
      maxFiles: 1, // Only allow single file
      onDrop,
    });

    // Cleanup blob URLs on component unmount to prevent memory leaks
    useEffect(() => {
      return () => revokePreviousUrls(files);
    }, [files, revokePreviousUrls]);

    // Remove file function with proper cleanup
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
            <div className="absolute inset-0 z-10 flex items-center justify-end pointer-events-none">
              <div className="flex flex-col gap-4 bg-transparent p-3 rounded-xl shadow-lg pointer-events-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="bg-sky-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-sky-600 transition-colors cursor-pointer"
                      aria-label="عرض ملف PDF"
                      title="عرض الملف"
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
          </div>
        ))}
        <ToastContainer />
      </div>
    );
  }
);

DropzoneComponent.displayName = 'DropzoneComponent';
export default DropzoneComponent;