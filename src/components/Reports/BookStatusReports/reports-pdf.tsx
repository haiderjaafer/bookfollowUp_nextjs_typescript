'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './ReportTable.module.css';
import { TiPrinter } from "react-icons/ti";


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
  countOfLateBooks?: number | null;
}

export default function PrintReportPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Get all query parameters
  const bookType = searchParams.get('bookType');
  const bookStatus = searchParams.get('bookStatus');
  const check = searchParams.get('check'); // "true" | "false"
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

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
    <div dir="rtl" className={`${styles.container} max-w-7xl mx-auto p-6 font-sans bg-white`}>
  <div className="flex items-center justify-between mb-6 w-full px-4">
  {/* right: title */}

<div>
    <h1 className="text-2xl font-serif font-bold text-gray-800">شعبة المتابعة</h1>
  </div>
  {/* Center: Report Title */}
  <div className="text-center">
   <h1 className="text-2xl font-serif font-bold text-gray-800">
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

  {/* left: Logo */}

    <div>
    <Image src="/slogan.gif" alt="Logo" width={80} height={80} />
  </div>
  
</div>


      <div className="absolute top-4 left-4 z-50 flex gap-2 print:hidden">
        <button onClick={handlePrint} className="bg-red-700 flex items-center gap-x-1   text-white font-extrabold px-2 py-2 rounded-lg hover:bg-red-500">
          <TiPrinter size={25}/>   طباعة  
        </button>
        <button onClick={cancelPrint} className="bg-red-700 text-white font-extrabold px-4 py-2 rounded-lg hover:bg-red-500">
          الغاء
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">جاري التحميل...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">لا توجد بيانات مطابقة</p>
      ) : (

        <div className="max-w-[1200px] mx-auto bg-white p-6 font-sans direction-rtl">
        <table className="w-full border-collapse text-sm table-auto">
  <thead>
    <tr className="bg-blue-100 text-center">
      <th className="border border-gray-400 p-2 text-lg font-extrabold ">ت</th>
      <th className="border border-gray-400 p-2 text-lg font-extrabold  min-w-[80px]">رقم الكتاب</th>
      <th className="border border-gray-400 p-2 text-lg font-extrabold min-w-[112px]">تاريخ الكتاب</th>
      <th className="border border-gray-400 p-2 text-lg font-extrabold">الوارد</th>
      <th className="border border-gray-400 p-2 text-lg font-extrabold min-w-[112px]">تاريخ الوارد</th>
      <th className="border border-gray-400 p-2 text-lg font-extrabold min-w-[150px]">الموضوع</th>
      <th className="border border-gray-400 p-2 text-lg font-extrabold">الجهة</th>
      <th className="border border-gray-400 p-2 text-lg font-extrabold min-w-[80px]">الإجراء</th>
      <th className="border border-gray-400 p-2 text-lg font-extrabold min-w-[150px]">الملاحظات</th>
    </tr>
  </thead>
  <tbody>
    {data.map((item, index) => (
      <tr key={item.id} className="text-center even:bg-gray-100">
        <td className="border border-gray-400 textlg font-serif font-bold   p-2">{index + 1}</td>
        <td className="border border-gray-400 textlg font-serif font-bold   p-2 min-w-[80px] max-w-[100px] overflow-hidden text-ellipsis whitespace-wrap break-words">{item.bookNo}</td>
        <td className="border border-gray-400 textlg font-serif font-bold   p-2 min-w-[112px]">{item.bookDate}</td>
        <td className="border border-gray-400 textlg font-serif font-bold   p-2">{item.incomingNo || '-'}</td>
        <td className="border border-gray-400 textlg font-serif font-bold   p-2 min-w-[112px]">{item.incomingDate}</td>
        <td className="border border-gray-400 textlg font-serif font-bold   p-2 min-w-[150px] break-words">{item.subject}</td>
        <td className="border border-gray-400 textlg font-serif font-bold   p-2">{item.destination}</td>
        <td className="border border-gray-400 textlg font-serif font-bold   p-2 min-w-[80px]">{item.bookAction}</td>
        <td className="border border-gray-400 text-lg font-serif font-bold p-2 break-words whitespace-pre-wrap align-top min-w-[100px] max-w-[110px] print:break-words print:whitespace-pre-wrap print:align-top">
          {item.notes}
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
