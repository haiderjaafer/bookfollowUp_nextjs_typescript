import { ColumnDef } from "@tanstack/react-table";

// Define the base TableData type using unknown instead of any
export interface TableData {
  [key: string]: unknown;
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

// Add PDF type for pdfFiles
export interface PDF {
  id: number;
  pdf: string;
  bookNo: string | null;
  currentDate: string | null;
  username: string | null;  // Added username
  countPdf: string | null;
}

// Update TableData to include pdfFiles
export interface BookFollowUpData extends TableData {
  id: number;
  bookType: string | null;
  bookNo: string | null;
  bookDate: string | null;
  directoryName: string | null;
  incomingNo: string | null;
  departmentID: string | null;
  subject: string | null;
  // destination: string | null;
  bookAction: string | null;
  bookStatus: string | null;
  notes: string | null;
  currentDate: string | null;
  userID: number | null;
  username: string | null;
  pdfFiles: PDF[];
  countOfLateBooks?: number; // Optional for lateBooks
}

export const orderHeaderMap: HeaderMap = {
  id: "الايدي",
  bookType: "نوع الكتاب",
  bookNo: "رقم الكتاب",
  bookDate: "تأريخ الكتاب",
  directoryName: "اسم الدائرة",
  departmentID: "القسم",
  incomingNo: "رقم الوارد",
  incomingDate: "تأريخ الوارد",
  subject: "الموضوع",
  // destination: "جهة البريد",
  bookAction: "الهامش",
  bookStatus: "الاجراء",
  notes: "الملاحظات",
  userID: "userID",
  username: "المستخدم",
  currentDate: "تأريخ الادخال",
  countOfLateBooks: "عدد الايام المتأخرة",
  Com: "الهيأة",
  departmentName: "القسم"
};

export interface PDFRecord {
  id: number;
  bookID?: string | null;
  bookNo: string | null;
  countPdf?: string | null;
  pdf: string | null;
  userID?: string | null;
  currentDate: string | null;
}























// import { ColumnDef } from "@tanstack/react-table";

// // Define the base TableData type
// export interface TableData {
//   [key: string]: any;
// }

// // Extend ColumnDef to include size and other properties
// export type AccessorColumnDef<T extends TableData> = ColumnDef<T> & {
//   accessorKey: string;
//   header: string;
//   size?: number; // Explicitly include size
// };

// // HeaderMap for mapping field names to display names
// export interface HeaderMap {
//   [key: string]: string;
// }



// // Add PDF type for pdfFiles
// export interface PDF {
//   id: number;
//   pdf: string;
//   bookNo: string | null;
//   currentDate: string | null;
//   username: string | null;  // Added username
//   countPdf : string | null;
// }

// // Update TableData to include pdfFiles
// export interface BookFollowUpData extends TableData {
//   id: number;
//   bookType: string | null;
//   bookNo: string | null;
//   bookDate: string | null;
//   directoryName: string | null;
//   incomingNo: string | null;
//   departmentID: string | null;
//   subject: string | null;
//   destination: string | null;
//   bookAction: string | null;
//   bookStatus: string | null;
//   notes: string | null;
//   currentDate: string | null;
//   userID: number | null;
//   username: string | null;
//   pdfFiles: PDF[];
//   countOfLateBooks?: number; // Optional for lateBooks
// }

// export const orderHeaderMap: HeaderMap = {
//   id: "الايدي",
//   bookType: "نوع الكتاب",
//   bookNo: "رقم الكتاب",
//   bookDate: "تأريخ الكتاب",
//   directoryName: "اسم الدائرة",
//   departmentID:"القسم",
//   incomingNo: "رقم الوارد",
//   incomingDate: "تأريخ الوارد",
//   subject: "الموضوع",
//   destination: "جهة البريد",
//   bookAction: "الهامش",
//   bookStatus: "الاجراء",
//   notes: "الملاحظات",
//   userID: "userID",
//   username: "المستخدم",
//   currentDate: "تأريخ الادخال",
//   countOfLateBooks: "عدد الكتب المتأخرة",
//   Com:"الهيأة",
//   departmentName: "القسم"
// };


// export interface PDFRecord {
//   id: number;
//   bookID?: string | null;
//   bookNo: string | null;
//   countPdf?: string | null;
//   pdf: string | null;
//   userID?: string | null;
//   currentDate: string | null;
// }



