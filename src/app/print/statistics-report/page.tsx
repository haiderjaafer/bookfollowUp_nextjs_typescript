'use client';
import dynamic from 'next/dynamic';

const StatisticsReport = dynamic(() => import('@/components/Reports/StatisticsReport/StatisticsReportComponent'), {
  ssr: false,
});

export default function statisticsReport() {
  return <StatisticsReport />;
}



