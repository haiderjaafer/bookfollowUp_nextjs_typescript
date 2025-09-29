"use client";

import React from "react";
import { Card } from "@/components/ui/card";
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
  // Transform data for DynamicTable
  const transformedData = {
    data: initialData.data || [],
    page: 1,
    limit: initialData.data?.length || 0,
    total: initialData.data?.length || 0,
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
          <h1 className="text-2xl font-bold text-right">الموضوع: {subject}</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col px-4 pb-1 max-w-8xl mx-auto w-full">
        {!initialData || !initialData.data || initialData.data.length === 0 ? (
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
                excludeFields={['userID', 'pdfFiles', 'departmentID', 'id', 'destination','junctionID','coID','deID','departmentName','all_departments']}
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
    </div>
  );
};

export default BookBySubjectClient;