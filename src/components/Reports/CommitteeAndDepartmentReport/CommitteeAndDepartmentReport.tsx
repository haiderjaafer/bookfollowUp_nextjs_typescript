'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TiPrinter } from "react-icons/ti";
import { format } from 'date-fns';

interface Record {
  serialNo: number;
  id: number;
  bookType: string;
  bookNo: string;
  bookDate: string | null;
  directoryName: string;
  incomingNo: string;
  incomingDate: string | null;
  subject: string;
  destination: string;
  bookAction: string;
  bookStatus: string;
  notes: string;
  currentDate: string | null;
  userID: number | null;
  username: string;
  deID: string;
  Com: string;
  departmentName: string;
}

interface ApiResponse {
  records: Record[];
  total: number;
  Com: string | null;
  departmentName: string | null;
}

export default function CommitteeAndDepartmentReport() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get all query parameters
  const bookStatus = searchParams.get('bookStatus');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const coID = searchParams.get('coID');
  const deID = searchParams.get('deID');

  useEffect(() => {
    const fetchData = async () => {
      // Enhanced validation
      if (!bookStatus) {
        setError('حالة الكتاب مطلوبة');
        setLoading(false);
        return;
      }

      if (!startDate || !endDate) {
        setError('يرجى تحديد تاريخ البدء والانتهاء');
        setLoading(false);
        return;
      }

      if (!coID) {
        setError('يرجى اختيار اللجنة');
        setLoading(false);
        return;
      }

      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/report-with-stats-department`);

        url.searchParams.append('bookStatus', bookStatus);
        url.searchParams.append('startDate', startDate);
        url.searchParams.append('endDate', endDate);
        url.searchParams.append('coID', coID);
        if (deID) url.searchParams.append('deID', deID);

        console.log('Fetching report from:', url.toString());

        const res = await fetch(url.toString());
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', errorText);
          
          if (res.status === 400) {
            throw new Error('خطأ في البيانات المدخلة. يرجى التحقق من الفلاتر المحددة');
          } else if (res.status === 404) {
            throw new Error('لم يتم العثور على بيانات للفلاتر المحددة');
          } else if (res.status === 500) {
            throw new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى');
          } else {
            throw new Error(`خطأ في الاتصال: ${res.status}`);
          }
        }
        
        const result: ApiResponse = await res.json();
        
        // Validate response data
        if (!result || typeof result.total === 'undefined') {
          throw new Error('البيانات المستلمة غير صحيحة');
        }

        if (result.total === 0) {
          setError('لا توجد سجلات مطابقة للفلاتر المحددة');
          setData(null);
          setLoading(false);
          return;
        }

        setData(result);
        setError(null);
      } catch (error) {
        console.error('Error fetching report data:', error);
        
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('حدث خطأ غير متوقع في تحميل البيانات');
        }
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookStatus, startDate, endDate, coID, deID]);

  const handlePrint = () => window.print();
  const cancelPrint = () => window.close();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'dd-MM-yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateFields = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

  const getReportTitle = () => {
    let title = 'تقرير الكتب';
    if (data?.Com && data?.departmentName) {
      title = `تقرير ${data.Com} - ${data.departmentName}`;
    } else if (data?.Com) {
      title = `تقرير ${data.Com}`;
    }
    return title;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">جاري تحميل التقرير...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-red-800 mb-2">حدث خطأ</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md text-center">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-bold text-yellow-800 mb-2">لا توجد بيانات</h2>
          <p className="text-yellow-600">لا توجد سجلات مطابقة للفلاتر المحددة</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto p-6 font-sans bg-white min-h-screen print:p-4 print:max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 w-full px-4 print:mb-4 print:px-0">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800 print:text-xl">شعبة المتابعة</h1>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-gray-800 print:text-xl">
            {getReportTitle()}
          </h1>
        </div>

        <div>
          <Image src="/slogan.gif" alt="Logo" width={80} height={80} className="print:w-16 print:h-16" />
        </div>
      </div>

      {/* Print Controls */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 print:hidden">
        <button 
          onClick={handlePrint} 
          className="bg-red-700 flex items-center gap-x-1 text-white font-extrabold px-2 py-2 rounded-lg hover:bg-red-500"
        >
          <TiPrinter size={25}/> طباعة  
        </button>
        <button 
          onClick={cancelPrint} 
          className="bg-red-700 text-white font-extrabold px-4 py-2 rounded-lg hover:bg-red-500"
        >
          إلغاء
        </button>
      </div>

      {/* Filter Summary */}
      <div className="bg-blue-50 p-4 rounded-lg mb-2 print:bg-gray-100 print:mb-3 print:p-2 print:rounded-none print:border">
        {/* <h3 className="text-lg font-bold text-gray-800 mb-2 print:text-base print:mb-1">معاملات التقرير:</h3> */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-sm print:grid-cols-4 print:gap-2 print:text-xs">
          <div className='flex items-center gap-1'>
            <span className="font-extrabold text-lg">حالة الكتاب:</span> <strong className='font-extrabold text-lg'>{bookStatus}</strong>
          </div>
          <div>
            <span className="font-extrabold text-lg">من تاريخ:</span> 
            <span className='font-extrabold text-lg'>{formatDate(startDate)}</span>
          </div>
          <div>
            <span className="font-extrabold text-lg">إلى تاريخ:</span> <strong className='font-extrabold text-lg'>{formatDate(endDate)}</strong>
          </div>
          <div>
            <span className="font-extrabold text-lg">الهيأة:</span> <strong className='font-extrabold text-lg'>{data.Com || 'غير محدد'}</strong>
          </div>
          {data.departmentName && (
            <div>
              <span className="font-extrabold text-lg">القسم:</span> <strong className='font-extrabold text-lg'>{data.departmentName}</strong>
            </div>
          )}

          <div className='flex gap-1'>
            
        <p className=" font-extrabold text-lg ">إجمالي الكتب:</p>
         <h3 className=" font- font-extrabold text-lg ">{data.total}</h3>
          </div>

        </div>
      </div>

      {/* Summary Statistics */}
      {/* <div className="bg-green-100 p-6 rounded-lg text-center mb-8 print:bg-white print:border print:p-3 print:rounded-none print:mb-4">
        <h3 className="text-3xl font-bold text-green-800 print:text-2xl print:text-black">{data.total}</h3>
        <p className="text-green-600 font-semibold print:text-black print:text-sm">إجمالي الكتب</p>
      </div> */}

      {/* Records Table - Same as before */}
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden print:shadow-none print:border print:rounded-none">
        {/* <div className="bg-gray-50 p-4 print:bg-white print:border-b print:p-2">
          <h3 className="text-xl font-bold text-gray-800 text-center print:text-lg">تفاصيل الكتب</h3>
        </div> */}

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse print:text-xs">
            <thead>
              <tr className="bg-blue-100 print:bg-gray-200">
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs w-12">ت</th>
                {/* <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs w-20">نوع الكتاب</th> */}
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs w-24">رقم الكتاب</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs w-28">تاريخ الكتاب</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs">اسم الجهة</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs w-24">رقم الوارد</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs w-28">تاريخ الوارد</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs">الموضوع</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs">الإجراء</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-xs">الملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map((record) => (
                <tr key={record.id} className="text-center even:bg-gray-50 print:even:bg-gray-100">
                  <td className="border border-gray-400 p-2 font-extrabold print:p-1 print:text-xs">{record.serialNo}</td>
                  {/* <td className="border border-gray-400 p-2 font-extrabold print:p-1 print:text-xs">{record.bookType}</td> */}
                  <td className="border border-gray-400 p-2 font-extrabold print:p-1 print:text-xs">{record.bookNo}</td>
                  <td className="border border-gray-400 p-2 font-extrabold print:p-1 print:text-xs whitespace-nowrap">{formatDateFields(record.bookDate)}</td>
                  <td className="border border-gray-400 p-2 font-extrabold text-right print:p-1 print:text-xs">
                    <div className="max-w-xs print:max-w-none">{record.directoryName}</div>
                  </td>
                  <td className="border border-gray-400 p-2 font-extrabold  print:p-1 print:text-xs">{record.incomingNo}</td>
                  <td className="border border-gray-400 p-2 font-extrabold print:p-1 print:text-xs whitespace-nowrap">{formatDateFields(record.incomingDate)}</td>
                  <td className="border border-gray-400 p-2 font-extrabold text-right print:p-1 print:text-xs">
                    <div className="max-w-md print:max-w-none">{record.subject}</div>
                  </td>
                  <td className="border border-gray-400 p-2 font-extrabold text-right print:p-1 print:text-xs">
                    <div className="max-w-xs print:max-w-none">{record.bookAction}</div>
                  </td>
                  <td className="border border-gray-400 p-2 font-extrabold text-right print:p-1 print:text-xs">
                    <div className="max-w-xs print:max-w-none">{record.notes || '-'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* <tfoot>
              <tr className="bg-gray-100 font-bold print:bg-gray-200">
                <td colSpan={10} className="border border-gray-400 p-3 text-center text-base print:p-1 print:text-xs">
                  المجموع الكلي: {data.total} كتاب
                </td>
              </tr>
            </tfoot> */}
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 print:mt-4 print:text-xs print:page-break-inside-avoid">
        <p>تم إنشاء هذا التقرير في: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
          
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}