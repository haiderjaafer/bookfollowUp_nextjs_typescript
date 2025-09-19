'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TiPrinter } from "react-icons/ti";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DepartmentStat {
  deID: string;
  departmentName: string;
  Com: string;
  count: number;
  percentage: number | null;
}

interface Statistics {
  totalRecords: number;
  totalDepartments: number;
  departmentBreakdown: DepartmentStat[];
  filters: {
    bookType: string | null;
    bookStatus: string;
    dateRangeEnabled: boolean;
    startDate: string | null;
    endDate: string | null;
  };
}

interface ApiResponse {
  records: any[];
  statistics: Statistics;
}

// Colors for charts
const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c',
  '#8dd1e1', '#d084d0'
];

export default function StatisticsReportPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get all query parameters
  const bookType = searchParams.get('bookType');
  const bookStatus = searchParams.get('bookStatus');
  const check = searchParams.get('check');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  useEffect(() => {
    const fetchData = async () => {
      if (!bookStatus) {
        setError('حالة الكتاب مطلوبة');
        setLoading(false);
        return;
      }

      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/report-with-stats`);

        if (bookType) url.searchParams.append('bookType', bookType);
        if (bookStatus) url.searchParams.append('bookStatus', bookStatus);
        if (check) url.searchParams.append('check', check);
        if (startDate) url.searchParams.append('startDate', startDate);
        if (endDate) url.searchParams.append('endDate', endDate);

        const res = await fetch(url.toString());
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const result = await res.json();
        
        // Calculate percentages if they're null
        const totalRecords = result.statistics.totalRecords;
        const updatedDepartmentBreakdown = result.statistics.departmentBreakdown.map((dept: DepartmentStat) => ({
          ...dept,
          percentage: dept.percentage || (totalRecords > 0 ? Math.round((dept.count / totalRecords) * 100) : 0)
        }));

        setData({
          ...result,
          statistics: {
            ...result.statistics,
            departmentBreakdown: updatedDepartmentBreakdown
          }
        });
      } catch (error) {
        console.error('Error fetching statistics data:', error);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookType, bookStatus, check, startDate, endDate]);

  const handlePrint = () => window.print();
  const cancelPrint = () => window.close();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getReportTitle = () => {
    let title = 'تقرير إحصائيات الكتب';
    if (bookType) title += ` - ${bookType}`;
    if (bookStatus) {
      if (bookStatus === "منجز") {
        title += ' - المنجزة';
      } else {
        title += ` - ${bookStatus}`;
      }
    }
    return title;
  };

  // Prepare data for charts
  const pieChartData = data?.statistics.departmentBreakdown.map((dept, index) => ({
    name: dept.departmentName,
    value: dept.count,
    percentage: dept.percentage,
    color: CHART_COLORS[index % CHART_COLORS.length]
  })) || [];

  const barChartData = data?.statistics.departmentBreakdown.map(dept => ({
    departmentName: dept.departmentName.length > 15 
      ? dept.departmentName.substring(0, 15) + '...' 
      : dept.departmentName,
    fullName: dept.departmentName,
    count: dept.count,
    Com: dept.Com
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-500 text-lg">جاري تحميل الإحصائيات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-500 text-lg">لا توجد بيانات</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto p-6 font-sans bg-white min-h-screen print:p-4 print:max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 w-full px-4 print:mb-4 print:px-0">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800 print:text-xl">شعبة المتابعة</h1>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-gray-800 print:text-xl">
            {getReportTitle()}
          </h1>
        </div>

        <div>
          <Image src="/slogan.gif" alt="Logo" width={80} height={80} className="print:w-16 print:h-16" />
        </div>
      </div>

      {/* Print Controls */}
      <div className="absolute top-4 left-4 z-50 flex gap-2 print:hidden">
        <button 
          onClick={handlePrint} 
          className="bg-red-700 flex items-center gap-x-1 text-white font-extrabold px-2 py-2 rounded-lg hover:bg-red-500"
        >
          <TiPrinter size={25}/> طباعة  
        </button>
        <button 
          onClick={cancelPrint} 
          className="bg-red-700 text-white font-extrabold px-4 py-2 rounded-lg hover:bg-red-500"
        >
          إلغاء
        </button>
      </div>

      {/* Filter Summary */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 print:bg-gray-100 print:mb-3 print:p-2 print:rounded-none print:border">
        <h3 className="text-lg font-bold text-gray-800 mb-2 print:text-base print:mb-1">معاملات التقرير:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm print:grid-cols-4 print:gap-2 print:text-xs">
          {data.statistics.filters.bookType && (
            <div>
              <span className="font-bold">نوع الكتاب:</span> {data.statistics.filters.bookType}
            </div>
          )}
          <div>
            <span className="font-bold">حالة الكتاب:</span> {data.statistics.filters.bookStatus}
          </div>
          {data.statistics.filters.dateRangeEnabled && (
            <>
              <div>
                <span className="font-bold">من تاريخ:</span> {formatDate(data.statistics.filters.startDate)}
              </div>
              <div>
                <span className="font-bold">إلى تاريخ:</span> {formatDate(data.statistics.filters.endDate)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:grid-cols-2 print:gap-4 print:mb-4">
        <div className="bg-green-100 p-6 rounded-lg text-center print:bg-white print:border print:p-3 print:rounded-none">
          <h3 className="text-2xl font-bold text-green-800 print:text-xl print:text-black">{data.statistics.totalRecords}</h3>
          <p className="text-green-600 font-semibold print:text-black print:text-sm">إجمالي الكتب</p>
        </div>
        
        <div className="bg-blue-100 p-6 rounded-lg text-center print:bg-white print:border print:p-3 print:rounded-none">
          <h3 className="text-2xl font-bold text-blue-800 print:text-xl print:text-black">{data.statistics.totalDepartments}</h3>
          <p className="text-blue-600 font-semibold print:text-black print:text-sm">عدد الأقسام</p>
        </div>
      </div>

      {/* Main Statistics Section */}
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden print:shadow-none print:border print:rounded-none">
        <div className="bg-gray-50 p-4 print:bg-white print:border-b print:p-2">
          <h3 className="text-xl font-bold text-gray-800 text-center print:text-lg">تفاصيل الإحصائيات بحسب القسم</h3>
        </div>
        
        {/* Charts and Legend Section */}
        <div className="p-6 print:p-2 print:break-inside-avoid">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8 print:grid-cols-2 print:gap-4 print:mb-4">
            {/* Pie Chart */}
            <div className="text-center print:break-inside-avoid">
              <h4 className="text-lg font-bold text-gray-700 mb-4 print:text-base print:mb-2">التوزيع النسبي</h4>
              <ResponsiveContainer width="100%" height={300} className="print:!h-48">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any) => [value, 'عدد الكتب']}
                    labelFormatter={(label: any) => `القسم: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="text-center print:break-inside-avoid">
              <h4 className="text-lg font-bold text-gray-700 mb-4 print:text-base print:mb-2">التوزيع العددي</h4>
              <ResponsiveContainer width="100%" height={300} className="print:!h-48">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="departmentName" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                    className="print:text-xs"
                  />
                  <YAxis className="print:text-xs" />
                  <Tooltip 
                    formatter={(value: any) => [value, 'عدد الكتب']}
                    labelFormatter={(label: any) => {
                      const fullData = barChartData.find(item => item.departmentName === label);
                      return `القسم: ${fullData?.fullName || label}`;
                    }}
                  />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Color Legend */}
          <div className="mb-6 print:mb-3 print:break-inside-avoid">
            <h4 className="text-lg font-bold text-gray-700 mb-3 print:text-base print:mb-2">دليل الألوان:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 print:grid-cols-3 print:gap-1 print:text-xs">
              {pieChartData.map((dept, index) => (
                <div key={index} className="flex items-center gap-2 print:gap-1">
                  <div 
                    className="w-4 h-4 rounded print:w-3 print:h-3 border border-gray-400"
                    style={{ backgroundColor: dept.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 truncate print:text-xs">
                    {dept.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Statistics Table */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse print:text-xs print:table-fixed">
            <thead>
              <tr className="bg-blue-100 print:bg-gray-200">
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm print:w-8">ت</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm print:w-12">اللون</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm">اسم القسم</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm">الهيئة</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm print:w-16">عدد الكتب</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm print:w-20">النسبة المئوية</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm">المؤشر المرئي</th>
              </tr>
            </thead>
            <tbody>
              {data.statistics.departmentBreakdown.map((dept, index) => (
                <tr key={dept.deID} className="text-center even:bg-gray-50 print:even:bg-gray-100">
                  <td className="border border-gray-400 p-3 font-serif font-bold print:p-1 print:text-xs">
                    {index + 1}
                  </td>
                  <td className="border border-gray-400 p-3 print:p-1">
                    <div className="flex justify-center">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300 print:w-4 print:h-4"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      ></div>
                    </div>
                  </td>
                  <td className="border border-gray-400 p-3 font-serif font-bold text-right print:p-1 print:text-xs">
                    {dept.departmentName}
                  </td>
                  <td className="border border-gray-400 p-3 font-serif font-bold print:p-1 print:text-xs">
                    {dept.Com}
                  </td>
                  <td className="border border-gray-400 p-3 font-serif font-bold text-lg print:p-1 print:text-xs">
                    {dept.count}
                  </td>
                  <td className="border border-gray-400 p-3 font-serif font-bold text-lg print:p-1 print:text-xs">
                    {dept.percentage}%
                  </td>
                  <td className="border border-gray-400 p-3 print:p-1">
                    <div className="w-full bg-gray-200 rounded-full h-4 print:h-2">
                      <div 
                        className="h-4 rounded-full transition-all duration-300 print:h-2"
                        style={{ 
                          width: `${dept.percentage}%`,
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold print:bg-gray-200">
                <td colSpan={4} className="border border-gray-400 p-3 text-center text-lg print:p-1 print:text-xs">
                  المجموع الكلي
                </td>
                <td className="border border-gray-400 p-3 text-center text-lg print:p-1 print:text-xs">
                  {data.statistics.totalRecords}
                </td>
                <td className="border border-gray-400 p-3 text-center text-lg print:p-1 print:text-xs">
                  100%
                </td>
                <td className="border border-gray-400 p-3 print:p-1"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 print:mt-4 print:text-xs print:page-break-inside-avoid">
        <p>تم إنشاء هذا التقرير في: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .recharts-wrapper {
            page-break-inside: avoid;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  );
}