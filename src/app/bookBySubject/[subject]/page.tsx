// "use client"
// import React, { useEffect } from 'react'



// interface BookBySubjectAndBookID {
//   params: Promise<{
//     subject: string;
//   }>;
// }



// const  BookBySubjectPage = async({params}:BookBySubjectAndBookID) => {

//     const {subject } = await params;


 
//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await fetch(`http://localhost:8000/api/bookFollowUp/getRecordBySubject?subject=${encodeURIComponent(subject)}`)

//       const json = await res.json();
//      // setData(json);
//     };
//     fetchData();
//   }, [subject]);

//   //if (!data) return <div>Loading...</div>;

// return(
//     <div className='flex items-center text-center  mr-9'>bookBySubjectAndBookID <strong className='text-red-600'>{subject}</strong></div>
// )

// }

// export default BookBySubjectPage;


// app/bookBySubject/[subject]/page.tsx
import BookBySubjectClient from "@/components/BookBySubjectClient";
import React from "react";


interface BookBySubjectAndBookID {
  params: {
    subject: string;
  };
}

const BookBySubjectPage = async ({ params }: BookBySubjectAndBookID) => {
  const { subject } = params;

  // Fetch on the server
  const res = await fetch(
    `http://localhost:9000/api/bookFollowUp/getRecordBySubject?subject=${encodeURIComponent(
      subject
    )}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return <div className="text-red-600">Failed to load data</div>;
  }

  const data = await res.json();

  // Pass to client component
  return <BookBySubjectClient subject={subject} initialData={data} />;
};

export default BookBySubjectPage;

