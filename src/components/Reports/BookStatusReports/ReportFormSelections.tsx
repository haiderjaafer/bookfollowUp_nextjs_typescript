"use client";

import ArabicDatePicker from "@/components/DatePicker/ArabicDatePicker";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { BookStatusOption, ReportFormData } from "./types";
import { BOOK_STATUS_OPTIONS, REPORT_TYPE_OPTIONS } from "./constants";
import { buildQueryString, formatArabicDate } from "./utils";

export default function ReportForm() {
  const [loading, setLoading] = useState(false);
  const [showSecondSelect, setShowSecondSelect] = useState(false);
  const [formData, setFormData] = useState<ReportFormData>({
    reportType: "",
    bookStatus: "",
    check: "false",
    startDate: "",
    endDate: "",
  });

  const handleReportTypeSelect = useCallback((value: string) => {
    console.log("Report type selected:", value);
    
    setFormData({
      reportType: value,
      bookStatus: "",
      check: "false",
      startDate: "",
      endDate: "",
    });

    if (value === "book_status_report" || value === "statistics_report") {
      setShowSecondSelect(true);
    } else {
      setShowSecondSelect(false);
    }
  }, []);

  const handleStatusSelect = useCallback((value: string) => {
    console.log("Status selected:", value);
    setFormData((prev) => ({ ...prev, bookStatus: value }));
  }, []);

  const handleCheckChange = useCallback((checked: boolean) => {
    console.log("Date filter changed:", checked);
    setFormData((prev) => ({
      ...prev,
      check: checked.toString(),
    }));
  }, []);

  const handleStartDateChange = useCallback((value: string) => {
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      toast.error("يرجى إدخال التاريخ بصيغة YYYY-MM-DD");
      return;
    }
    setFormData((prev) => {
      if (prev.startDate === value) {
        return prev;
      }
      return { ...prev, startDate: value };
    });
  }, []);

  const handleEndDateChange = useCallback((value: string) => {
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      toast.error("يرجى إدخال التاريخ بصيغة YYYY-MM-DD");
      return;
    }
    setFormData((prev) => {
      if (prev.endDate === value) {
        return prev;
      }
      return { ...prev, endDate: value };
    });
  }, []);

  const openReport = useCallback(() => {
    try {
      setLoading(true);

      if (!formData.reportType) {
        toast.error("يرجى اختيار نوع التقرير");
        return;
      }

      if (!formData.bookStatus) {
        toast.error("يرجى اختيار حالة الكتاب");
        return;
      }

      if (formData.check === "true" && (!formData.startDate || !formData.endDate)) {
        toast.error("يرجى إدخال تاريخ البدء وتاريخ الانتهاء");
        return;
      }

      const queryString = buildQueryString(formData);

      console.log("queryString..."+ queryString);
      
      // Determine the URL based on report type
      let reportUrl = "";
      if (formData.reportType === "book_status_report") {
        reportUrl = `/print/report?${queryString}`;
      } else if (formData.reportType === "statistics_report") {
        reportUrl = `/print/statistics-report?${queryString}`;
      }

      console.log("Opening report URL:", reportUrl);

      const width = 1000;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,noopener,noreferrer`;
      const reportWindow = window.open(reportUrl, "_blank", features);

      if (!reportWindow || reportWindow.closed || typeof reportWindow.closed === "undefined") {
        const fallback = document.createElement("a");
        fallback.href = reportUrl;
        fallback.target = "_blank";
        fallback.rel = "noopener noreferrer";
        document.body.appendChild(fallback);
        fallback.click();
        document.body.removeChild(fallback);
      } else {
        reportWindow.focus();
      }
    } catch (error) {
      console.error("Error opening report:", error);
      toast.error("حدث خطأ أثناء فتح التقرير");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const openStatisticsReport = useCallback(() => {
    try {
      setLoading(true);

      if (!formData.bookStatus) {
        toast.error("يرجى اختيار حالة الكتاب");
        return;
      }

      if (formData.check === "true" && (!formData.startDate || !formData.endDate)) {
        toast.error("يرجى إدخال تاريخ البدء وتاريخ الانتهاء");
        return;
      }

      const queryString = buildQueryString(formData);
      const statsUrl = `/print/statistics-report?${queryString}`;
      console.log("Opening statistics URL:", statsUrl);

      // Open in current tab for statistics dashboard
      //window.location.href = statsUrl;



      const width = 1000;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,noopener,noreferrer`;
      const reportWindow = window.open(statsUrl, "_blank", features);

      if (!reportWindow || reportWindow.closed || typeof reportWindow.closed === "undefined") {
        const fallback = document.createElement("a");
        fallback.href = statsUrl;
        fallback.target = "_blank";
        fallback.rel = "noopener noreferrer";
        document.body.appendChild(fallback);
        fallback.click();
        document.body.removeChild(fallback);
      } else {
        reportWindow.focus();
      }


      
    } catch (error) {
      console.error("Error opening statistics:", error);
      toast.error("حدث خطأ أثناء فتح تقرير الإحصائيات");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const resetForm = () => {
    setShowSecondSelect(false);
    setFormData({
      reportType: "",
      bookStatus: "",
      check: "false",
      startDate: "",
      endDate: "",
    });
  };

  const getSelectedReportTypeLabel = () => {
    const selectedOption = REPORT_TYPE_OPTIONS.find(
      option => option.value === formData.reportType
    );
    return selectedOption?.label || "";
  };

  const getSelectedStatusLabel = () => {
    const selectedOption = BOOK_STATUS_OPTIONS.find(
      option => option.value === formData.bookStatus
    );
    return selectedOption?.label || "";
  };

  const isFormValid = formData.reportType && formData.bookStatus;
  const showNormalReportButton = formData.reportType === "book_status_report" && isFormValid;
  const showStatisticsButton = formData.reportType === "statistics_report" && isFormValid;

  return (
    <>
      {/* First Select - Report Type */}
      <div className="mb-6">
        <label className="block text-lg font-extrabold text-gray-700 mb-2">
          اختر نوع التقرير
        </label>
        <select
          value={formData.reportType}
          onChange={(e) => handleReportTypeSelect(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-extrabold"
          disabled={loading}
        >
          <option value="" className="font-bold text-gray-500">
            اختر نوع التقرير
          </option>
          {REPORT_TYPE_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-lg font-extrabold text-gray-700"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Second Select - Book Status */}
      {showSecondSelect && (
        <>
          <div className="mb-6">
            <label className="block text-lg font-extrabold text-gray-700 mb-2">
              حالة الكتاب
            </label>
            <select
              value={formData.bookStatus}
              onChange={(e) => handleStatusSelect(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-extrabold"
              disabled={loading}
            >
              <option value="" className="font-bold text-gray-500">
                اختر حالة الكتاب
              </option>
              {BOOK_STATUS_OPTIONS.map((option: BookStatusOption) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="text-lg font-extrabold text-gray-700"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filters */}
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.check === "true"}
                onChange={(e) => handleCheckChange(e.target.checked)}
                className="h-5 w-5"
                disabled={loading}
              />
              <span className="text-sm font-extrabold text-gray-700">
                تحديد بين تأريخين
              </span>
            </label>
            {formData.check === "true" && (
              <div className="flex gap-4 mt-2">
                <ArabicDatePicker
                  selected={formData.startDate}
                  onChange={handleStartDateChange}
                />
                <ArabicDatePicker
                  selected={formData.endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col mt-4 gap-4">
        {/* Normal Report Button */}
        {showNormalReportButton && (
          <button
            onClick={openReport}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-md flex items-center justify-center gap-2 font-extrabold transition-colors ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            {loading ? "جاري التحميل..." : "معاينة التقرير"}
          </button>
        )}

        {/* Statistics Report Button */}
        {showStatisticsButton && (
          <button
            onClick={openStatisticsReport}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-md flex items-center justify-center gap-2 font-extrabold transition-colors ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {loading ? "جاري التحميل..." : "عرض الإحصائيات"}
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={resetForm}
          disabled={loading}
          className="px-6 py-3 border font-extrabold border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
        >
          إعادة تعيين
        </button>
      </div>

      {/* Form Summary */}
      {formData.reportType && formData.bookStatus && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md text-sm text-gray-700">
          <p>
            <strong>نوع التقرير:</strong>{" "}
            <span className="font-bold">{getSelectedReportTypeLabel()}</span>
          </p>
          <p>
            <strong>حالة الكتاب:</strong>{" "}
            <span className="font-bold">{getSelectedStatusLabel()}</span>
          </p>

          {formData.check === "true" && formData.startDate && formData.endDate && (
            <>
              <p>
                <strong>من:</strong>{" "}
                <span className="font-bold">{formatArabicDate(formData.startDate)}</span>
              </p>
              <p>
                <strong>إلى:</strong>{" "}
                <span className="font-bold">{formatArabicDate(formData.endDate)}</span>
              </p>
            </>
          )}

          {formData.check === "false" && (
            <p>
              <strong>التاريخ:</strong>{" "}
              <span className="font-bold">جميع التواريخ</span>
            </p>
          )}
        </div>
      )}
    </>
  );
}