'use client';

import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Input type for move operation
interface MoveFileParams {
  fileName: string;
  sourceDir: string;
  destinationDir: string;
}

interface MoveResult {
  success: boolean;
  message: string;
  method?: string;
}

export async function moveBookPdfCmd(params: MoveFileParams): Promise<MoveResult> {
  try {
    const response = await fetch('/api/move-book-cmd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`${response.status}: ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export function FileMoverComponent() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMoveBook = async () => {
    setIsLoading(true);
    setStatus('Moving book.pdf using Windows commands...');

    const params: MoveFileParams = {
      fileName: 'book.pdf',
      sourceDir: 'D:\\booksFollowUp\\pdfScanner',
      destinationDir: '\\\\10.20.11.33\\booksFollowUp\\pdfScanner',
    };

    try {
      const result = await moveBookPdfCmd(params);
      if (result.success) {
        setStatus(`${result.message}${result.method ? ` (Method: ${result.method})` : ''}`);
        toast.success(result.message, { position: 'top-right', autoClose: 3000 });
      } else {
        setStatus(result.message);
        if (result.message.includes('Source file') && result.message.includes('not found')) {
          toast.error(`ملف ${params.fileName} غير موجود عند العميل`, { position: 'top-right', autoClose: 5000 });
        } else {
          toast.error(result.message, { position: 'top-right', autoClose: 5000 });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus('Error occurred while moving book.pdf');
      toast.error(errorMessage, { position: 'top-right', autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleMoveBook} disabled={isLoading}>
        {isLoading ? 'Moving...' : 'Move Book PDF'}
      </button>
      {/* <p>{status}</p> */}
      <ToastContainer />
    </div>
  );
}