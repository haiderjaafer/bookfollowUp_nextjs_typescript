'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

// Define the data structure for type safety
interface BookData {
  bookType: string;
  bookStatus: string;
  // Add more fields as needed
  [key: string]: string | number | boolean;
}

// Available options with Arabic labels and English values for URL compatibility
const BOOK_TYPE_OPTIONS = [
  { label: 'خارجي', value: 'external' },
  { label: 'داخلي', value: 'internal' }
];

const BOOK_STATUS_OPTIONS = [
  { label: 'منجز', value: 'completed' },
  { label: 'قيد الانجاز', value: 'in_progress' },
  { label: 'مداولة', value: 'under_review' }
];

export default function SenderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state management
  const [formData, setFormData] = useState<BookData>({
    bookType: '',
    bookStatus: '',
  });

  // Handle form input changes with type safety
  const handleInputChange = useCallback((field: keyof BookData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Utility function to build query string from data object
  const buildQueryString = useCallback((data: BookData): string => {
    const params = new URLSearchParams();
    
    // Only add non-empty values to query string
    Object.entries(data).forEach(([key, value]) => {
      if (value && value.toString().trim() !== '') {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  }, []);

  // Send data to receiver page using query string
  const sendDataToReceiver = useCallback(async (openInNewTab: boolean = false) => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.bookType || !formData.bookStatus) {
        alert('يرجى تحديد نوع الكتاب وحالته');
        return;
      }

      // Build query string
      const queryString = buildQueryString(formData);
      const targetUrl = `/receiver?${queryString}`;
      
      if (openInNewTab) {
        // Method 1: Open in new tab using window.open
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Navigate to receiver page in same tab
        // Using router.push for client-side navigation in Next.js 15
        await router.push(targetUrl);
      }
      
    } catch (error) {
      console.error('Error sending data:', error);
      alert('حدث خطأ أثناء إرسال البيانات');
    } finally {
      setLoading(false);
    }
  }, [formData, buildQueryString, router]);

  // Open print report in new tab without navbar
  const openPrintReport = useCallback(async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.bookType || !formData.bookStatus) {
        alert('يرجى تحديد نوع الكتاب وحالته');
        return;
      }

      // Build query string with form data
      const queryString = buildQueryString(formData);
      const printUrl = `/print/report?${queryString}`;
      
      // Open print report in new tab with specific window features for printing
      const printWindow = window.open(
        printUrl, 
        '_blank', 
        'noopener,noreferrer,width=1400,height=800,scrollbars=yes,resizable=yes,'
      );
      
      // Check if popup was blocked
      if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
        // Fallback method for blocked popups
        const link = document.createElement('a');
        link.href = printUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Focus on the new print window
        printWindow.focus();
      }
      
    } catch (error) {
      console.error('Error opening print report:', error);
      alert('حدث خطأ أثناء فتح تقرير الطباعة');
    } finally {
      setLoading(false);
    }
  }, [formData, buildQueryString]);

  // Alternative method using programmatic link creation
  const openInNewTabAlternative = useCallback(async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.bookType || !formData.bookStatus) {
        alert('يرجى تحديد نوع الكتاب وحالته');
        return;
      }

      // Build query string
      const queryString = buildQueryString(formData);
      
      // Method 2: Create a temporary link element and click it
      const link = document.createElement('a');
      link.href = `/receiver?${queryString}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error opening new tab:', error);
      alert('حدث خطأ أثناء فتح التبويب الجديد');
    } finally {
      setLoading(false);
    }
  }, [formData, buildQueryString]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      bookType: '',
      bookStatus: '',
    });
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          إرسال بيانات الكتاب
        </h1>

        {/* Book Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الكتاب (Book Type)
          </label>
          <select
            value={formData.bookType}
            onChange={(e) => handleInputChange('bookType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">اختر نوع الكتاب</option>
            {BOOK_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Book Status Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            حالة الكتاب (Book Status)
          </label>
          <select
            value={formData.bookStatus}
            onChange={(e) => handleInputChange('bookStatus', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">اختر حالة الكتاب</option>
            {BOOK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => sendDataToReceiver(false)}
            disabled={loading || !formData.bookType || !formData.bookStatus}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              loading || !formData.bookType || !formData.bookStatus
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال البيانات'}
          </button>

          <button
            onClick={() => sendDataToReceiver(true)}
            disabled={loading || !formData.bookType || !formData.bookStatus}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              loading || !formData.bookType || !formData.bookStatus
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500'
            }`}
          >
            {loading ? 'جاري الفتح...' : 'فتح في تبويب جديد'}
          </button>

          <button
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            إعادة تعيين
          </button>
        </div>

        {/* Print Report Button */}
        <div className="mt-4">
          <button
            onClick={openPrintReport}
            disabled={loading || !formData.bookType || !formData.bookStatus}
            className={`w-full py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              loading || !formData.bookType || !formData.bookStatus
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500'
            }`}
          >
            {/* Print Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {loading ? 'جاري فتح التقرير...' : 'فتح تقرير الطباعة'}
          </button>
        </div>

        {/* Preview of current selection */}
        {(formData.bookType || formData.bookStatus) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              معاينة البيانات المحددة:
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              {formData.bookType && (
                <div>
                  <strong>نوع الكتاب:</strong>{' '}
                  {BOOK_TYPE_OPTIONS.find(opt => opt.value === formData.bookType)?.label}
                </div>
              )}
              {formData.bookStatus && (
                <div>
                  <strong>حالة الكتاب:</strong>{' '}
                  {BOOK_STATUS_OPTIONS.find(opt => opt.value === formData.bookStatus)?.label}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}