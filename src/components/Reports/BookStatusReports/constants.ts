import { BookStatusOption, SelectOption } from "./types";


export const FIRST_SELECT_OPTION: SelectOption = { 
  label: "حالة الكتاب", 
  value: "has_status" 
};

export const BOOK_STATUS_OPTIONS: BookStatusOption[] = [
  { label: "منجز", value: "منجز" },
  { label: "قيد الانجاز", value: "قيد الانجاز" },
  { label: "مداولة", value: "مداولة" },
];