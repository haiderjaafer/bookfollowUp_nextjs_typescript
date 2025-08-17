import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

interface Committee {
  coID: number;
  Com: string;
}

interface CommitteeSelectProps {
  value: number | undefined; // Keep it as undefined only
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

  // Get display name for current selection
  const getCurrentDisplayName = () => {
    if (value !== undefined && committees) {
      const currentCommittee = committees.find(c => c.coID === value);
      return currentCommittee?.Com || comName || 'غير معروف';
    }
    return comName || null;
  };

  // Safe function to get select value for CommitteeSelect
  const getSelectValue = () => {
    // Handle undefined or any falsy values
    if (value === undefined || value === null || typeof value !== 'number') {
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
        value={getSelectValue()}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        disabled={isLoading || !!error}
        className={`
          w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic text-right
          ${isLoading || error ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
      >
        {/* Show current selection or placeholder */}
        <option value="" disabled={value !== undefined}>
          {isLoading 
            ? 'جارٍ التحميل...' 
            : value !== undefined 
              ? `المحدد حالياً: ${getCurrentDisplayName()}`
              : 'اختر الهيأة'
          }
        </option>
        
        {/* Available committees */}
        {committees?.map((committee) => (
          <option 
            key={committee.coID} 
            value={committee.coID.toString()}
            className={value === committee.coID ? 'bg-blue-100 font-bold' : ''}
          >
            {committee.Com || 'بدون اسم'}
          </option>
        ))}
      </select>
      
      {/* Show current selection info below select */}
      {value !== undefined && (
        <p className="mt-1 text-sm text-blue-600 font-arabic">
          المحدد حالياً: {getCurrentDisplayName()}
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