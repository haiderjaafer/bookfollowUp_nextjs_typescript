'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios, { AxiosError, CancelTokenSource } from 'axios';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { BookFollowUpData, orderHeaderMap } from '@/components/DynamicTableTanStack/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const DynamicTable = dynamic(() => import('@/components/DynamicTableTanStack/DynamicTableWithPagination'), {
  ssr: false,
  loading: () => (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  ),
});

interface LateBooksResponse {
  data: BookFollowUpData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface userIDProp {
  userID: string;
}

const LateBooksTable = ({ userID }: userIDProp) => {
  const [data, setData] = useState<LateBooksResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Refs for request management
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);

  console.log("LateBooksTable - userID:", userID);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      // Cancel any pending requests
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
      // Clear any timeouts
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  // Validate userID
  useEffect(() => {
    if (!userID || userID === 'undefined' || userID === 'null') {
      setError('معرف المستخدم مطلوب');
      if (isInitialLoad) {
        toast.error('معرف المستخدم مطلوب', {
          position: 'top-right',
          className: 'font-arabic text-lg',
        });
      }
      return;
    }
    setError(null);
  }, [userID, isInitialLoad]);

  // Optimized fetch function with request cancellation
  const fetchLateBooks = useCallback(
    async (targetPage: number, targetLimit: number, showToast: boolean = false) => {
      if (!userID || userID === 'undefined' || userID === 'null') {
        console.error('Cannot fetch late books: invalid userID');
        return;
      }

      // Cancel previous request if exists
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('New request initiated');
      }

      // Create new cancel token
      cancelTokenRef.current = axios.CancelToken.source();

      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching late books - userID: ${userID}, page: ${targetPage}, limit: ${targetLimit}`);
        
        const response = await axios.get<LateBooksResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/lateBooks`,
          { 
            params: { 
              page: targetPage, 
              limit: targetLimit, 
              userID: parseInt(userID)
            },
            timeout: 8000, // Reduced timeout for faster response
            cancelToken: cancelTokenRef.current.token // Add cancel token
          }
        );

        // Only update state if component is still mounted
        if (!isComponentMountedRef.current) return;

        console.log('API Response:', {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          dataLength: response.data.data.length
        });

        setData(response.data);
        
        // Show toast only when explicitly requested (initial load or refresh)
        if (showToast) {
          if (response.data.data.length > 0) {
            toast.warn(`يوجد ${response.data.total} كتب متأخرة !`, {
              position: 'top-right',
              className: 'font-arabic text-lg',
              autoClose: 3000,
            });
          } else {
            toast.info('لا توجد كتب متأخرة', {
              position: 'top-right',
              className: 'font-arabic text-lg',
              autoClose: 2000,
            });
          }
        }

        // Handle page overflow
        if (response.data.totalPages > 0 && targetPage > response.data.totalPages) {
          console.log(`Page ${targetPage} exceeds totalPages ${response.data.totalPages}`);
          setPage(response.data.totalPages);
        }

