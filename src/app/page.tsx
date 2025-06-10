'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import { orderHeaderMap } from '@/components/DynamicTableTanStack/types';
import dynamic from 'next/dynamic';

const DynamicTable = dynamic(() => import('@/components/DynamicTableTanStack/DynamicTableWithPagination'), {
  ssr: false,
  loading: () => <div>Loading table...</div>,
});


interface LateBook {
  id: number;
  bookType: string | null;
  bookNo: string | null;
  bookDate: string | null;
  directoryName: string | null;
  incomingNo: string | null;
  incomingDate: string | null;
  subject: string | null;
  destination: string | null;
  bookAction: string | null;
  bookStatus: string | null;
  notes: string | null;
  countOfLateBooks: number;
  currentDate: string | null;
  userID: number | null;
}

interface LateBooksResponse {
  data: LateBook[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Home = () => {
  const [data, setData] = useState<LateBooksResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  // Fetch late books
  const fetchLateBooks = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await axios.get<LateBooksResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/lateBooks`,
        { params: { page, limit } }
      );
      setData(response.data);
      if (response.data.data.length > 0) {
        toast.warn(`يوجد ${response.data.total} كتاب متأخر!`);
      } else {
        toast.info('لا توجد كتب متأخرة');
      }
    } catch (error) {
      console.error('Error fetching late books:', error);
      toast.error('فشل تحميل الكتب المتأخرة');
      setData({ data: [], total: 0, page: 1, limit, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and on page/limit change
  useEffect(() => {
    fetchLateBooks(page, limit);
  }, [page, limit]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to page 1 on limit change
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-arabic font-bold mb-6 text-right">الكتب المتأخرة</h1>
      {loading ? (
        <p className="text-center font-arabic">جاري التحميل...</p>
      ) : (
        <DynamicTable
          data={data?.data || []}
          headerMap={orderHeaderMap}
          excludeFields={['checkOrderLink', 'userID']}
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
    </div>
  );
};

export default Home;