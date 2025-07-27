

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

interface Committee {
  coID: number;
  Com: string;
}

interface CommitteeSelectProps {
  value: number | undefined;
  onChange: (coID: number | undefined) => void;
  comName: string | null; // New prop for Com name
  className?: string;
}

const CommitteeSelect: React.FC<CommitteeSelectProps> = ({ value, onChange, comName, className }) => {
  const { data: committees, isLoading, error } = useQuery<Committee[], Error>({
    queryKey: ['committees'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/committees`, {
          withCredentials: true,
        });
        console.log('Committees fetched:', response.data);
        return response.data;
      } catch (err) {
        const error = err as { response?: { data?: { detail?: string } } };
        const errorMessage = error.response?.data?.detail || 'فشل في جلب اللجان';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching committees:', error.message);
    }
    console.log('CommitteeSelect - value:', value, 'comName:', comName, 'committees:', committees);
  }, [error, value, comName, committees]);

  return (
    <div className="w-full">
  <select
    value={value !== undefined && !isNaN(value) ? value.toString() : ''}
    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
    disabled={isLoading || !!error}
    className={`
      w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic text-right
      ${isLoading || error ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}
      ${error ? 'border-red-500' : 'border-gray-300'}
      ${className}
    `}
  >
    {/* Dynamic placeholder based on state */}
    <option className="text-lg font-extrabold text-gray-500" value="" disabled>
      {isLoading 
        ? 'جارٍ التحميل...' 
        : value && comName 
          ? `الحالي: ${comName} - اختر للتغيير`
          : 'اختر الهيأة'
      }
    </option>
    
    {/* Available committees */}
    {committees?.map((committee) => (
      <option key={committee.coID} value={committee.coID.toString()}>
        {committee.Com || 'بدون اسم'}
      </option>
    ))}
  </select>
  
  {/* Show current selection info below select */}
  {value && comName && !isLoading && (
    <p className="mt-1 text-sm text-blue-600 font-arabic">
      المحدد حالياً: {comName}
    </p>
  )}
  
  {error && (
    <p className="mt-1 text-sm text-red-600 font-arabic">
      خطأ: {error.message}
    </p>
  )}
</div>
  );
};

export default CommitteeSelect;















// 'use client';

// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useEffect } from 'react';
// import { Committee } from './BookInsertionForm/types_com_dep';


// interface CommitteeSelectProps {
//   value: number | undefined;
//   onChange: (coID: number | undefined) => void;
//   className?: string;
// }

// const CommitteeSelect: React.FC<CommitteeSelectProps> = ({ value, onChange, className }) => {
//   const { data: committees, isLoading, error } = useQuery<Committee[], Error>({
//     queryKey: ['committees'],
//     queryFn: async () => {
//       try {
//         const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/committees`, {
//           withCredentials: true,
//         });
//         console.log('Committees fetched:', response.data);
//         return response.data;
//       } catch (err) {
//         const error = err as any;
//         const errorMessage = error.response?.data?.detail || 'فشل في جلب اللجان';
//         toast.info(errorMessage);
//         throw new Error(errorMessage);
//       }
//     },
//   });

//   useEffect(() => {
//     if (error) {
//       console.log('Error fetching committees:', error.message);
//     }
//   }, [error]);

//   return (
//     <div className="w-full">
//       <select
      
//         value={value !== undefined ? value : ''}
//         onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
//         disabled={isLoading}
//         className={`
//           w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold
//           ${isLoading ? 'bg-gray-200 cursor-not-allowed ' : 'bg-white'}
//           ${error ? 'border-red-500' : 'border-gray-300'}
//           ${className}
//         `}
//       >
//         <option className='text-lg font-extrabold' value="" disabled>
//           {isLoading ? 'جارٍ التحميل...' : 'اختر لجنة'}  
//         </option>
//         {committees?.map((committee) => (
//           <option  className='text-lg font-extrabold' key={committee.coID} value={committee.coID}>
//             {committee.Com || 'بدون اسم'}
//           </option>
//         ))}
//       </select>
//       {error && (
//         <p className="mt-1 text-sm text-red-600">
//           خطأ: {error.message}
//         </p>
//       )}
//     </div>
//   );
// };

// export default CommitteeSelect;