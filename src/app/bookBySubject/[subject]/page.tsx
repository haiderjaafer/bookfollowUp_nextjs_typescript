import BookBySubjectClient from "@/components/BookBySubjectClient";
import React from "react";

interface BookBySubjectAndBookID {
  params: {
    subject: string;
  };
}

const BookBySubjectPage = async ({ params }: BookBySubjectAndBookID) => {
  const { subject } = params;
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