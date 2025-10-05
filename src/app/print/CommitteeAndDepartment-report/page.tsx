'use client';
import dynamic from 'next/dynamic';

const CommitteeAndDepartmentReport = dynamic(() => import('@/components/Reports/CommitteeAndDepartmentReport/CommitteeAndDepartmentReport'), {
  ssr: false,
});

export default function ReportPage() {
  return <CommitteeAndDepartmentReport />;
}


