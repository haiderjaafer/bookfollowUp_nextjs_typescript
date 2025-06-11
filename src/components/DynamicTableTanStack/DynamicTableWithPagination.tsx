'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useMediaQuery } from 'react-responsive';
import { AccessorColumnDef, HeaderMap, BookFollowUpData, PDF } from './types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { toast } from 'react-toastify';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

interface DynamicTableProps<T extends BookFollowUpData> {
  data: T[];
  headerMap?: HeaderMap;
  excludeFields?: string[];
  pagination?: Pagination;
}

export default function DynamicTable<T extends BookFollowUpData>({
  data,
  headerMap = {},
  excludeFields = [],
  pagination,
}: DynamicTableProps<T>) {
  const [isMounted, setIsMounted] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);
  const [selectedPdfs, setSelectedPdfs] = useState<PDF[]>([]);

  const isMobile = useMediaQuery({ maxWidth: 640 }) && isMounted;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dynamic truncation for long text fields
  const truncateText = useCallback((text: string, maxWords: number = 3) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return `${words.slice(0, maxWords).join(' ')}...`;
  }, []);

  // Determine if a field should be truncated (string fields with potential long text)
  const shouldTruncate = useCallback((key: string) => {
    return [
      'notes',
      'directoryName',
      'subject',
      'bookAction',
      'destination',
    ].includes(key);
  }, []);

  // Get background color for bookStatus
  const getStatusBackgroundColor = useCallback(
    (status: string | null | undefined) => {
      const normalizedStatus = status?.trim().toLowerCase() ?? '';
      switch (normalizedStatus) {
        case 'منجز':
          return 'bg-green-200 text-black text-lg font-extrabold';
        case 'قيد الانجاز':
          return 'bg-red-200 text-black text-lg font-extrabold';
        case 'مداولة':
          return 'bg-gray-200 text-black text-lg font-extrabold';
        default:
          console.warn('Unknown bookStatus:', normalizedStatus);
          return 'bg-gray-200 text-gray-700 text-lg font-extrabold';
      }
    },
    []
  );

  const columns = useMemo<ColumnDef<T>[]>(() => {
    if (data.length === 0) return [];

    const firstItem = data[0];
    const generatedColumns = Object.keys(firstItem)
      .filter((key) => !excludeFields.includes(key))
      .map((key) => {
        const columnDef: AccessorColumnDef<T> = {
          accessorKey: key,
          header: headerMap[key] || key,
          cell: ({ row }) => {
            const value = row.getValue(key);
            const valueStr = String(value ?? '');

            // Handle bookStatus with background color
            if (key === 'bookStatus') {
              const status = valueStr;
              const bgColorClass = getStatusBackgroundColor(status);
              return (
                <div
                  className={`text-right px-2 py-1 rounded-lg w-20 ${bgColorClass}`}
                >
                  {valueStr}
                </div>
              );
            }

            // Handle date fields with fixed width
            if (key === 'bookDate' || key === 'incomingDate') {
              return (
                <div className="text-right px-1 py-1 rounded-lg w-32">
                  {valueStr}
                </div>
              );
            }

            // Handle truncatable fields dynamically
            if (shouldTruncate(key)) {
              const truncatedText = truncateText(valueStr);
              return (
                <div className="text-right max-w-[200px] relative group">
                  <span className="truncate block">{truncatedText}</span>
                  <span className="absolute z-10 right-0 top-full mt-1 p-2 bg-gray-800 text-white text-sm font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-pre-wrap max-w-xs">
                    {valueStr}
                  </span>
                </div>
              );
            }

            return <div className="text-right">{valueStr}</div>;
          },
          size: 0,
        };

        // Assign column widths
        if (shouldTruncate(key)) {
          columnDef.size = 200;
        } else if (
          ['bookNo', 'bookDate', 'bookStatus', 'incomingDate'].includes(key)
        ) {
          columnDef.size = 100;
        } else {
          columnDef.size = 120;
        }

        return columnDef;
      });

    const actionColumn: ColumnDef<T> = {
      id: 'actions',
      header: 'الإجراءات',
      size: 120,
      cell: ({ row }) => {
        const pdfFiles = row.original.pdfFiles || [];
        return (
          <div className="text-right flex gap-2">
            <Button
              className="font-extrabold"
              variant="outline"
              onClick={() => {
                setSelectedRecord(row.original);
                setEditDialogOpen(true);
              }}
            >
              تعديل
            </Button>
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => {
                if (pdfFiles.length === 0) {
                  toast.info('لا توجد ملفات PDF لهذا السجل');
                } else {
                  setSelectedPdfs(pdfFiles);
                  setPdfDialogOpen(true);
                }
              }}
              title="عرض ملفات PDF"
            >
              <FileText className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        );
      },
    };

    return [...generatedColumns, actionColumn];
  }, [data, headerMap, excludeFields, getStatusBackgroundColor, shouldTruncate, truncateText]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    defaultColumn: {
      size: 120,
      minSize: 50,
      maxSize: 400,
    },
  });

  // Pagination UI with ellipses
  const renderPagination = useCallback(() => {
    if (!pagination) return null;

    const { page, totalPages, onPageChange, onLimitChange, limit } = pagination;
    const pageButtons = [];

    const maxVisibleButtons = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    if (startPage > 1) {
      pageButtons.push(
        <Button
          key={1}
          variant={1 === page ? 'default' : 'outline'}
          onClick={() => onPageChange(1)}
          className="mx-1 font-bold"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pageButtons.push(<span key="start-ellipsis" className="mx-1">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={i === page ? 'default' : 'outline'}
          onClick={() => onPageChange(i)}
          className="mx-1 font-bold"
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(<span key="end-ellipsis" className="mx-1">...</span>);
      }
      pageButtons.push(
        <Button
          key={totalPages}
          variant={totalPages === page ? 'default' : 'outline'}
          onClick={() => onPageChange(totalPages)}
          className="mx-1 font-bold"
        >
          {totalPages}
        </Button>
      );
    }

    return (
      <div className="flex flex-col items-center mt-4 gap-2">
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">الصفوف لكل صفحة:</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-[100px] font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20].map((option) => (
                  <SelectItem
                    key={option}
                    value={option.toString()}
                    className="font-bold"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="font-bold"
          >
            السابق
          </Button>
          {pageButtons}
          <Button
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="font-bold"
          >
            التالي
          </Button>
        </div>
      </div>
    );
  }, [pagination]);

  // Desktop view
  if (!isMounted || !isMobile) {
    return (
      <div className="overflow-x-auto p-4" dir="rtl">
        {data.length === 0 ? (
          <div className="p-4 text-gray-500 text-right">لا توجد بيانات متاحة</div>
        ) : (
          <table
            className="min-w-full table-auto border-collapse border border-gray-200"
            style={{ width: table.getTotalSize() }}
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-300">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2 text-right text-lg font-extrabold text-gray-900 border border-gray-200"
                      style={{ width: header.column.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 text-right text-lg font-bold text-gray-700 border border-gray-200"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {renderPagination()}
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">تعديل الكتاب</DialogTitle>
            </DialogHeader>
            {selectedRecord ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto text-right">
                {Object.entries(selectedRecord)
                  .filter(([key]) => key !== 'pdfFiles')
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b pb-1 text-sm"
                    >
                      <span className="font-medium text-gray-800">
                        {headerMap[key] || key}:
                      </span>
                      <span className="text-gray-600">{String(value ?? '')}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div>لا توجد بيانات</div>
            )}
          </DialogContent>
        </Dialog>
        {/* PDF Dialog will show all pdf  */}
       <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
  <DialogContent className="sm:max-w-[600px]" dir="rtl">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold">ملفات PDF المرتبطة</DialogTitle>
    </DialogHeader>
    {selectedPdfs.length > 0 ? (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto text-right">
        {selectedPdfs.map((pdf) => (
          <div key={pdf.id} className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">معرف الملف: {pdf.id}</p>
                <p className="text-xs text-gray-500">تاريخ: {pdf.currentDate || 'غير متوفر'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="font-bold"
              onClick={() => {
                window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/pdf/${pdf.id}`);
              }}
            >
              فتح
            </Button>
          </div>
        ))}
      </div>
    ) : (
      <div>لا توجد ملفات PDF</div>
    )}
  </DialogContent>
</Dialog>
      </div>
    );
  }

  // Mobile view
  return (
    <div className="space-y-4 p-4" dir="rtl">
      {data.length === 0 ? (
        <div className="p-4 text-gray-500 text-right">لا توجد بيانات متاحة</div>
      ) : (
        data.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 p-4 rounded-md bg-white shadow-sm"
          >
            {columns.map((column) => {
              if (
                'accessorKey' in column &&
                typeof column.accessorKey === 'string'
              ) {
                const key = column.accessorKey;
                const value = item[key as keyof T];
                const valueStr = String(value ?? '');

                if (key === 'bookStatus') {
                  const status = valueStr;
                  const bgColorClass = getStatusBackgroundColor(status);
                  return (
                    <div
                      key={key}
                      className="mb-2 flex justify-between"
                    >
                      <strong className="text-gray-900">
                        {column.header as string}:
                      </strong>
                      <span
                        className={`text-gray-700 px-2 py-1 rounded ${bgColorClass}`}
                      >
                        {valueStr}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={key} className="mb-2 flex justify-between">
                    <strong className="text-gray-900">
                      {column.header as string}:
                    </strong>
                    <span className="text-gray-700">{valueStr}</span>
                  </div>
                );
              }
              if (column.id === 'actions') {
                const pdfFiles = item.pdfFiles || [];
                return (
                  <div key="actions" className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="font-bold"
                      onClick={() => {
                        setSelectedRecord(item);
                        setEditDialogOpen(true);
                      }}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-2"
                      onClick={() => {
                        if (pdfFiles.length === 0) {
                          toast.info('لا توجد ملفات PDF لهذا السجل');
                        } else {
                          setSelectedPdfs(pdfFiles);
                          setPdfDialogOpen(true);
                        }
                      }}
                      title="عرض ملفات PDF"
                    >
                      <FileText className="h-5 w-5 text-gray-600" />
                    </Button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))
      )}
      {renderPagination()}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">تعديل الكتاب</DialogTitle>
          </DialogHeader>
          {selectedRecord ? (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto text-right">
              {Object.entries(selectedRecord)
                .filter(([key]) => key !== 'pdfFiles')
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b pb-1 text-sm"
                  >
                    <span className="font-medium text-gray-800">
                      {headerMap[key] || key}:
                    </span>
                    <span className="text-gray-600">{String(value ?? '')}</span>
                  </div>
                ))}
            </div>
          ) : (
            <div>لا توجد بيانات</div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              ملفات PDF المرتبطة
            </DialogTitle>
          </DialogHeader>
          {selectedPdfs.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto text-right">
              {selectedPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">معرف الملف: {pdf.id}</p>
                      <p className="text-xs text-gray-500">
                        تاريخ: {pdf.currentDate || 'غير متوفر'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="font-bold"
                    onClick={() => {
                      toast.info(`فتح ملف PDF: ${pdf.pdf}`);
                      // Example: window.open(`/api/bookFollowUp/pdf/${pdf.id}`);
                    }}
                  >
                    فتح
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div>لا توجد ملفات PDF</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}