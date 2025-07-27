export interface ReportFormData {
  bookStatus: string;
  check: string;
  startDate: string;
  endDate: string;
  [key: string]: string;
}

export interface BookStatusOption {
  label: string;
  value: string;
}

export interface SelectOption {
  label: string;
  value: string;
}