'use client';
//  import ReportTable from '@/components/repots-pdf';
// import { useEffect } from 'react';


//  export default function ReportPrintPage() {
//   useEffect(() => {
//     setTimeout(() => {
//       window.print();
//     }, 500);
//   }, []);

//    return (
//     <div className="p-4">
//       <ReportTable />
//      </div>
//    );
//  }

import dynamic from 'next/dynamic';

const ReportTable = dynamic(() => import('@/components/repots-pdf'), {
  ssr: false,
});

export default function ReportPage() {
  return <ReportTable />;
}


