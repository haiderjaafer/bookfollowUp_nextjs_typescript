"use client";

import ArabicDatePicker from "@/components/DatePicker/ArabicDatePicker";
import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

interface Department {
  deID: string;
  departmentName: string;
}

interface Committee {
  coID: string;
  Com: string;
  departments: Department[];
}

const BOOK_STATUS_OPTIONS = [
  { value: "قيد الانجاز", label: "قيد الانجاز" },
  { value: "منجز", label: "منجز" },   
  { value: "مداولة", label: "مداولة" },   
];

export default function ReportFormByCommitteeAndDepartment() {
  const [loading, setLoading] = useState(false);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
  const [loadingCommittees, setLoadingCommittees] = useState(false);
  
  const [formData, setFormData] = useState({
    bookStatus: "",
    startDate: "",
    endDate: "",
    coID: "",
    deID: "",
  });

  // Fetch committees when status and dates are set
  const fetchCommittees = useCallback(async () => {
    if (!formData.bookStatus || !formData.startDate || !formData.endDate) {
      setCommittees([]);
      return;
    }

    try {
      setLoadingCommittees(true);
      const params = new URLSearchParams({
        bookStatus: formData.bookStatus,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/committees-with-departments?${params}`
      );

      if (!response.ok) throw new Error("فشل في تحميل اللجان");

      const data: Committee[] = await response.json();
      setCommittees(data);
    } catch (error) {
      console.error("Error fetching committees:", error);
      toast.error("حدث خطأ في تحميل اللجان");
      setCommittees([]);
    } finally {
      setLoadingCommittees(false);
    }
  }, [formData.bookStatus, formData.startDate, formData.endDate]);

  useEffect(() => {
    fetchCommittees();
  }, [fetchCommittees]);

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, bookStatus: value, coID: "", deID: "" }));
    setAvailableDepartments([]);
  };

  const handleCommitteeChange = (coID: string) => {
    setFormData(prev => ({ ...prev, coID, deID: "" }));

    if (coID) {
      const committee = committees.find(c => c.coID === coID);
      setAvailableDepartments(committee?.departments || []);
    } else {
      setAvailableDepartments([]);
    }
  };

  const handleStartDateChange = (value: string) => {
    setFormData(prev => ({ ...prev, startDate: value, coID: "", deID: "" }));
    setAvailableDepartments([]);
  };

  const handleEndDateChange = (value: string) => {
    setFormData(prev => ({ ...prev, endDate: value, coID: "", deID: "" }));
    setAvailableDepartments([]);
  };

 
  const openReport = useCallback(() => {
  try {
    setLoading(true);

    if (!formData.bookStatus) {
      toast.error("يرجى اختيار حالة الكتاب");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("يرجى إدخال تاريخ البدء والانتهاء");
      return;
    }

    if (!formData.coID) {
      toast.error("يرجى اختيار اللجنة");
      return;
    }

    const params = new URLSearchParams({
      bookStatus: formData.bookStatus,
      startDate: formData.startDate,
      endDate: formData.endDate,
      coID: formData.coID,
    });

    // Remove check parameter - not needed
    // if (formData.deID) {
    //   params.append('deID', formData.deID);
    // }

    if (formData.deID) {
      params.append('deID', formData.deID);
    }

    const reportUrl = `/print/CommitteeAndDepartment-report?${params}`;

    const width = 1000;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;
    const reportWindow = window.open(reportUrl, "_blank", features);

    if (reportWindow) {
      reportWindow.focus();
    }
  } catch (error) {
    console.error("Error opening report:", error);
    toast.error("حدث خطأ أثناء فتح التقرير");
  } finally {
    setLoading(false);
  }
}, [formData]);

  const canSelectCommittee = formData.bookStatus && formData.startDate && formData.endDate;

  // Get selected labels for display
  const getSelectedCommitteeName = () => {
    return committees.find(c => c.coID === formData.coID)?.Com || "";
  };

  const getSelectedDepartmentName = () => {
    return availableDepartments.find(d => d.deID === formData.deID)?.departmentName || "";
  };

  const getSelectedStatusLabel = () => {
    return BOOK_STATUS_OPTIONS.find(opt => opt.value === formData.bookStatus)?.label || "";
  };

  const isFormComplete = formData.bookStatus && formData.startDate && formData.endDate && formData.coID;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm" dir="rtl">
      {/* Header */}
     

      <div className="space-y-5">
        {/* Book Status */}
        <div>
          <label className="block text-right text-sm font-medium text-gray-700 mb-2">
            حالة الكتاب
          </label>
          <select
            value={formData.bookStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-right font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">اختر حالة الكتاب</option>
            {BOOK_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex gap-2 ">
          <div className="">
            <label className="block text-right text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <ArabicDatePicker
              selected={formData.startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div className="">
            <label className="block text-right text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <ArabicDatePicker
              selected={formData.endDate}
              onChange={handleEndDateChange}
            />
          </div>
        </div>

        {/* Committee */}
        <div>
          <label className="block text-right text-sm font-medium text-gray-700 mb-2">
            اختر الهيأة
          </label>
          <select
            value={formData.coID}
            onChange={(e) => handleCommitteeChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-right font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!canSelectCommittee || loadingCommittees}
          >
            <option value="">اختر الهيأة</option>
            {committees.map(c => (
              <option key={c.coID} value={c.coID}>{c.Com}</option>
            ))}
          </select>
          {loadingCommittees && (
            <p className="text-sm text-blue-600 mt-1">جاري تحميل اللجان...</p>
          )}
          {!canSelectCommittee && (
            <p className="text-sm text-gray-500 mt-1">يرجى اختيار الحالة والتواريخ أولاً</p>
          )}
          {canSelectCommittee && !loadingCommittees && committees.length === 0 && (
            <p className="text-sm text-yellow-600 mt-1">لا توجد لجان متاحة</p>
          )}
        </div>

        {/* Department */}
        {formData.coID && (
          <div className="animate-fadeIn">
            <label className="block text-right text-sm font-medium text-gray-700 mb-2">
              اختر القسم 
            </label>
            <select
              value={formData.deID}
              onChange={(e) => setFormData(prev => ({ ...prev, deID: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md text-right font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              disabled={availableDepartments.length === 0}
            >
              <option value="" disabled>اختر القسم</option>
              {availableDepartments.map(d => (
                <option key={d.deID} value={d.deID}>{d.departmentName}</option>
              ))}
            </select>
            {availableDepartments.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">لا توجد أقسام لهذه اللجنة</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={openReport}
          disabled={loading || !isFormComplete}
          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-3 px-6 rounded-md font-bold flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {loading ? "جاري التحميل..." : "معاينة التقرير"}
        </button>

{/* Selection Summary - Below Button */}
{isFormComplete && (
  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
    <h3 className="text-right   text-gray-800 mb-3 font-extrabold text-lg ">الفلاتر المحددة:</h3>
    
    <div className="flex items-center   text-sm text-right">
      <div className="flex  items-center ">
        
        <span className="text-gray-600 font-extrabold">حالة الكتاب:</span>
        <span className="font-bold text-green-400">{getSelectedStatusLabel()}</span>
      </div>
      
      <div className="flex  items-center  ">
        
        <span className="text-gray-600 mr-10  font-extrabold ">من تاريخ:</span>
        <span className="font-bold text-green-400">{formData.startDate}</span>
      
      
     
       
        <span className="text-gray-600 mr-10 font-extrabold ">إلى تاريخ:</span>
         <span className="font-bold text-green-400">{formData.endDate}</span>
      </div>
      
     
       </div>
      {formData.deID && (
        <div className="flex  items-center gap-2">

             <div className="flex  items-center">
       
        <span className="text-gray-600 font-extrabold">الهيأة:</span>
         <span className="font-bold text-green-400">{getSelectedCommitteeName()}</span>
      </div>
         
          <span className="text-gray-600 font-extrabold">القسم:</span>
           <span className="font-bold text-green-400">{getSelectedDepartmentName()}</span>
        </div>
      )}
   
  </div>
)}

      </div>
    </div>
  );
}