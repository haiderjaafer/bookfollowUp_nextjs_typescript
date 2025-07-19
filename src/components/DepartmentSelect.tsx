'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { Department } from './BookInsertionForm/types_com_dep';


interface DepartmentSelectProps {
  coID: number | undefined;
  value: number | undefined;
  onChange: (deID: number | undefined) => void;
  className?: string;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ coID, value, onChange, className }) => {
  console.log('DepartmentSelect ------------ coID:', coID, 'value:', value);

  const { data: departments, isLoading, error, isError, isFetching } = useQuery<Department[], Error>({
    queryKey: ['departments', coID],
    queryFn: async () => {
      if (!coID) {
        console.log('No coID provided, returning empty array');
        return [];
      }
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/${coID}/departments`,
          {
            withCredentials: true,
          }
        );
        console.log('Departments fetched:', response.data);
        return response.data; // No filter to inspect all data
      } catch (err) {
        const error = err as any;
        const errorMessage = error.response?.data?.detail || 'فشل في جلب الأقسام';
        console.log('Fetch error:', errorMessage, 'Status:', error.response?.status);
        toast.info(errorMessage);
        throw new Error(errorMessage);
      }
    },
    enabled: !!coID,
  });

  useEffect(() => {
    if (isError) {
      console.log('Error fetching departments:', error?.message);
    }
    console.log('Departments state - isLoading:', isLoading, 'isFetching:', isFetching, 'departments:', departments);
  }, [error, isError, isLoading, isFetching, departments]);

  return (
    <div className="w-full">
      <select
       value={value !== undefined ? value : ''} // Convert number | undefined to string | ''
       onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}

        disabled={isLoading || isFetching || !coID || !departments?.length}
        className={`
          w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
          ${isLoading || isFetching || !coID || !departments?.length ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}
          ${isError ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
      >
        <option value="" disabled>
          {isLoading || isFetching ? 'جارٍ التحميل...' : !coID ? 'اختر لجنة أولاً' : !departments?.length ? 'لا توجد أقسام' : 'اختر قسم'}
        </option>
        {departments?.map((department, index) => (
          <option
            key={department.deID ?? `index-${index}`}
            value={department.deID != null && !isNaN(department.deID) ? department.deID.toString() : ''}
          >
            {department.departmentName || 'بدون اسم'}
          </option>
        ))}
      </select>
      {isError && (
        <p className="mt-1 text-sm text-red-600">
          خطأ: {error?.message}
        </p>
      )}
    </div>
  );
};

export default DepartmentSelect;