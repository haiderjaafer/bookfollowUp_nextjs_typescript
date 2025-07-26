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

interface BookTypeCounts {
  External: number;
  Internal: number;
  Fax: number;
}

interface BookStatusCounts {
  Accomplished: number;
  Pending: number;
  Deliberation: number;
}

interface UserBookCount {
  username: string;
  bookCount: number;
}

const Home = () => {
  const [data, setData] = useState<LateBooksResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const maxRetries = 2;

  const [bookTypeCounts, setBookTypeCounts] = useState<BookTypeCounts>({ 
    External: 0, 
    Internal: 0, 
    Fax: 0 
  });
  const [bookStatusCounts, setBookStatusCounts] = useState<BookStatusCounts>({
    Accomplished: 0,
    Pending: 0,
    Deliberation: 0,
  });
  const [userBookCounts, setUserBookCounts] = useState<UserBookCount[]>([]);
  const [loadingCountBooksStatistics, setLoadingCountBooksStatistics] = useState(true);

  // Fetch statistics counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoadingCountBooksStatistics(true);

        // Fetch book type counts
        const typeResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/counts/book-type`,
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        setBookTypeCounts(typeResponse.data);
        console.log('Book type counts:', typeResponse.data);

        // Fetch book status counts
        const statusResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/counts/book-status`,
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        setBookStatusCounts(statusResponse.data);
        console.log('Book status counts:', statusResponse.data);

        // Fetch user book counts
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/counts/user-books`,
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        setUserBookCounts(userResponse.data);
        console.log('User book counts:', userResponse.data);

      } catch (err: unknown) {
        console.error('Error fetching counts:', err);
        
        // Type guard to check if it's an AxiosError
        if (err instanceof AxiosError) {
          console.log('Error status:', err.response?.status);
          console.log('Error detail:', err.response?.data?.detail);
          toast.error(err.response?.data?.detail || 'Failed to load books statistics');
        } else {
          // Handle non-Axios errors
          const errorMessage = err instanceof Error ? err.message : 'Failed to load books statistics';
          console.log('Non-Axios error:', errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoadingCountBooksStatistics(false);
      }
    };

    fetchCounts();
  }, []);

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
          toast.warn(`يوجد ${response.data.total} كتاب متأخر!`, {
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
    // CHANGED: Added flexbox layout for full-screen height and sticky table
    <div className="flex flex-col min-h-screen bg-gray-50 font-serif" dir="rtl">
      {/* CHANGED: Header section with title */}




       

    

       <section className="min-h-[20vh] bg-gray-200 flex justify-center items-start flex-wrap gap-1 py-4">
 

 <article className="transition-all duration-300 ease-in-out group-hover:opacity-40 hover:!opacity-100 
  bg-red-400 w-full sm:w-60 h-24 rounded-md text-center font-extrabold p-2 
  flex flex-col justify-between hover:bg-red-300">
  <div className="text-base">نوع الكتاب</div>
  <hr className="mx-10 border-t-4 rounded-full border-white" />
  <div className="flex justify-around text-xs sm:text-sm mt-1">
    <div className="flex flex-col items-center">
      <span>خارجي</span>
      <span className="text-white">{loadingCountBooksStatistics ? '...' : bookTypeCounts.External}</span>
    </div>
    <div className="flex flex-col items-center">
      <span>داخلي</span>
      <span className="text-white">{loadingCountBooksStatistics ? '...' : bookTypeCounts.Internal}</span>
    </div>
    <div className="flex flex-col items-center">
      <span>فاكس</span>
      <span className="text-white">{loadingCountBooksStatistics ? '...' : bookTypeCounts.Fax}</span>
    </div>
  </div>
</article>

<article className="transition-all duration-300 ease-in-out group-hover:opacity-40 hover:!opacity-100 
  bg-red-400 w-full sm:w-60 h-24 rounded-md text-center font-extrabold p-2 
  flex flex-col justify-between hover:bg-red-300">
  <div className="text-base">حالة الكتب</div>
  <hr className="mx-10 border-t-4 rounded-full border-white" />
  <div className="flex justify-around text-xs sm:text-sm mt-1">
    <div className="flex flex-col items-center">
      <span>الكتب المنجزة</span>
      <span className="text-white">{loadingCountBooksStatistics ? '...' : bookStatusCounts.Accomplished}</span>
    </div>
    <div className="flex flex-col items-center">
      <span>كتب قيد الانجاز</span>
      <span className="text-white">{loadingCountBooksStatistics ? '...' : bookStatusCounts.Pending}</span>
    </div>
    <div className="flex flex-col items-center">
      <span>مداولة</span>
      <span className="text-white">{loadingCountBooksStatistics ? '...' : bookStatusCounts.Deliberation}</span>
    </div>
  </div>
</article>

 
 <article className="transition-all duration-300 ease-in-out group-hover:opacity-40 hover:!opacity-100 
  bg-red-400 w-full sm:w-60 h-24 rounded-md text-center font-extrabold text-base 
  hover:bg-red-300 p-2 flex flex-col justify-between ">
  <div>المستخدم</div>
  <hr className="mx-10 border-t-4 rounded-full border-white" />
  <div className="flex justify-around text-xs sm:text-sm mt-1 ">
    {loadingCountBooksStatistics ? (
      <span>...</span>
    ) : userBookCounts.length > 0 ? (
      userBookCounts.slice(0, 3).map((user, index) => (
        <div key={index} className="flex flex-col items-center ">
          <span >{user.username}</span>
          <span className="text-white">{user.bookCount}</span>
        </div>
      ))
    ) : (
      <span>لا يوجد بيانات</span>
    )}
  </div>
</article>

 
</section> 



      <header className="p-4">
        <h1 className="text-3xl font-bold text-right text-gray-800">
          الكتب المتأخرة
        </h1>
      </header>
      {/* CHANGED: Main content with flex-grow to push table to bottom */}
      <main className="flex-grow flex flex-col px-4 pb-1 max-w-8xl mx-auto w-full">
        {loading ? (
          // CHANGED: Loading skeleton remains the same
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : !data || data.data.length === 0 ? (
          // CHANGED: Empty state moved to center vertically
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
          // CHANGED: Table container with sticky positioning
   <div className="relative flex">
  <div className="sticky bottom-0 bg-white z-10 rounded-lg shadow-md  w-full">
    <DynamicTable
      data={data.data}
      headerMap={orderHeaderMap}
      excludeFields={['userID', 'pdfFiles','deID']}
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
      
     
    </div>

   

  );
};

export default Home;