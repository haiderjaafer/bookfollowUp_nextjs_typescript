'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Upload, FileText, Trash2, Paperclip, Book } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { toast } from 'react-toastify';

interface PreviewFile {
  file?: File; // Optional for server-fetched files
  name: string;
  preview: string;
  size?: number; // Optional for server-fetched files
}

interface DropzoneComponentProps {
  onFilesAccepted: (files: File[]) => void;
  onFileRemoved: (fileName: string) => void;
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  onFilesAccepted,
  onFileRemoved,
}) => {
  const [files, setFiles] = useState<PreviewFile[]>([]);

  // Revoke preview URLs for previous files
  const revokePreviousUrls = (currentFiles: PreviewFile[]) => {
    currentFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  };

  // Handle file drop
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
        console.log('New file selected:', previewFiles[0].name, previewFiles[0].preview);
      }
    },
    [files, onFilesAccepted]
  );

  // Fetch book.pdf from server
  const fetchBookPdf = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/files/book`,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
          responseType: 'blob', // Fetch as blob for PDF
        }
      );
      const blob = response.data;
      const previewUrl = URL.createObjectURL(blob) + `#${Date.now()}`;
      const newFile: PreviewFile = {
        name: 'book.pdf',
        preview: previewUrl,
      };
      revokePreviousUrls(files);
      setFiles([newFile]);
      console.log('Fetched book.pdf:', previewUrl);
      toast.success('تم تحميل book.pdf');
    } catch (error: any) {
      console.error('Error fetching book.pdf:', error);
      console.log('Error status:', error.response?.status);
      console.log('Error detail:', error.response?.data?.detail);
      if (error.response?.status === 404) {
        toast.info('الملف book.pdf غير موجود');
      } else {
        toast.error(error.response?.data?.detail || 'فشل تحميل book.pdf');
      }
    }
  };

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': [] },
    maxSize: 10 * 1024 * 1024, // 10 MB
    maxFiles: 1,
    onDrop,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokePreviousUrls(files);
    };
  }, [files]);

  // Remove file
  const removeFile = (fileName: string) => {
    const fileToRemove = files.find((file) => file.name === fileName);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles([]);
    onFileRemoved(fileName);
    console.log('File removed:', fileName);
  };

  return (
    <div className="flex items-center justify-between bg-gray-300 rounded-lg">
      {/* Dropzone Area */}
      <div
        {...getRootProps({
          className: cn(
            'border-2 border-dashed p-6 rounded-md cursor-pointer',
            isDragActive ? 'border-sky-500 bg-sky-50 ' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 '
          ),
        })}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center h-[150px] justify-center text-center">
          <Paperclip size={50} className="w-8 h-8 text-gray-500" />
          {isDragActive ? (
            <p className="text-sky-500 font-serif text-sm mt-2">اسقط الملف هنا...</p>
          ) : (
            <p className="text-sky-500 font-serif font-extrabold text-sm mt-2">
              اختار الملف | سحب وإفلات
            </p>
          )}
          <p className="text-xs text-gray-500 font-serif font-bold mt-1">
            فقط ملفات PDF (بحد أقصى 10 ميجابايت)
          </p>
        </div>

    
      </div>


             {/* <button
        onClick={fetchBookPdf}
        title="عرض book.pdf"
        className="ml-4 bg-sky-500 text-white w-8  h-8 flex items-center justify-center rounded-full hover:bg-sky-600 transition-colors"
      >
        <Book className="w-6 h-6" />
      </button> */}

    
   

      {/* Accepted Files */}
      {files.map((file) => (
        <div
          key={file.name}
          className="relative w-full h-[200px] rounded-lg overflow-hidden border shadow-md"
        >
          {/* Iframe */}
          <iframe
            src={file.preview}
            className="absolute inset-0 w-full h-full border-0"
            title={`معاينة ${file.name}`}
          />

          {/* Centered icons */}
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
};

export default DropzoneComponent;




























// 'use client';

// import { useCallback, useEffect, useState } from 'react';
// import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone';
// import { Upload, FileText, Trash2, Paperclip } from 'lucide-react';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { cn } from '@/lib/utils';

// interface PreviewFile {
//   file: File;
//   name: string;
//   preview: string; // URL for the file
//   size: number;
// }

// interface DropzoneComponentProps {
//   onFilesAccepted: (files: File[]) => void;
//   onFileRemoved: (fileName: string) => void;
// }

// const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
//   onFilesAccepted,
//   onFileRemoved,
// }) => {
//   const [files, setFiles] = useState<PreviewFile[]>([]);

//   // Revoke preview URLs for previous files
//   const revokePreviousUrls = (currentFiles: PreviewFile[]) => {
//     currentFiles.forEach((file) => URL.revokeObjectURL(file.preview));
//   };

//   // Handle file drop
//   const onDrop = useCallback<NonNullable<DropzoneOptions['onDrop']>>(
//     (acceptedFiles) => {
//       if (acceptedFiles.length) {
//         // Revoke URLs for existing files before adding new one
//         revokePreviousUrls(files);
//         // Create preview for the new file
//         const previewFiles = acceptedFiles.map((file) => ({
//           file,
//           name: file.name,
//           preview: URL.createObjectURL(file) + `#${Date.now()}`, // Add timestamp to force iframe refresh
//           size: file.size,
//         }));
//         // Set to single file
//         setFiles([previewFiles[0]]);
//         onFilesAccepted([acceptedFiles[0]]);
//         console.log('New file selected:', previewFiles[0].name, previewFiles[0].preview); // Debug
//       }
//     },
//     [files, onFilesAccepted]
//   );

//   // Configure dropzone
//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: { 'application/pdf': [] },
//     maxSize: 10 * 1024 * 1024, // 10 MB
//     maxFiles: 1,
//     onDrop,
//   });

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       revokePreviousUrls(files);
//     };
//   }, [files]);

//   // Remove file
//   const removeFile = (fileName: string) => {
//     const fileToRemove = files.find((file) => file.name === fileName);
//     if (fileToRemove) {
//       URL.revokeObjectURL(fileToRemove.preview);
//     }
//     setFiles([]);
//     onFileRemoved(fileName);
//     console.log('File removed:', fileName); // Debug
//   };

//   return (
//     <div className='flex items-center justify-between bg-gray-300 rounded-lg'> 
//       {/* Dropzone Area */}
//       <div
//         {...getRootProps({
//           className: cn(
//             'border-2 border-dashed p-6 rounded-md cursor-pointer',
//             isDragActive ? 'border-sky-500 bg-sky-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
//           ),
//         })}
//       >
//         <input {...getInputProps()} />
//           <div className="flex flex-col items-center h-[150px] justify-center text-center ">
//           <Paperclip size={50}  className="w-8 h-8  text-gray-500" />
//           {isDragActive ? (
//             <p className="text-sky-500 font-serif text-sm mt-2">اسقط الملف هنا...</p>
//           ) : (
//             <p className="text-sky-500 font-serif font-extrabold text-sm mt-2">
//               اختار الملف | سحب وإفلات
//             </p>
//           )}
//           <p className="text-xs text-gray-500 font-serif font-bold mt-1">فقط ملفات PDF (بحد أقصى 10 ميجابايت)</p>
//         </div>
//       </div>

//       {/* Accepted Files */}


// {files.map((file) => (
//         <div
//           key={file.name}
//           className="relative w-full h-[200px] rounded-lg overflow-hidden border shadow-md"
//         >
//           {/* Iframe */}
//           <iframe
//             src={file.preview}
//             className="absolute inset-0 w-full h-full border-0"
//             title={`معاينة ${file.name}`}
//           />

//           {/* Centered icons */}
//           <div className="absolute inset-0 z-10 flex  items-center justify-end pointer-events-none">
//             <div className="flex flex-col gap-4 bg-transparent  p-3 rounded-xl shadow-lg pointer-events-auto">
              
//               <Popover>
//   <PopoverTrigger asChild>
//     <button
//       type="button"
//       className="bg-sky-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-sky-600 transition-colors"
//       aria-label="عرض ملف PDF"
//     >
//       <FileText className="w-4 h-4" />
//     </button>
//   </PopoverTrigger>

//   <PopoverContent
//     className="relative resize overflow-auto bg-white shadow-lg rounded-lg w-[min(90vw,700px)] h-[400px] p-0"
//     side="top"
//     align="end"
//   >
//     {/* Full iframe behind icons (if needed) */}
//     <iframe
//       src={file.preview}
//       className="w-full h-full border-0"
//       title={`معاينة ${file.name}`}
//       key={file.preview}
//     />

//     {/* Optional: resize corner handle visual */}
//     <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-gray-400 pointer-events-none" />
//   </PopoverContent>
// </Popover>


//               <Trash2
//                 className="w-6 h-6 text-red-600 cursor-pointer hover:scale-110 transition"
//                 onClick={() => removeFile(file.name)}
//                // title="حذف الملف"
//               />
//             </div>
//           </div>
//         </div>
//       ))}


//     </div>
//   );
// };

// export default DropzoneComponent;