import { JSX } from "react";

import { ColumnDef } from "@tanstack/react-table";

// Define the base TableData type
export interface TableData {
  [key: string]: any;
}

// Extend ColumnDef to include size and other properties
export type AccessorColumnDef<T extends TableData> = ColumnDef<T> & {
  accessorKey: string;
  header: string;
  size?: number; // Explicitly include size
};

// HeaderMap for mapping field names to display names
export interface HeaderMap {
  [key: string]: string;
}



// API response type based on provided example
export interface BookFollowUp {
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
  userID: string | null;
  currentDate: string | null;
}

export const orderHeaderMap: HeaderMap = {
id: "الايدي",
  bookType: "نوع الكتاب",
  bookNo: "رقم الكتاب",
  bookDate: "تأريخ الكتاب",
  directoryName: "اسم الدائرة",
  incomingNo: "رقم الوارد",
  incomingDate: "تأريخ الوارد",
  subject: "الموضوع",
  destination: "جهة البريد",
  bookAction: "الهامش",
  bookStatus: "الاجراء",
  notes: "الملاحظات",
  userID: "المستخدم",
  currentDate: "تأريخ الادخال",
};