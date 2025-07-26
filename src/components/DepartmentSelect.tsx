import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { toast } from "react-toastify";

// DepartmentSelect Component
interface Department {
  deID: number;
  departmentName: string;
}

interface DepartmentSelectProps {
  coID: number | undefined;
  value: number | undefined | null; // FIXED: Allow null from database
  onChange: (deID: number | undefined) => void;
  className?: string;
  departmentName: string | null;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ 
  coID, 
  value, 
  onChange, 
  className, 
  departmentName 
}) => {
  console.log('DepartmentSelect - coID:', coID, 'value:', value, 'type:', typeof value);

  const { data: departments, isLoading, error, isFetching } = useQuery<Department[], Error>({
    queryKey: ['departments', coID],
    queryFn: async () => {
      if (!coID) {
        console.log('No coID provided, returning empty array');
        return [];
      }
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/${coID}/departments`,
          { withCredentials: true }
        );
        console.log('Departments fetched:', response.data);
        return response.data;
      } catch (err) {
        const error = err as { response?: { data?: { detail?: string }; status?: number } };
        const errorMessage = error.response?.data?.detail || 'فشل في جلب الأقسام';
        console.error('Fetch error:', errorMessage, 'Status:', error.response?.status);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    enabled: !!coID,
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching departments:', error.message);
    }
    console.log('DepartmentSelect - isLoading:', isLoading, 'isFetching:', isFetching, 'departments:', departments, 'value:', value);
  }, [error, isLoading, isFetching, departments, value]);

  // FIXED: Safe function to get select value
  const getSelectValue = () => {
    // Handle null, undefined, or any falsy values
    if (value === null || value === undefined || typeof value !== 'number') {
      return '';
    }
    // Additional check to ensure it's a valid number
    if (isNaN(value)) {
      return '';
    }
    return value.toString();
  };

  return (
    <div className="w-full">
      <select
        value={getSelectValue()} // FIXED: Use safe function instead of inline logic
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        disabled={isLoading || isFetching || !coID || !departments?.length || !!error}
        className={`
          w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic text-right
          ${isLoading || isFetching || !coID || !departments?.length || error ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
      >
        <option value="">
          {departmentName ?? "اختر قسم"}
        </option>
        {/* <option value="" disabled>
          {isLoading || isFetching ? 'جارٍ التحميل...' : !coID ? 'اختر الهيأة أولاً' : !departments?.length || error ? 'لا توجد أقسام' : 'اختر قسم'}
        </option> */}
        {departments?.map((department) => (
          <option
            key={department.deID}
            value={department.deID.toString()} // This is safe since department.deID comes from API
          >
            {department.departmentName || 'بدون اسم'}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-arabic">
          خطأ: {error.message}
        </p>
      )}
    </div>
  );
};

export default DepartmentSelect;




























// 'use client';

// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useEffect } from 'react';
// import { Department } from './BookInsertionForm/types_com_dep';


// interface DepartmentSelectProps {
//   coID: number | undefined;
//   value: number | undefined;
//   onChange: (deID: number | undefined) => void;
//   className?: string;
// }

// const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ coID, value, onChange, className }) => {
//   console.log('DepartmentSelect ------------ coID:', coID, 'value:', value);

//   const { data: departments, isLoading, error, isError, isFetching } = useQuery<Department[], Error>({
//     queryKey: ['departments', coID],
//     queryFn: async () => {
//       if (!coID) {
//         console.log('No coID provided, returning empty array');
//         return [];
//       }
//       try {
//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/${coID}/departments`,
//           {
//             withCredentials: true,
//           }
//         );
//         console.log('Departments fetched:', response.data);
//         return response.data; // No filter to inspect all data
//       } catch (err) {
//         const error = err as any;
//         const errorMessage = error.response?.data?.detail || 'فشل في جلب الأقسام';
//         console.log('Fetch error:', errorMessage, 'Status:', error.response?.status);
//         toast.info(errorMessage);
//         throw new Error(errorMessage);
//       }
//     },
//     enabled: !!coID,
//   });

//   useEffect(() => {
//     if (isError) {
//       console.log('Error fetching departments:', error?.message);
//     }
//     console.log('Departments state - isLoading:', isLoading, 'isFetching:', isFetching, 'departments:', departments);
//   }, [error, isError, isLoading, isFetching, departments]);

//   return (
//     <div className="w-full">
//       <select
//        value={value !== undefined ? value : ''} // Convert number | undefined to string | ''
//        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}

//         disabled={isLoading || isFetching || !coID || !departments?.length}
//         className={`
//           w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold
//           ${isLoading || isFetching || !coID || !departments?.length ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}
//           ${isError ? 'border-red-500' : 'border-gray-300'}
//           ${className}
//         `}
//       >
//         <option value="" disabled className='text-lg font-extrabold'>
//           {isLoading || isFetching ? 'جارٍ التحميل...' : !coID ? 'اختر الهيأة أولاً' : !departments?.length ? 'لا توجد أقسام' : 'اختر قسم'}
//         </option>
//         {departments?.map((department, index) => (
//           <option
//              className='text-lg font-extrabold'
//             key={department.deID ?? `index-${index}`}
//             value={department.deID != null && !isNaN(department.deID) ? department.deID.toString() : ''}
//           >
//             {department.departmentName || 'بدون اسم'}
//           </option>
//         ))}
//       </select>
//       {isError && (
//         <p className="mt-1 text-sm text-red-600">
//           خطأ: {error?.message}
//         </p>
//       )}
//     </div>
//   );
// };

// export default DepartmentSelect;