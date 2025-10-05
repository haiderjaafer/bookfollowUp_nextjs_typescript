import ReportFormByCommitteeAndDepartment from '@/components/Reports/ReportByCommitteeAndDepartmentComponent/ReportByCommitteeAndDepartmentComponent';
import { Metadata } from 'next';
import { TbReportSearch } from "react-icons/tb";
import { LuPrinterCheck } from "react-icons/lu";

export const metadata: Metadata = {
  title: 'تقرير الكتب   حسب الهيأة والقسم',
  description: 'إنشاء تقارير مفصلة حول حالة الكتب ',
};

// Server component that handles the page layout and metadata
export default function ReportFormByCommitteeAndDepartmentPage() {
  return (
    <div className="mt-4">

              <div className="container mx-auto p-6 max-w-2xl ">
       
        <div className="bg-white rounded-lg shadow-md p-6 ">

   <section className='flex justify-between'>
     <TbReportSearch size={40} color='gray'/>
     <LuPrinterCheck size={40} className='text-orange-300' />
   </section>
       
    <h1 className="text-2xl font-extrabold mb-6 text-gray-800 text-center ">
            تقارير النظام
          </h1>

  <ReportFormByCommitteeAndDepartment />    
 </div>
 
  </div>
         
        </div>
     
    
  );
}












