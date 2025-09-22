'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TiPrinter } from "react-icons/ti";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';


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
  records: Record<string, unknown>[];
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
      const date = new Date(dateString);
      return format(date, 'dd-MM-yyyy');
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
        
        {/* Charts Section */}
        <div className="p-6 print:p-2 print:break-inside-avoid">
          {/* Single Pie Chart */}
          <div className="flex justify-center mb-8 print:mb-4">
            <div className="text-center print:break-inside-avoid" style={{ width: '400px' }}>
              <h4 className="text-lg font-bold text-gray-700 mb-4 print:text-base print:mb-2">التوزيع النسبي</h4>
              <ResponsiveContainer width="100%" height={280} className="print:!h-40">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    className="print:!text-xs"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number | string) => [String(value), 'عدد الكتب']}
                    labelFormatter={(label: string) => `القسم: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Statistics Table */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse print:text-xs">
            <thead>
              <tr className="bg-blue-100 print:bg-gray-200">
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm w-12">ت</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm">اسم القسم</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm">الهيئة</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm w-20">عدد الكتب</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm w-24">النسبة المئوية</th>
                <th className="border border-gray-400 p-3 text-lg font-extrabold text-center print:p-1 print:text-sm w-32">النسبة حسب اللون</th>
              </tr>
            </thead>
            <tbody>
              {data.statistics.departmentBreakdown.map((dept, index) => (
                <tr key={dept.deID} className="text-center even:bg-gray-50 print:even:bg-gray-100">
                  <td className="border border-gray-400 p-3 font-serif font-bold print:p-1 print:text-xs">
                    {index + 1}
                  </td>
                  <td className="border border-gray-400 p-3 font-serif font-bold text-right print:p-1 print:text-xs whitespace-normal break-words leading-tight print:leading-tight">
                    <div className="max-w-xs print:max-w-none">
                      {dept.departmentName}
                    </div>
                  </td>
                  <td className="border border-gray-400 p-3 font-serif font-bold print:p-1 print:text-xs whitespace-normal break-words leading-tight print:leading-tight">
                    <div className="max-w-xs print:max-w-none">
                      {dept.Com}
                    </div>
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
                <td colSpan={3} className="border border-gray-400 p-3 text-center text-lg print:p-1 print:text-xs">
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
            page-break-inside: avoid !important;
            max-height: 200px !important;
          }
          
          .recharts-surface {
            max-height: 180px !important;
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
          
          /* Force charts to fit on page */
          @page {
            size: A4;
            margin: 1cm;
          }
          
          /* Chart container fixes */
          .print\\:grid-cols-2 {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1rem !important;
          }
          
          /* Prevent chart overflow */
          .print\\:col-span-1 {
            overflow: hidden !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}