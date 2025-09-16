"use client";

<<<<<<< HEAD
import React, { useEffect, useState } from "react";

interface Props {
  subject: string;
  initialData: any;
}

const BookBySubjectClient: React.FC<Props> = ({ subject, initialData }) => {
  const [data, setData] = useState(initialData);

  // Example: refresh data on mount (or when subject changes)
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `http://localhost:8000/api/bookFollowUp/getRecordBySubject?subject=${encodeURIComponent(
          subject
        )}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    };

    fetchData();
  }, [subject]);

  return (
    <div className="p-4">
      <h1 className="font-bold mb-4">Subject: {subject}</h1>
      <pre className="bg-gray-100 p-3 rounded-md">
        {JSON.stringify(data, null, 2)}
      </pre>
=======
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { BookFollowUpData, orderHeaderMap } from "./DynamicTableTanStack/types";
import DynamicTable from "./DynamicTableTanStack/DynamicTableWithPagination";


interface ApiResponse {
  data: BookFollowUpData[];
}

interface Props {
  subject: string;
  initialData: ApiResponse;
}

const BookBySubjectClient: React.FC<Props> = ({ subject, initialData }) => {
  const [data, setData] = useState<ApiResponse>(initialData);
  const [loading, setLoading] = useState(false);

  // Decode the URL-encoded subject
  const decodedSubject = decodeURIComponent(subject);

  // Transform data for DynamicTable
  const transformedData = {
    data: data.data || [],
    page: 1,
    limit: data.data?.length || 0,
    total: data.data?.length || 0,
    totalPages: 1,
  };

  const handlePageChange = (page: number) => {
    console.log('Page change:', page);
  };

  const handleLimitChange = (limit: number) => {
    console.log('Limit change:', limit);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-8xl mx-auto">
          <h1 className="text-2xl font-bold">الموضوع: {decodedSubject}</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col px-4 pb-1 max-w-8xl mx-auto w-full">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : !data || !data.data || data.data.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <Card className="p-8 text-center bg-white shadow-sm max-w-md w-full">
              <Image
                src="/no-data.png"
                alt="لا توجد سجلات"
                width={200}
                height={200}
                className="mx-auto mb-4"
              />
              <p className="text-lg text-gray-600">لا توجد سجلات لهذا الموضوع</p>
            </Card>
          </div>
        ) : (
          <div className="relative flex">
            <div className="sticky bottom-0 bg-white z-10 rounded-lg shadow-md w-full">
              <DynamicTable
                data={transformedData.data}
                headerMap={orderHeaderMap}
                excludeFields={['userID', 'pdfFiles', 'departmentID', 'id','destination']}
                pagination={{
                  page: transformedData.page,
                  limit: transformedData.limit,
                  total: transformedData.total,
                  totalPages: transformedData.totalPages,
                  onPageChange: handlePageChange,
                  onLimitChange: handleLimitChange,
                }}
              />
            </div>
          </div>
        )}
      </main>
>>>>>>> 94b62087fcc5d6a9ba0b5a9f464e939e2620b689
    </div>
  );
};

<<<<<<< HEAD
export default BookBySubjectClient;
=======
export default BookBySubjectClient;
>>>>>>> 94b62087fcc5d6a9ba0b5a9f464e939e2620b689
