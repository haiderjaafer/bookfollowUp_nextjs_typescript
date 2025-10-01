'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './ReportTable.module.css';
import { TiPrinter } from "react-icons/ti";

interface Department {
  deID: number;
  departmentName: string;
  coID: number;
  Com: string;
}

interface Book {
  id: number;
  bookType: string;
  bookNo: string;
  bookDate: string;
  directoryName: string;
  incomingNo: string;
  incomingDate: string;
  subject: string;
  destination: string;
  bookAction: string;
  bookStatus: string;
  notes?: string;
  currentDate: string;
  userID: number;
  departmentName: string;
  Com: string;
  countOfLateBooks?: number | null;
  
  // Multi-department fields
  all_departments?: Department[];
  department_names?: string;
  department_count?: number;
}

export default function PrintReportPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Get all query parameters
  const bookType = searchParams.get('bookType');
  const bookStatus = searchParams.get('bookStatus');
  const check = searchParams.get('check');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: A3 landscape;
          margin: 8mm;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-container {
          width: 100% !important;
          max-width: none !important;
        }
        .print-table {
          width: 100% !important;
          font-size: 11px !important;
        }
        .print-table th {
          font-size: 12px !important;
          padding: 4px 3px !important;
          line-height: 1.3 !important;
        }
        .print-table td {
          font-size: 11px !important;
          padding: 4px 3px !important;
          line-height: 1.4 !important;
        }
        .print-table tr {
          page-break-inside: avoid;
        }
        .col-serial { width: 3% !important; }
        .col-bookno { width: 6% !important; }
        .col-bookdate { width: 8% !important; }
        .col-incoming { width: 5% !important; }
        .col-incomingdate { width: 8% !important; }
        .col-subject { width: 15% !important; }
        .col-action { width: 10% !important; }
        .col-notes { width: 10% !important; }
        .col-committee { width: 13% !important; }
        .col-departments { width: 17% !important; }
      }
      
      @media screen {
        .print-table {
          font-size: 13px;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!bookStatus) return;

      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/report`);

        if (bookType) url.searchParams.append('bookType', bookType);
        if (bookStatus) url.searchParams.append('bookStatus', bookStatus);
        if (check) url.searchParams.append('check', check);
        if (startDate) url.searchParams.append('startDate', startDate);
        if (endDate) url.searchParams.append('endDate', endDate);

        const res = await fetch(url.toString());
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookType, bookStatus, check, startDate, endDate]);

  const handlePrint = () => window.print();
  const cancelPrint = () => window.close();

  return (
    <div dir="rtl" className={`${styles.container} w-full pt-10 px-4 pb-4 font-sans bg-white print:p-2`}>
      
      {/* Buttons on top */}
          <div className="flex justify-end gap-2 mb-6 print:hidden ">
            <button onClick={handlePrint} className="bg-red-700 flex items-center gap-x-1 text-white font-extrabold px-3 py-2 rounded-lg hover:bg-red-500 shadow-md text-sm">
              <TiPrinter size={22}/> طباعة  
            </button>
            <button onClick={cancelPrint} className="bg-red-700 text-white font-extrabold px-3 py-2 rounded-lg hover:bg-red-500 shadow-md text-sm">
              الغاء
            </button>
          </div>
      
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3 w-full print:mb-2">

        
        {/* Right: Department Title */}
        <div className="w-1/3 text-right pt-3">
          <h1 className="text-2xl font-extrabold font-serif  text-gray-800 print:text-sm">شعبة المتابعة</h1>
        </div>

        
        
        {/* Center: Report Title */}
        <div className="w-1/3 text-center pt-3">
        
          <h1 className="text-2xl font-extrabold font-serif font-bold text-gray-800 print:text-sm">
            تقرير الكتب
            {bookType && ` - ${bookType}`}
            {bookStatus && bookStatus !== "منجز" && ` - ${bookStatus}`}
            {bookStatus === "منجز" && (
              <>
                {' - '}
                <strong className="text-black font-extrabold">المنجزة</strong>
              </>
            )}
          </h1>
        </div>

        {/* Left: Logo and Buttons */}
        <div className="w-1/3 flex flex-col items-end gap-2">
         
          {/* Logo below buttons */}
          <Image src="/slogan.gif" alt="Logo" width={60} height={60} className="print:w-12 print:h-12" />
         
          
          
         
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">جاري التحميل...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">لا توجد بيانات مطابقة</p>
      ) : (
        <div className='w-full overflow-x-auto print-container'>
          <table className="print-table w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-blue-100">
                <th className="col-serial border border-gray-400 p-2 text-[18px] text-center font-extrabold">ت</th>
                <th className="col-bookno border border-gray-400 p-2 text-[18px]  text-center font-extrabold">رقم الكتاب</th>
                <th className="col-bookdate border border-gray-400 p-2 text-[18px] text-center font-extrabold">تاريخ الكتاب</th>
                <th className="col-incoming border border-gray-400 p-2 text-[18px] text-center font-extrabold">الوارد</th>
                <th className="col-incomingdate border border-gray-400 p-2 text-[18px] text-center font-extrabold">تاريخ الوارد</th>
                <th className="col-subject border border-gray-400 p-2 text-[18px] text-center font-extrabold">الموضوع</th>
                <th className="col-action border border-gray-400 p-2 text-[18px] text-center font-extrabold">الإجراء</th>
                <th className="col-notes border border-gray-400 p-2 text-[18px] text-center font-extrabold">الملاحظات</th>
                <th className="col-committee border border-gray-400 p-2 text-[18px] text-center font-extrabold">الهيأة</th>
                <th className="col-departments border border-gray-400 p-2 text-[18px] text-center font-extrabold">الأقسام</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className="even:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-[14px] text-center font-serif font-bold">{index + 1}</td>
                  <td className="border border-gray-400 p-2 text-[14px] text-center font-serif font-bold break-words">{item.bookNo}</td>
                  <td className="border border-gray-400 p-2 text-[14px] text-center font-serif font-bold whitespace-nowrap">{item.bookDate}</td>
                  <td className="border border-gray-400 p-2 text-[14px] text-center font-serif font-bold">{item.incomingNo || '-'}</td>
                  <td className="border border-gray-400 p-2 text-[14px] text-center font-serif font-bold whitespace-nowrap">{item.incomingDate}</td>
                  <td className="border border-gray-400 p-2 text-[14px] text-right font-serif font-bold break-words">{item.subject}</td>
                  <td className="border border-gray-400 p-2 text-[14px] text-right font-serif font-bold break-words">{item.bookAction}</td>
                  <td className="border border-gray-400 p-2 text-[14px] text-right font-serif font-bold break-words align-top whitespace-pre-wrap">
                    {item.notes}
                  </td>
                  <td className="border border-gray-400 p-2 text-[14px] text-right font-serif font-bold break-words">{item.Com}</td>
                  <td className="border border-gray-400 p-2 text-[14px] text-right font-serif font-bold break-words align-top">
                    {item.department_count && item.department_count > 1 ? (
                      <div className="leading-tight space-y-0.5">
                        {item.all_departments?.map((dept, idx) => (
                          <div key={dept.deID} className="text-right">
                            {idx + 1}. {dept.departmentName}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>{item.departmentName}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}