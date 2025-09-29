// MultiSelectDepartments.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Department {
  deID: number;
  departmentName: string;
}

interface MultiSelectDepartmentsProps {
  coID: number | undefined;
  value: number[]; // Array of selected department IDs
  onChange: (deIDs: number[]) => void;
  className?: string;
}

const MultiSelectDepartments: React.FC<MultiSelectDepartmentsProps> = ({
  coID,
  value,
  onChange,
  className
}) => {
  const [open, setOpen] = useState(false);

  
  console.log('MultiSelectDepartments - coID:', coID, 'value:', value);

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

  // Get selected departments for display
  const getSelectedDepartments = () => {
    if (!departments) return [];
    return departments.filter(dept => value.includes(dept.deID));
  };

  // Handle department selection/deselection
  const handleDepartmentToggle = (deptId: number) => {
    const newValue = value.includes(deptId)
      ? value.filter(id => id !== deptId) // Remove if already selected
      : [...value, deptId]; // Add if not selected
    
    onChange(newValue);
  };

  // Remove specific department
  const removeDepartment = (deptId: number) => {
    console.log('Removing department:', deptId, 'Current value:', value);
    const newValue = value.filter(id => id !== deptId);
    console.log('New value after removal:', newValue);
    onChange(newValue);
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };

  // Select all departments
  const selectAll = () => {
    if (departments) {
      onChange(departments.map(dept => dept.deID));
    }
  };



  // Get placeholder text
  const getPlaceholderText = () => {
    if (isLoading || isFetching) return 'جارٍ التحميل...';
    if (!coID) return 'اختر الهيأة أولاً';
    if (error) return 'خطأ في التحميل';
    if (!departments?.length) return 'لا توجد أقسام';
    if (value.length === 0) return 'اختر الأقسام';
    if (value.length === 1) return `${getSelectedDepartments()[0]?.departmentName}`;
    return `${value.length} أقسام محددة`;
  };

  // Determine which badges to show - Show all selected departments
  const getBadgesToDisplay = () => {
    return getSelectedDepartments();
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 px-4 font-arabic text-right"
            disabled={isLoading || !coID || !!error}
          >
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {value.length === 0 ? (
                <span className="text-gray-500">{getPlaceholderText()}</span>
              ) : (
                <div className="flex flex-wrap gap-1 max-w-full">
                  {getBadgesToDisplay().map((dept) => (
                    <div key={dept.deID} className="flex items-center bg-gray-100 rounded px-2 py-1">
                      <span className="text-xs font-arabic">{dept.departmentName}</span>
                      <div
                        className="ml-1 p-0.5 hover:bg-red-100 rounded cursor-pointer transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('X clicked for department:', dept.deID);
                          removeDepartment(dept.deID);
                        }}
                      >
                        <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          {departments && departments.length > 0 && (
            <div className="p-2 border-b">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="h-8 text-xs font-arabic"
                  disabled={value.length === departments.length}
                >
                  تحديد الكل
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-8 text-xs font-arabic"
                  disabled={value.length === 0}
                >
                  إلغاء التحديد
                </Button>
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto">
            {departments?.map((department) => (
              <div
                key={department.deID}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 font-arabic"
                onClick={() => handleDepartmentToggle(department.deID)}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <div
                    className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center",
                      value.includes(department.deID)
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    )}
                  >
                    {value.includes(department.deID) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-right flex-1">
                    {department.departmentName || 'بدون اسم'}
                  </span>
                </div>
              </div>
            ))}
            {departments?.length === 0 && (
              <div className="p-3 text-center text-gray-500 text-sm font-arabic">
                لا توجد أقسام متاحة
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Display selected departments below */}
      {value.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-blue-600 font-arabic mb-1">
            الأقسام المحددة ({value.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {getSelectedDepartments().map((dept) => (
              <div key={dept.deID} className="flex items-center bg-blue-50 rounded px-2 py-1">
                <span className="text-xs font-arabic">{dept.departmentName}</span>
                <div
                  className="ml-1 p-0.5 hover:bg-red-100 rounded cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('X clicked for department in bottom section:', dept.deID);
                    removeDepartment(dept.deID);
                  }}
                >
                  <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 font-arabic">
          خطأ: {error.message}
        </p>
      )}
    </div>
  );
};

export default MultiSelectDepartments;