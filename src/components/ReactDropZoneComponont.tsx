"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone, FileRejection, DropzoneOptions } from "react-dropzone";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface PreviewFile {
  file: File;
  name: string;
  preview: string;
  size: number;
}

interface DropzoneComponentProps {
  onFilesAccepted: (files: File[]) => void; // Function to pass selected files to the parent component
  onFileRemoved: (fileName: string) => void; // Function to notify parent when a file is removed
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  onFilesAccepted,
  onFileRemoved,
}) => {
  const [files, setFiles] = useState<PreviewFile[]>([]);

  const onDrop = useCallback<NonNullable<DropzoneOptions["onDrop"]>>(
    (acceptedFiles) => {
      if (acceptedFiles.length) {
        const previewFiles = acceptedFiles.map((file) => ({
          file,
          name: file.name,
          preview: URL.createObjectURL(file),
          size: file.size,
        }));
        setFiles((prev) => prev.concat(previewFiles));
        onFilesAccepted(acceptedFiles); // Pass the accepted files to the parent
      }
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [] },
    maxSize: 10 * 1024 * 1024, // 10 MB max size
    onDrop,
  });

  useEffect(() => {
    // Clean up previews to avoid memory leaks
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
    onFileRemoved(fileName); // Notify parent when a file is removed
  };

  return (
    <div>
      <div
        {...getRootProps({
          className: `border-2 border-dashed p-6 rounded-md cursor-pointer`,
        })}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center text-center">
          <ArrowUpTrayIcon className="w-8 h-8 text-gray-500" />
          {isDragActive ? (
            <p className="text-blue-500">Drop the file here...</p>
          ) : (
            <p className="text-blue-500 font-extrabold italic text-lg">
              اختار الملف | سحب وافلات
            </p>
          )}
        </div>
      </div>

      <section className="mt-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">الملفات المقبولة</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file) => (
              <li
                key={file.name}
                className="relative border p-4 rounded-md shadow"
              >
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  className="absolute top-1 left-1 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DropzoneComponent;
