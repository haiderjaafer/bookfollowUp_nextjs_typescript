'use client';
import dynamic from 'next/dynamic';

const ReportTable = dynamic(() => import('@/components/Reports/BookStatusReports/reports-pdf'), {
  ssr: false,
});

export default function ReportPage() {
  return <ReportTable />;
}


