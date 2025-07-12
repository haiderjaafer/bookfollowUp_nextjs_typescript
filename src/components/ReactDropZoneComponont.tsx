
'use client';

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { FileText, Trash2, Paperclip, Book } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface PreviewFile {
  file?: File;
  name: string;
  preview: string;
  size?: number;
}

export interface DropzoneComponentRef {
  reset: (silent?: boolean) => void;
}

interface DropzoneComponentProps {
  onFilesAccepted: (files: File[]) => void;
  onFileRemoved: (fileName: string) => void;
}

// 👇 ForwardRef to allow .reset() method from parent
const DropzoneComponent = forwardRef<DropzoneComponentRef, DropzoneComponentProps>(      // DropzoneComponent is consider child Component
  ({ onFilesAccepted, onFileRemoved }, ref) => {
    const [files, setFiles] = useState<PreviewFile[]>([]);

    const revokePreviousUrls = (currentFiles: PreviewFile[]) => {
      currentFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };


//    The silent parameter determines whether the dropzone should trigger a notification (through a callback) when files are removed.
//When silent is true, the function executes the reset without notifying that a file has been removed. When silent is false, it does notify the parent
   //The silent parameter controls whether the reset action will notify the parent about file removal.

 //Callback Function: This function returns an object that contains the methods you want to expose (in this case, the reset method)


       // Reset method
    useImperativeHandle(ref, () => ({    // This allows the child component to access the ref and expose methods to the parent.
      reset(silent = false) {         // use useImperativeHandle to expose the reset method to the parent component:
        if (files.length > 0) {
          // Revoke preview URL
          URL.revokeObjectURL(files[0].preview);
          setFiles([]);
          if (!silent) {                   // // This won't execute since silent is true   
            onFileRemoved(files[0].name); // Call only if not silent
          }
        }
      },
    }));

    const onDrop = useCallback<NonNullable<DropzoneOptions['onDrop']>>(
      (acceptedFiles) => {
        if (acceptedFiles.length) {
          revokePreviousUrls(files);
          const previewFiles = acceptedFiles.map((file) => ({
            file,
            name: file.name,
            preview: URL.createObjectURL(file) + `#${Date.now()}`,
            size: file.size,
          }));
          setFiles([previewFiles[0]]);
          onFilesAccepted([acceptedFiles[0]]);
        }
      },
      [files, onFilesAccepted]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: { 'application/pdf': [] },
      maxSize: 10 * 1024 * 1024,
      maxFiles: 1,
      onDrop,
    });

    useEffect(() => {
      return () => revokePreviousUrls(files);
    }, [files]);

    const removeFile = (fileName: string) => {
      const fileToRemove = files.find((file) => file.name === fileName);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      setFiles([]);
      onFileRemoved(fileName);
    };



// 🆕 Function to fetch and preview book.pdf from backend
const fetchBookPdf = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/files/book`,
      {
        responseType: 'blob',
        withCredentials: true,
      }
    );

    console.log("pdf book",response.data);
    const previewUrl = URL.createObjectURL(response.data) + `#${Date.now()}`;
    const file: PreviewFile = {
      name: 'book.pdf',
      preview: previewUrl,
    };
    revokePreviousUrls(files); // remove existing file preview
    setFiles([file]); // replace with book.pdf
  } catch (error: any) {
    console.error('❌ Failed to load book.pdf:', error);
    // optional toast error message if needed
  }
};


    return (
      <div className="flex items-center justify-between bg-gray-300 rounded-lg w-full flex-col sm:flex-row gap-2">

<section className='flex flex-col items-center'>


{/* 🆕 Button OUTSIDE getRootProps to avoid opening dialog */}
  <div className="flex justify-center items-center w-full h-16 mb-1 cursor-pointer bg-red-300 rounded-lg border-2 border-dashed m-1">
    <button
      onClick={fetchBookPdf}
      type="button"
      title="تحميل ملف book.pdf"
      className="bg-sky-500 text-white w-full h-full flex items-center cursor-pointer justify-center   hover:bg-sky-600 transition-colors"
    >
  <strong>سحب ملف</strong>
      {/* <Book className="w-5 h-5" />  */}
    </button>
  </div>


        {/* Dropzone Area */}
        <div
          {...getRootProps({
            className: cn(
              'border-2 border-dashed p-6 rounded-md cursor-pointer w-full sm:w-auto',
              isDragActive
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
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
        {/* Preview */}
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
                      className="bg-sky-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-sky-600 transition-colors"
                      aria-label="عرض ملف PDF"
                    >
                      <FileText className="w-4 h-4" />
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
                      key={file.preview}
                    />
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-gray-400 pointer-events-none" />
                  </PopoverContent>
                </Popover>
                <Trash2
                  className="w-6 h-6 text-red-600 cursor-pointer hover:scale-110 transition"
                  onClick={() => removeFile(file.name)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

DropzoneComponent.displayName = 'DropzoneComponent';
export default DropzoneComponent;
