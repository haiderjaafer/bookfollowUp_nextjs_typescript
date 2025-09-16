<<<<<<< HEAD
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


=======
import BookBySubjectClient from "@/components/BookBySubjectClient";
import React from "react";

>>>>>>> 94b62087fcc5d6a9ba0b5a9f464e939e2620b689
interface BookBySubjectAndBookID {
  params: {
    subject: string;
  };
}

const BookBySubjectPage = async ({ params }: BookBySubjectAndBookID) => {
  const { subject } = params;
<<<<<<< HEAD

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

=======
  const decodedSubject = decodeURIComponent(subject);

  try {
    console.log("Fetching data for subject:", decodedSubject);
    
    const res = await fetch(
      `http://localhost:9000/api/bookFollowUp/getRecordBySubject`,
      { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          subject: decodedSubject 
        }),
        cache: "no-store"
      }
    );

    console.log("Response status:", res.status);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to fetch data: ${res.status} ${res.statusText}`);
      console.error("Error response:", errorText);
      
      return (
        <div className="text-red-600 p-4">
          <h2>Failed to load data</h2>
          <p>Status: {res.status} {res.statusText}</p>
          <p>Error: {errorText}</p>
        </div>
      );
    }

    const data = await res.json();
    return <BookBySubjectClient subject={decodedSubject} initialData={data} />;
    
  } catch (error) {
    console.error('Error fetching data:', error);
    return (
      <div className="text-red-600 p-4">
        <h2>Error loading data</h2>
        <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
};

export default BookBySubjectPage;
>>>>>>> 94b62087fcc5d6a9ba0b5a9f464e939e2620b689
