import { BookStatusOption, ReportTypeOption } from "./types";

// Report type options for first select
export const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  { label: "تقرير حالة الكتاب", value: "book_status_report" },
  { label: "تقرير الإحصائيات", value: "statistics_report" }
];

// Book status options for second select
export const BOOK_STATUS_OPTIONS: BookStatusOption[] = [
  { label: "منجز", value: "منجز" },
  { label: "قيد الانجاز", value: "قيد الانجاز" },
  { label: "مداولة", value: "مداولة" },
];