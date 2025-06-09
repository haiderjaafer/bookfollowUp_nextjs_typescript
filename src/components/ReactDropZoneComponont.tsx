'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone';
import { Upload, FileText, Trash2, Paperclip } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PreviewFile {
  file: File;
  name: string;
  preview: string; // URL for the file
  size: number;
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
        // Revoke URLs for existing files before adding new one
        revokePreviousUrls(files);
        // Create preview for the new file
        const previewFiles = acceptedFiles.map((file) => ({
          file,
          name: file.name,
          preview: URL.createObjectURL(file) + `#${Date.now()}`, // Add timestamp to force iframe refresh
          size: file.size,
        }));
        // Set to single file
        setFiles([previewFiles[0]]);
        onFilesAccepted([acceptedFiles[0]]);
        console.log('New file selected:', previewFiles[0].name, previewFiles[0].preview); // Debug
      }
    },
    [files, onFilesAccepted]
  );

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
    console.log('File removed:', fileName); // Debug
  };

  return (
    <div className='flex items-center justify-between bg-gray-300 rounded-lg'>
      {/* Dropzone Area */}
      <div
        {...getRootProps({
          className: cn(
            'border-2 border-dashed p-6 rounded-md cursor-pointer',
            isDragActive ? 'border-sky-500 bg-sky-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          ),
        })}
      >
        <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
          <Paperclip size={50}  className="w-8 h-8  text-gray-500" />
          {isDragActive ? (
            <p className="text-sky-500 font-serif text-sm mt-2">اسقط الملف هنا...</p>
          ) : (
            <p className="text-sky-500 font-serif font-extrabold text-sm mt-2">
              اختار الملف | سحب وإفلات
            </p>
          )}
          <p className="text-xs text-gray-500 font-serif font-bold mt-1">فقط ملفات PDF (بحد أقصى 10 ميجابايت)</p>
        </div>
      </div>

      {/* Accepted Files */}
      {files.length > 0 && (
        <section className="mt-6">
          {/* <h3 className="font-semibold text-lg font-arabic mb-4 text-right">الملفات المقبولة</h3> */}
          <ul className="grid grid-cols-1 gap-4 ">
            {files.map((file) => (
              <li
                key={file.name}
                className="relative border p-4 rounded-md shadow-sm bg-white flex items-center justify-between"
              >
                {/* File Info */}
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium font-arabic truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-500 font-arabic">
                    {(file.size / 1024).toFixed(2)} كيلوبايت
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {/* PDF Preview Popover */}
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
                      className="w-[min(90vw,500px)] h-[400px] p-0 bg-white shadow-lg rounded-lg overflow-hidden"
                      side="top"
                      align="end"
                    >
                      <iframe
                        src={file.preview}
                        className="w-full h-full border-0"
                        title={`معاينة ${file.name}`}
                        key={file.preview} // Ensure iframe re-renders
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600 transition-colors"
                    aria-label="إزالة الملف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default DropzoneComponent;