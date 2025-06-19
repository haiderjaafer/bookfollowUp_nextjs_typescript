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
        const url = new URL('http://127.0.0.1:9000/api/bookFollowUp/report');
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

  return (
    <div dir="rtl" className={`${styles.container} max-w-7xl mx-auto p-6 font-sans bg-white`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Image src="/slogan.gif" alt="Logo" width={80} height={80} />
          <h1 className="text-2xl font-bold text-gray-800">تقرير الكتب</h1>
        </div>
        <button
          onClick={handlePrint}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 print:hidden"
        >
          طباعة 
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">جاري التحميل...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">لا توجد بيانات مطابقة</p>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border p-2">الرقم</th>
              <th className="border p-2">النوع</th>
              <th className="border p-2">رقم الكتاب</th>
              <th className="border p-2">تاريخ الكتاب</th>
              <th className="border p-2">الوارد</th>
              <th className="border p-2">تاريخ الوارد</th>
              <th className="border p-2">الموضوع</th>
              <th className="border p-2">الجهة</th>
              <th className="border p-2">الإجراء</th>
              <th className="border p-2">الحالة</th>
               <th className="border p-2">الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="text-center">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{item.bookType}</td>
                <td className="border p-2">{item.bookNo}</td>
                <td className="border p-2">{item.bookDate}</td>
                <td className="border p-2">{item.incomingNo || '-'}</td>
                <td className="border p-2">{item.incomingDate}</td>
                <td className="border p-2">{item.subject}</td>
                <td className="border p-2">{item.destination}</td>
                <td className="border p-2">{item.bookAction}</td>
                <td className="border p-2">{item.bookStatus}</td>
                <td className="border p-2">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    
    </div>
  );
}
