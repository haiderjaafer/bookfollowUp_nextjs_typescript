'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { CircleOff, Search } from 'lucide-react';
import BookNoCombobox from '../BookNoComboboxComponent';
import IncomingNoCombobox from '../IncomingNoComponent';
import DirectoryNameCombobox from '../DirectoryNameSearchComponent';
import { BookFollowUpData, orderHeaderMap } from '@/components/DynamicTableTanStack/types';
import SubjectSearchCombobox from '../SubjectSearchComboBox';

const DynamicTable = dynamic(() => import('@/components/DynamicTableTanStack/DynamicTableWithPagination'), {
  ssr: false,
  loading: () => <div>Loading table...</div>,
});

// Define filter interface for better type safety
interface Filters {
  bookNo: string;
  directoryName: string;
  incomingNo: string;
  bookType: string;
  bookStatus: string;
  subject: string,
}

// Define API response interface
interface ApiResponse {
  data: BookFollowUpData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Constants for better maintainability
const FILTER_FIELDS = {
  bookNo: 'bookNo',
  directoryName: 'directoryName',
  incomingNo: 'incomingNo',
  bookType: 'bookType',
  bookStatus: 'bookStatus',
  subject: 'subject',
} as const;

const SearchPanel = () => {
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    bookNo: '',
    directoryName: '',
    incomingNo: '',
    bookType: '',
    bookStatus: '',
    subject: '',
  });
  const [activeFilters, setActiveFilters] = useState<Filters>({
    bookNo: '',
    directoryName: '',
    incomingNo: '',
    bookType: '',
    bookStatus: '',
    subject: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Memoize API base URL
  const API_BASE_URL = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || '', []);

  // Consolidated filter update handler for pending filters
  const handleSelect = useCallback((field: keyof Filters, value: string) => {
    setPendingFilters((prev) => ({
      ...prev,
      [field]: value,
    } as Filters));
  }, []);

  // Handle reset: clear filters and reset pagination
  const handleReset = useCallback(() => {
    setPendingFilters({
      bookNo: '',
      directoryName: '',
      incomingNo: '',
      bookType: '',
      bookStatus: '',
      subject: '',
    });
    setActiveFilters({
      bookNo: '',
      directoryName: '',
      incomingNo: '',
      bookType: '',
      bookStatus: '',
      subject: '',
    });
    setPage(1);
    setLimit(10); // Reset to default limit
  }, []);

  // Memoize query parameters based on active filters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = { page, limit };
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    return params;
  }, [activeFilters, page, limit]);

  // Fetch function with error handling
  const fetchBookFollowUp = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/api/bookFollowUp/getAll`, {
        params: queryParams,
        timeout: 10000,
      });
      console.log('API Response Data:', response.data.data.map((item) => ({
        bookStatus: item.bookStatus,
        raw: item,
      })));
      return response.data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }, [API_BASE_URL, queryParams]);

  // React Query with optimized configuration
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['orders', queryParams],
    queryFn: fetchBookFollowUp,
    enabled: Object.values(activeFilters).some((value) => !!value) || page > 1 || Object.keys(queryParams).length === 2, // Allow fetch with no filters
   // staleTime: 1000 * 60 * 2, // now 2 minute data will stay in cached after 2 min will bring new data from server
   staleTime: 0 ,  
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // Handle search
  const handleSearch = useCallback(() => {
    setActiveFilters(pendingFilters);
    setPage(1);
  }, [pendingFilters]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle rows per page change
  const handleLimitChange = useCallback((newLimit: number) => {
    if (newLimit >= 1 && newLimit <= 100) {
      setLimit(newLimit);
      setPage(1);
    }
  }, []);

  // Loading and error states
  if (error) {
    return <div className="text-red-500 text-center">Error loading data: {(error as Error).message}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 font-arabic w-full max-w-full mx-auto text-right mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">رقم الكتاب</label>
          <BookNoCombobox
            value={pendingFilters.bookNo}
            onChange={(value) => handleSelect(FILTER_FIELDS.bookNo, value)}
            fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getAllBooksNo`}
          />
        </div>

        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">حالة الكتاب</label>
          <select
            value={pendingFilters.bookStatus}
            onChange={(e) => handleSelect(FILTER_FIELDS.bookStatus, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-arabic text-right"
          >
            <option value="">-- اختر الحالة --</option>
            {['منجز', 'قيد الانجاز', 'مداولة'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">اسم الدائرة</label>
          <DirectoryNameCombobox
            value={pendingFilters.directoryName}
            onChange={(value) => handleSelect(FILTER_FIELDS.directoryName, value)}
            fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getAllDirectoryNames`}
          />
        </div>

        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">نوع الكتاب</label>
          <select
            value={pendingFilters.bookType}
            onChange={(e) => handleSelect(FILTER_FIELDS.bookType, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-arabic text-right"
          >
            <option value="">-- اختر النوع --</option>
            {['خارجي', 'داخلي', 'فاكس'].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">رقم الوارد</label>
          <IncomingNoCombobox
            value={pendingFilters.incomingNo}
            onChange={(value) => handleSelect(FILTER_FIELDS.incomingNo, value)}
            fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getAllIncomingNo`}
          />
        </div>

 <div className="flex flex-col">
          <label className="font-extrabold text-gray-700">الموضوع</label>
          <SubjectSearchCombobox
            value={pendingFilters.subject}
            onChange={(value) => handleSelect(FILTER_FIELDS.subject, value)}
            fetchUrl={`${API_BASE_URL}/api/bookFollowUp/getSubjects`}
          />
        </div>




      </div>

      <div className="w-full flex flex-col sm:flex-row justify-center mt-4 sm:mt-9 gap-2 sm:gap-4">
  <Button
    className="bg-sky-600 hover:bg-sky-700 w-full sm:w-32 md:w-36 lg:w-40 py-2 sm:py-2.5 text-sm sm:text-base font-extrabold focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50"
    onClick={handleSearch}
    disabled={isLoading}
  >
    <span className="flex items-center justify-center">
      <Search className="ml-2 h-5 w-5" /> بحث
    </span>
  </Button>
  <Button
    className="bg-gray-600 hover:bg-gray-700 w-full sm:w-32 md:w-36 lg:w-40 py-2 sm:py-2.5 text-sm sm:text-base font-extrabold focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
    onClick={handleReset}
  >
    <span className="flex items-center justify-center">
      <CircleOff className="ml-2 h-5 w-5" /> إلغاء
    </span>
  </Button>
</div>

      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mt-4"
          >
            Loading...
          </motion.div>
        ) : (
          <DynamicTable
            data={data?.data || []}
            headerMap={orderHeaderMap}
            excludeFields={['checkOrderLink', 'userID','countOfLateBooks','pdfFiles']}
            pagination={{
              page: data?.page || 1,
              limit: data?.limit || 10,
              total: data?.total || 0,
              totalPages: data?.totalPages || 1,
              onPageChange: handlePageChange,
              onLimitChange: handleLimitChange,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPanel;