
// "use client"

// import React from 'react';
// import Image from 'next/image';
// import styles from './ReportTable.module.css';

// interface ReportData {
//   status: string;
//   result: string;
//   studentName: string;
//   seatNumber: string;
//   totalMarks: number;
//   date: string;
//   serialNumber: string;
// }

// const predefinedData: ReportData[] = [
//   {
//     status: 'ناجح',
//     result: 'الدور الأول',
//     studentName: 'احمد جمال محمد',
//     seatNumber: 'C91A5B710',
//     totalMarks: 5081,
//     date: '2025-05-27',
//     serialNumber: '301GS',
//   },
//   {
//     status: 'ناجح',
//     result: 'الدور الأول',
//     studentName: 'محمد جمال احمد',
//     seatNumber: 'EBT5 CS 22',
//     totalMarks: 5815,
//     date: '2025-05-27',
//     serialNumber: '10RSR',
//   },
//   {
//     status: 'ناجح',
//     result: 'الدور الأول',
//     studentName: 'علي محمد حسن',
//     seatNumber: 'Y01F5 82 ZR',
//     totalMarks: 5860,
//     date: '2025-05-27',
//     serialNumber: '1R10R',
//   },
//   {
//     status: 'كل',
//     result: 'متخلفة',
//     studentName: 'مريم عبد الرحمن',
//     seatNumber: 'ABES CR 3T',
//     totalMarks: 5660,
//     date: '2025-05-26',
//     serialNumber: 'S65',
//   },
// ];

// const ReportTable: React.FC = () => {
//   const handlePrint = () => {
//     window.print(); // Trigger the browser's print dialog
//    //window.open('/print/report', '_blank');
//   };

//   return (
//     <div className={styles.reportContainer}>
//       <div className={styles.header}>
//         <Image src="/slogan.gif" alt="Logo" width={100} height={100} />
//         <h1>تقرير الأداء في المرحلة</h1>
//       </div>
//       <table className={styles.table}>
//         <thead>
//           <tr>
//             <th>الرقم</th>
//             <th>اسم الطالب</th>
//             <th>رقم الجلوس</th>
//             <th>المجموع</th>
//             <th>تاريخ التسجيل</th>
//             <th>رقم التسلسل</th>
//             <th>الحالة</th>
//             <th>الدور</th>
//           </tr>
//         </thead>
//         <tbody>
//           {predefinedData.map((item, index) => (
//             <tr key={index}>
//               <td>{index + 1}</td>
//               <td>{item.studentName}</td>
//               <td>{item.seatNumber}</td>
//               <td>{item.totalMarks}</td>
//               <td>{item.date}</td>
//               <td>{item.serialNumber}</td>
//               <td>{item.status}</td>
//               <td>{item.result}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <button className={styles.printButton} onClick={handlePrint}>
//         Print to PDF
//       </button>
//     </div>
//   );
// };

// export default ReportTable



'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './ReportTable.module.css';

interface Book {
  id: number;
  bookType: string | null;
  bookNo: string | null;
  bookDate: string | null;
  directoryName: string | null;
  IncomingNo: string | null;
  IncomingDate: string | null;
  subject: string | null;
  destination: string | null;
  bookAction: string | null;
  bookStatus: string | null;
  notes: string | null;
  userID: string | null;
  currentDate: string | null;
}


const testData: Book[] = [
  {
    id: 1,
    bookType: 'صادر',
    bookNo: '2025/01',
    bookDate: '2025-06-01',
    directoryName: 'مجلد الصادر',
    IncomingNo: 'ورود/123',
    IncomingDate: '2025-06-02',
    subject: 'طلب موافقة على مشروع',
    destination: 'المديرية العامة',
    bookAction: 'قيد الانتظار',
    bookStatus: 'جديد',
    notes: 'تم استلام الكتاب إلكترونيًا',
    userID: 'A123',
    currentDate: '2025-06-03',
  },
  {
    id: 2,
    bookType: 'وارد',
    bookNo: '2025/02',
    bookDate: '2025-06-03',
    directoryName: 'مجلد الوارد',
    IncomingNo: 'ورود/456',
    IncomingDate: '2025-06-04',
    subject: 'استفسار بخصوص الميزانية',
    destination: 'قسم الحسابات',
    bookAction: 'تم الرد',
    bookStatus: 'منجز',
    notes: 'تمت المتابعة من قبل القسم المختص',
    userID: 'Y987',
    currentDate: '2025-06-05',
  },
  {
    id: 3,
    bookType: 'داخلي',
    bookNo: '2025/03',
    bookDate: '2025-06-05',
    directoryName: 'مجلد المتابعة',
    IncomingNo: null,
    IncomingDate: null,
    subject: 'مذكرة داخلية بشأن تحديث الأنظمة',
    destination: 'شعبة التقنية',
    bookAction: 'جارٍ التنفيذ',
    bookStatus: 'تحت الإجراء',
    notes: 'المطلوب الإنجاز خلال أسبوع',
    userID: 'S456',
    currentDate: '2025-06-06',
  },
  {
    id: 4,
    bookType: 'وارد',
    bookNo: '2025/04',
    bookDate: '2025-05-30',
    directoryName: 'أرشيف',
    IncomingNo: 'ورود/789',
    IncomingDate: '2025-05-31',
    subject: 'شكوى مواطن',
    destination: 'قسم الشكاوى',
    bookAction: 'محال للجهة المختصة',
    bookStatus: 'محال',
    notes: 'قيد المراجعة',
    userID: 'PO321',
    currentDate: '2025-06-01',
  },
];


const ReportTable: React.FC = () => {
  const [data, setData] = useState<Book[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/books');
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.reportContainer}>
        
      <div className={styles.header}>
        <Image src="/slogan.gif" alt="Logo" width={100} height={100} />

        <h1>تقرير الكتب</h1>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>الرقم</th>
            <th>النوع</th>
            <th>رقم الكتاب</th>
            <th>تاريخ الكتاب</th>
            <th>الوارد</th>
            <th>تاريخ الوارد</th>
            <th>الموضوع</th>
            <th>الجهة</th>
            <th>الإجراء</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {testData.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.bookType}</td>
              <td>{item.bookNo}</td>
              <td>{item.bookDate}</td>
              <td>{item.IncomingNo}</td>
              <td>{item.IncomingDate}</td>
              <td>{item.subject}</td>
              <td>{item.destination}</td>
              <td>{item.bookAction}</td>
              <td>{item.bookStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className={styles.printButton} onClick={handlePrint}>
        Print to PDF
      </button>
      <div className="print-footer">
  
</div>
    </div>
  );
};

export default ReportTable;
