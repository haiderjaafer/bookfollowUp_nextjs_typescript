import React from 'react';
import { BookStatusCounts, BookTypeCounts, UserBookCount } from './types';




interface StatisticsComponentChildProps {
  bookTypeCounts: BookTypeCounts;
  bookStatusCounts: BookStatusCounts;
  userBookCounts: UserBookCount[];
  loadingCountBooksStatistics: boolean;
  permission : string;
}

const StatisticsComponentChild: React.FC<StatisticsComponentChildProps> = ({
  bookTypeCounts,
  bookStatusCounts,
  userBookCounts,
  loadingCountBooksStatistics,
  permission
}) => {


  

  return (
   
  <div className={`relative overflow-hidden w-full ${permission === "admin" ? "h-[300px]" : "h-[0px]"} hidden lg:block`}>
      {permission === "admin" && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <svg
            className="w-full h-full object-cover animate-pulse"
            viewBox="0 0 1000 1000"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="books" patternUnits="userSpaceOnUse" width="100" height="100">
                <rect width="100" height="100" fill="url(#bookGradient)" opacity="0.1" />
                <rect x="20" y="40" width="60" height="80" rx="4" fill="#3b82f6" opacity="0.3" />
                <rect x="90" y="30" width="60" height="80" rx="4" fill="#8b5cf6" opacity="0.3" />
                <rect x="55" y="120" width="60" height="80" rx="4" fill="#06b6d4" opacity="0.3" />
                <line x1="25" y1="50" x2="75" y2="50" stroke="white" strokeWidth="1" opacity="0.5" />
                <line x1="25" y1="60" x2="75" y2="60" stroke="white" strokeWidth="1" opacity="0.3" />
                <line x1="25" y1="70" x2="75" y2="70" stroke="white" strokeWidth="1" opacity="0.3" />
              </pattern>
              <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#books)" />
          </svg>
        </div>

        {/* Floating TEXTS */}
        <div
          className="absolute top-10 left-10 animate-bounce"
          style={{ animationDelay: '0s', animationDuration: '3s' }}
        >
          <div className="w-16 h-10 bg-blue-500 rounded opacity-30 shadow-lg transform rotate-12"></div>
        </div>


        <div
          className="absolute top-32 right-20 animate-bounce"
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        >
          <div className="w-18 h-20 bg-purple-500 rounded opacity-30 shadow-lg transform -rotate-6 flex items-center text-center font-extrabold">قسم تقنية المعلومات والاتصالات</div>
        </div>


        <div
          className="absolute bottom-20 left-20 animate-bounce"
          style={{ animationDelay: '2s', animationDuration: '3.5s' }}
        >
          <div className="w-14 h-18 bg-cyan-300 rounded opacity-30 shadow-lg transform rotate-6 text-center flex items-center font-extrabold">شعبة الشبكات والبرمجة</div>
        </div>


        <div
          className="absolute bottom-32 right-16 animate-bounce"
          style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}
        >
          <div className="w-18 h-20 bg-indigo-500 rounded opacity-30 shadow-lg transform -rotate-12"></div>
        </div>
      </div>
      )}
    

      
      <div className="relative z-10 container mx-auto py-6 ">
        
        {permission === "admin" && (
            <div className="text-center mb-1">
          <h1 className="text-6xl md:text-4xl font-bold text-white mb-8 animate-pulse">
            <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>
              نظام
            </span>{' '}
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>
              متابعة
            </span>{' '}
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>
              الكتب
            </span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.6s' }}>
              الالكترونية
            </span>
          </h1>

          <p className="text-2xl text-blue-200 mb-12 animate-pulse" style={{ animationDelay: '1s' }}>
            قسم التنسيق والمتابعة - شعبة المتابعة
          </p>
        </div>
        )}
      



       {permission === "admin" && (

     <div className="lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mb-5 hidden ">
  
  <article className="transition-all duration-300 ease-in-out group-hover:opacity-40 hover:!opacity-100 
    bg-red-400 w-full h-28 rounded-md text-center font-extrabold p-2 
    flex flex-col justify-between hover:bg-red-300 ">
    <div className="text-base">نوع الكتاب</div>
    <hr className="mx-10 border-t-4 rounded-full border-white" />
    <div className="flex justify-around text-xs sm:text-sm mt-1">
      <div className="flex flex-col items-center">
        <span>خارجي</span>
        <span className="text-white">
          {loadingCountBooksStatistics ? '...' : bookTypeCounts.External}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span>داخلي</span>
        <span className="text-white">
          {loadingCountBooksStatistics ? '...' : bookTypeCounts.Internal}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span>فاكس</span>
        <span className="text-white">
          {loadingCountBooksStatistics ? '...' : bookTypeCounts.Fax}
        </span>
      </div>
    </div>
  </article>

 
  <article className="transition-all duration-300 ease-in-out group-hover:opacity-40 hover:!opacity-100 
    bg-red-400 w-full h-28 rounded-md text-center font-extrabold p-2 
    flex flex-col justify-between hover:bg-red-300">
    <div className="text-base">حالة الكتب</div>
    <hr className="mx-10 border-t-4 rounded-full border-white" />
    <div className="flex justify-around text-xs sm:text-sm mt-1">
      <div className="flex flex-col items-center">
        <span>الكتب المنجزة</span>
        <span className="text-white">
          {loadingCountBooksStatistics ? '...' : bookStatusCounts.Accomplished}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span>كتب قيد الانجاز</span>
        <span className="text-white">
          {loadingCountBooksStatistics ? '...' : bookStatusCounts.Pending}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span>مداولة</span>
        <span className="text-white">
          {loadingCountBooksStatistics ? '...' : bookStatusCounts.Deliberation}
        </span>
      </div>
    </div>
  </article>


  <article className="transition-all duration-300 ease-in-out group-hover:opacity-40 hover:!opacity-100 
    bg-red-400 w-full h-28 rounded-md text-center font-extrabold text-base 
    hover:bg-red-300 p-2 flex flex-col justify-between">
    <div>المستخدم</div>
    <hr className="mx-10 border-t-4 rounded-full border-white" />
    <div className="flex justify-around text-xs sm:text-sm mt-1">
      {loadingCountBooksStatistics ? (
        <span>...</span>
      ) : userBookCounts.length > 0 ? (
        userBookCounts.slice(0, 3).map((user, index) => (
          <div key={index} className="flex flex-col items-center">
            <span>{user.username}</span>
            <span className="text-white">{user.bookCount}</span>
          </div>
        ))
      ) : (
        <span>لا يوجد بيانات</span>
      )}
    </div>
  </article>
</div>

       ) 
       
  
       
       }

       
      </div>
    </div>
  );
};

export default StatisticsComponentChild;