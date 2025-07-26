'use client';
import dynamic from 'next/dynamic';

const ReportTable = dynamic(() => import('@/components/repots-pdf'), {
  ssr: false,
});

export default function ReportPage() {
  return <ReportTable />;
}


