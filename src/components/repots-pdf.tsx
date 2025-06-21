'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './ReportTable.module.css';


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

  const bookType = searchParams.get('bookType');
  const bookStatus = searchParams.get('bookStatus');

  useEffect(() => {
    const fetchData = async () => {
      if (!bookType && !bookStatus) return;

      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/report`); // this new URL is we are construct it as api endpoint

        console.log("url.........................."+ url);
        if (bookType) url.searchParams.append('bookType', bookType);
        if (bookStatus) url.searchParams.append('bookStatus', bookStatus);

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
  }, [bookType, bookStatus]);

  const handlePrint = () => window.print();
  const cancelPrint = () => window.close();

  return (
    <div dir="rtl" className={`${styles.container} max-w-7xl mx-auto p-6 font-sans bg-white`}>


      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Image src="/slogan.gif" alt="Logo" width={80} height={80} />
          <h1 className="text-2xl font-bold text-gray-800">
  تقرير الكتب
  {bookType && ` - ${bookType}`}
  {bookStatus && ` - ${bookStatus}`}
</h1>

        </div>
     
      </div>


 <div className="absolute top-4 left-4 z-50 flex gap-2 print:hidden">
  <button
    onClick={handlePrint}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    طباعة
  </button>
  <button
    onClick={cancelPrint}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    الغاء
  </button>
</div>


      

      {loading ? (
        <p className="text-center text-gray-500 text-lg">جاري التحميل...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">لا توجد بيانات مطابقة</p>
      ) : (
        <table className={`${styles.table}`}    >
          <thead >
            <tr className="bg-gray-100 text-center">
              <th className="border p-2">ت</th>
              <th className="border p-2"> نوع الكتاب</th>
              <th className="border p-2">رقم الكتاب</th>
              <th className="border p-2 ">تاريخ الكتاب</th>
              <th className="border p-2">الوارد</th>
              <th className="border p-2">تاريخ الوارد</th>
              <th className="border p-2">الموضوع</th>
              <th className="border p-2">الجهة</th>
              <th className="border p-2">الإجراء</th>
              {/* <th className="border p-2">الحالة</th> */}
               <th className="border p-2">الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="text-center">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2 w-20">{item.bookType}</td>
                <td className="border p-2">{item.bookNo}</td>
                <td className="border p-2 w-24 ">{item.bookDate}</td>
                <td className="border p-2">{item.incomingNo || '-'}</td>
                <td className="border p-2 w-24">{item.incomingDate}</td>
                <td className="border p-2  ">{item.subject}</td>
                <td className="border p-2">{item.destination}</td>
                <td className="border p-2">{item.bookAction}</td>
                {/* <td className="border p-2 w-24">{item.bookStatus}</td> */}
                <td className="border ">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    
    </div>
  );
}