        // Mark initial load as complete
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
        
      } catch (error: unknown) {
        // Only handle error if component is still mounted and request wasn't cancelled
        if (!isComponentMountedRef.current) return;
        
        if (axios.isCancel(error)) {
          console.log('Request cancelled:', error.message);
          return;
        }

        console.error('Error fetching late books:', error);
        
        if (error instanceof AxiosError) {
          console.error('Axios error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });

          // Handle specific error cases
          let errorMessage = 'فشل تحميل الكتب المتأخرة';
          
          if (error.response?.status === 404) {
            errorMessage = 'البيانات غير موجودة';
          } else if (error.response?.status === 400) {
            errorMessage = 'خطأ في البيانات المرسلة';
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'انتهت مهلة الاتصال';
          }

          setError(errorMessage);
          
          // Only show toast for initial load or major errors
          if (isInitialLoad || showToast) {
            toast.error(errorMessage, {
              position: 'top-right',
              className: 'font-arabic text-lg',
            });
          }
        }
        
        // Set empty data on error
        setData({ data: [], total: 0, page: targetPage, limit: targetLimit, totalPages: 1 });
      } finally {
        // Only update loading state if component is still mounted
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [userID, isInitialLoad]
  );

  // Debounced fetch with shorter delay for pagination
  const debouncedFetch = useMemo(() => {
    return (targetPage: number, targetLimit: number, showToast: boolean = false) => {
      // Clear previous timeout
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      
      // Use shorter delay for pagination (100ms) vs initial load (300ms)
      const delay = isInitialLoad ? 300 : 100;
      
      requestTimeoutRef.current = setTimeout(() => {
        fetchLateBooks(targetPage, targetLimit, showToast);
      }, delay);
    };
  }, [fetchLateBooks, isInitialLoad]);

  // Effect for initial load and userID changes
  useEffect(() => {
    if (userID && userID !== 'undefined' && userID !== 'null') {
      console.log(`Initial load - userID: ${userID}`);
      debouncedFetch(1, limit, true); // Show toast on initial load
      setPage(1); // Reset page on userID change
    }
  }, [userID, limit, debouncedFetch]);

  // Effect for page changes (without toast)
  useEffect(() => {
    if (!isInitialLoad && userID && userID !== 'undefined' && userID !== 'null') {
      console.log(`Page change - page: ${page}, limit: ${limit}`);
      debouncedFetch(page, limit, false); // No toast for pagination
    }
  }, [page, debouncedFetch, isInitialLoad, userID, limit]);

  // Optimized page change handler
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage === page) return; // Prevent unnecessary updates
    
    console.log(`Page change requested: ${page} -> ${newPage}`);
    setPage(newPage);
  }, [page]);

  // Optimized limit change handler
  const handleLimitChange = useCallback((newLimit: number) => {
    if (newLimit === limit) return; // Prevent unnecessary updates
    
    console.log(`Limit change: ${limit} -> ${newLimit}`);
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, [limit]);

  // Show error state
  if (error && !loading && !data) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Card className="p-8 text-center bg-white shadow-sm max-w-md w-full">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setIsInitialLoad(true);
              fetchLateBooks(page, limit, true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <header className="p-4">
        <h1 className="text-3xl font-bold text-right text-gray-800">
          الكتب المتأخرة
        </h1>
        {data && (
          <p className="text-sm text-gray-600 text-right mt-2">
            إجمالي الكتب: {data.total} | الصفحة: {data.page} من {data.totalPages}
          </p>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col px-4 pb-1 max-w-8xl mx-auto w-full">
        {loading && !data ? (
          // Show skeleton only on initial load
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : !data || data.data.length === 0 ? (
          // Empty state
          <div className="flex-grow flex items-center justify-center">
            <Card className="p-8 text-center bg-white shadow-sm max-w-md w-full">
              <Image
                src="/no-data.png"
                alt="لا توجد كتب متأخرة"
                width={200}
                height={200}
                className="mx-auto mb-4"
              />
              <p className="text-lg text-gray-600">لا توجد كتب متأخرة حالياً</p>
              {data?.total === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  لا توجد كتب بحالة &ldquo;قيد الإنجاز&rdquo; لهذا المستخدم
                </p>
              )}
            </Card>
          </div>
        ) : (
          // Table container with loading overlay
          <div className="relative flex">
            {/* Loading overlay for pagination */}
            {loading && data && (
              <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center rounded-lg">
                <div className="bg-white p-3 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm text-gray-600">جاري التحميل...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="sticky bottom-0 bg-white z-10 rounded-lg shadow-md w-full">
              <DynamicTable
                data={data.data}
                headerMap={orderHeaderMap}
                excludeFields={['userID', 'pdfFiles', 'deID', 'id', 'destination']}
                pagination={{
                  page: data.page,
                  limit: data.limit,
                  total: data.total,
                  totalPages: data.totalPages,
                  onPageChange: handlePageChange,
                  onLimitChange: handleLimitChange,
                }}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default LateBooksTable;