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
  value: number | undefined | null;
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

  // Safe function to get select value
  const getSelectValue = () => {
    // Handle undefined or any falsy values
    if (value === undefined || value === null || typeof value !== 'number') {
      return '';
    }
    if (isNaN(value)) {
      return '';
    }
    return value.toString();
  };

  // Get current department display name
  const getCurrentDisplayName = () => {
    if (value !== undefined && departments) {
      const currentDept = departments.find(d => d.deID === value);
      return currentDept?.departmentName || departmentName || 'غير معروف';
    }
    return departmentName;
  };

  // Get placeholder text based on current state
  const getPlaceholderText = () => {
    if (isLoading || isFetching) {
      return 'جارٍ التحميل...';
    }
    if (!coID) {
      return 'اختر الهيأة أولاً';
    }
    if (error) {
      return 'خطأ في التحميل';
    }
    if (!departments?.length) {
      return 'لا توجد أقسام';
    }
    if (value !== undefined) {
      return `المحدد حالياً: ${getCurrentDisplayName()}`;
    }
    return 'اختر قسم';
  };

  return (
    <div className="w-full">
      <select
        
        value={getSelectValue()}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        disabled={isLoading || isFetching || !coID || !!error}
        className={`
          w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic text-right
          ${isLoading || isFetching || !coID || error ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
      >
        <option value="" disabled={!coID || value !== undefined}>
          {getPlaceholderText()}
        </option>
        
        {/* Show departments if available */}
        {departments?.map((department) => (
          <option
            
            key={department.deID}
            value={department.deID.toString()}
            className={value === department.deID ? 'bg-blue-100 font-bold' : ''}
          >
            {department.departmentName || 'بدون اسم'}
          </option>
        ))}
      </select>
      
      {/* Show current selection info */}
      {value !== undefined && departments && (
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

export default DepartmentSelect;