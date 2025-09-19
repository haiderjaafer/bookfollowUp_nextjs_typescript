import { ReportFormData } from "./types";


export const buildQueryString = (data: ReportFormData): string => {
  const params = new URLSearchParams();

  console.log("data report"+ data.reportType);

  if (data.bookStatus.trim()) {
    params.append('bookStatus', data.bookStatus);
  }

  if (data.check === "true") {
    params.append("check", "true");

    if (data.startDate.trim()) {
      params.append("startDate", data.startDate);
    }

    if (data.endDate.trim()) {
      params.append("endDate", data.endDate);
    }
  }

  return params.toString();
};

export const formatArabicDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/\//g, '-');
};

export const validateDateFormat = (value: string): boolean => {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
};