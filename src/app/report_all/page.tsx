"use client";
import ArabicDatePicker from "@/components/ArabicDatePicker";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";

interface BookData {
  bookStatus: string;
  check: string;
  startDate: string;
  endDate: string;
  [key: string]: string;
}

const FIRST_SELECT_OPTION = { label: "حالة الكتاب", value: "has_status" };

const BOOK_STATUS_OPTIONS = [
  { label: "منجز", value: "منجز" },
  { label: "قيد الانجاز", value: "قيد الانجاز" },
  { label: "مداولة", value: "مداولة" },
];

export default function SenderPage() {
  const [loading, setLoading] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [formData, setFormData] = useState<BookData>({
    bookStatus: "",
    check: "false",
    startDate: "",
    endDate: "",
  });

  const handleFirstSelect = useCallback((value: string) => {
    if (value === "has_status") {
      setShowStatusOptions(true);
    } else {
      setShowStatusOptions(false);
      setFormData({ bookStatus: "", check: "false", startDate: "", endDate: "" });
    }
  }, []);

  const handleStatusSelect = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, bookStatus: value }));
  }, []);

  const handleCheckChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      check: checked.toString(),
      ...(checked ? {} : { startDate: "", endDate: "" }), // clear dates if unchecked
    }));
  }, []);

  // FIXED: Create separate stable handlers for each date field
  const handleStartDateChange = useCallback((value: string) => {
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      toast.error("يرجى إدخال التاريخ بصيغة YYYY-MM-DD");
      return;
    }
    setFormData((prev) => {
      if (prev.startDate === value) {
        return prev; // Prevent unnecessary updates
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
        return prev; // Prevent unnecessary updates
      }
      return { ...prev, endDate: value };
    });
  }, []);

  const buildQueryString = useCallback((data: BookData): string => {
    const params = new URLSearchParams();

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
  }, []);

  const openPrintReport = useCallback(() => {
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
      const printUrl = `/print/report?${queryString}`;
      console.log("Opening print URL:", printUrl);

      const width = 1000;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,noopener,noreferrer`;
      const printWindow = window.open(printUrl, "_blank", features);

      if (!printWindow || printWindow.closed || typeof printWindow.closed === "undefined") {
        const fallback = document.createElement("a");
        fallback.href = printUrl;
        fallback.target = "_blank";
        fallback.rel = "noopener noreferrer";
        document.body.appendChild(fallback);
        fallback.click();
        document.body.removeChild(fallback);
      } else {
        printWindow.focus();
      }
    } catch (error) {
      console.error("Error opening print report:", error);
      toast.error("حدث خطأ أثناء فتح تقرير الطباعة");
    } finally {
      setLoading(false);
    }
  }, [formData, buildQueryString]);

  const resetForm = () => {
    setShowStatusOptions(false);
    setFormData({ bookStatus: "", check: "false", startDate: "", endDate: "" });
  };

  function formatArabicDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);

    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(date)
      .replace(/\//g, '-');
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">اختيار بيانات الكتاب</h1>

        {/* First Select */}
        <div className="mb-6">
          <label className="block text-sm font-extrabold text-gray-700 mb-2">اختر الحقل</label>
          <select
            onChange={(e) => handleFirstSelect(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">اختر</option>
            <option className="text-sm font-extrabold text-gray-700" value={FIRST_SELECT_OPTION.value}>
              {FIRST_SELECT_OPTION.label}
            </option>
          </select>
        </div>

        {/* Second Select - Book Status */}
        {showStatusOptions && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">حالة الكتاب</label>
              <select
                value={formData.bookStatus}
                onChange={(e) => handleStatusSelect(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">اختر حالة الكتاب</option>
                {BOOK_STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="text-sm font-extrabold text-gray-700"
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
                <span className="text-sm font-extrabold text-gray-700">تصفية حسب نطاق التاريخ</span>
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

        {/* Actions */}
        <div className="flex flex-col mt-4 gap-4">
          <button
            onClick={openPrintReport}
            disabled={loading || !formData.bookStatus}
            className={`w-full py-3 px-6 rounded-md flex items-center justify-center gap-2 font-extrabold transition-colors ${
              loading || !formData.bookStatus
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
            معاينة التقرير
          </button>

          <button
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-3 border font-extrabold border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            إعادة تعيين
          </button>
        </div>

        {formData.bookStatus && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md text-sm text-gray-700">
            <p>
              <strong>حالة الكتاب:</strong>{' '}
              <span className="font-bold">{formData.bookStatus}</span>
            </p>

            {formData.check === "true" && formData.startDate && formData.endDate && (
              <>
                <p>
                  <strong>من:</strong>{' '}
                  <span className="font-bold">{formatArabicDate(formData.startDate)}</span>
                </p>
                <p>
                  <strong>إلى:</strong>{' '}
                  <span className="font-bold">{formatArabicDate(formData.endDate)}</span>
                </p>
              </>
            )}

            {formData.check === "false" && (
              <p>
                <strong>نطاق التاريخ:</strong>{' '}
                <span className="font-bold">بدون تاريخ</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}