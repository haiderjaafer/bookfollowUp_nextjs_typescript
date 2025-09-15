"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMediaQuery } from "react-responsive";
import { AccessorColumnDef, HeaderMap, TableData } from "./types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DynamicTableProps<T extends TableData> {
  data: T[];
  headerMap?: HeaderMap;
  excludeFields?: string[];
}

export default function DynamicTable<T extends TableData>({
  data,
  headerMap = {},
  excludeFields = [],
}: DynamicTableProps<T>) {
  const [isMounted, setIsMounted] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

  const isMobile = useMediaQuery({ maxWidth: 640 }) && isMounted;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const columns = useMemo<ColumnDef<T>[]>(() => {
    if (data.length === 0) return [];

    const firstItem = data[0];
    const generatedColumns = Object.keys(firstItem)
      .filter((key) => !excludeFields.includes(key))
      .map(
        (key) =>
          ({
            accessorKey: key,
            header: headerMap[key] || key,
            cell: ({ row }) => (
              <div className="text-right">
                {row.getValue(key) as string | number | boolean}
              </div>
            ),
          } as AccessorColumnDef<T>)
      );

    // Add the update button column
    const actionColumn: ColumnDef<T> = {
      id: "actions",
      header: "تعديل",
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedRecord(row.original);
              setOpenDialog(true);
            }}
          >
            تعديل
          </Button>
        </div>
      ),
    };

    return [...generatedColumns, actionColumn];
  }, [data, headerMap, excludeFields]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Desktop view
  if (!isMounted || !isMobile) {
    return (
      <div className="overflow-x-auto p-4" dir="rtl">
        {data.length === 0 ? (
          <div className="p-4 text-gray-500 text-right">
            لا توجد بيانات متاحة
          </div>
        ) : (
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-100">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2 text-right text-sm font-medium text-gray-900 border border-gray-200"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                      className="px-4 py-2 text-right text-sm text-gray-700 border border-gray-200"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                تعديل الطلبية
              </DialogTitle>
            </DialogHeader>
            {selectedRecord ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto text-right">
                {Object.entries(selectedRecord).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b pb-1 text-sm"
                  >
                    <span className="font-medium text-gray-800">
                      {headerMap[key] || key}:
                    </span>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>لا توجد بيانات</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Mobile view
  return (
    <div className="space-y-4 p-4">
      {data.length === 0 ? (
        <div className="p-4 text-gray-500 text-right">لا توجد بيانات متاحة</div>
      ) : (
        data.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm"
            dir="rtl"
          >
            {columns.map((column) => {
              if (
                "accessorKey" in column &&
                typeof column.accessorKey === "string"
              ) {
                return (
                  <div key={column.accessorKey} className="mb-2 flex justify-between">
                    <strong className="text-gray-900">
                      {column.header as string}:
                    </strong>
                    <span className="text-gray-700">
                      {item[column.accessorKey as keyof T] as
                        | string
                        | number
                        | boolean}
                    </span>
                  </div>
                );
              }
              if (column.id === "actions") {
                return (
                  <div key="actions" className="mt-2 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRecord(item);
                        setOpenDialog(true);
                      }}
                    >
                      تعديل
                    </Button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))
      )}

      {/* Dialog for mobile */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              تعديل الطلبية
            </DialogTitle>
          </DialogHeader>
          {selectedRecord ? (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto text-right">
              {Object.entries(selectedRecord).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between border-b pb-1 text-sm"
                >
                  <span className="font-medium text-gray-800">
                    {headerMap[key] || key}:
                  </span>
                  <span className="text-gray-600">{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>لا توجد بيانات</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



