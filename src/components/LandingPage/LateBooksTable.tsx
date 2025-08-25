'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
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

const LateBooksTable = () => {
  const [data, setData] = useState<LateBooksResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const maxRetries = 2;

  // Fetch late books with retry logic
  const fetchLateBooks = useCallback(
    async (page: number, limit: number, retry: number = 0) => {
      setLoading(true);
      try {
        const response = await axios.get<LateBooksResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/lateBooks`,
          { params: { page, limit } }
        );
        setData(response.data);
        
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
      } catch (error: unknown) {
        console.error('Error fetching late books:', error);
        
        if (error instanceof AxiosError && 
            retry < maxRetries && 
            error.response?.status === 500) {
          setTimeout(() => fetchLateBooks(page, limit, retry + 1), 1000 * (retry + 1));
          return;
        }
        
        toast.error('فشل تحميل الكتب المتأخرة', {
          position: 'top-right',
          className: 'font-arabic text-lg',
        });
        setData({ data: [], total: 0, page: 1, limit, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    },
    [maxRetries]
  );

  // Create debounced fetch function using useMemo
  const debouncedFetch = useMemo(
    () => debounce((page: number, limit: number) => {
      fetchLateBooks(page, limit);
    }, 300),
    [fetchLateBooks]
  );

  // Effect to trigger debounced fetch when page or limit changes
  useEffect(() => {
    debouncedFetch(page, limit);
    return () => debouncedFetch.cancel();
  }, [page, limit, debouncedFetch]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return (
    <>
      <header className="p-4">
        <h1 className="text-3xl font-bold text-right text-gray-800">
          الكتب المتأخرة
        </h1>
      </header>

      {/* Main content with flex-grow to push table to bottom */}
      <main className="flex-grow flex flex-col px-4 pb-1 max-w-8xl mx-auto w-full">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : !data || data.data.length === 0 ? (
          // Empty state moved to center vertically
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
            </Card>
          </div>
        ) : (
          // Table container with sticky positioning
          <div className="relative flex">
            <div className="sticky bottom-0 bg-white z-10 rounded-lg shadow-md w-full">
              <DynamicTable
                data={data.data}
                headerMap={orderHeaderMap}
                excludeFields={['userID', 'pdfFiles','deID','id']}
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