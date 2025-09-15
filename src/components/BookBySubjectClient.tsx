"use client";

import React, { useEffect, useState } from "react";

interface Props {
  subject: string;
  initialData: any;
}

const BookBySubjectClient: React.FC<Props> = ({ subject, initialData }) => {
  const [data, setData] = useState(initialData);

  // Example: refresh data on mount (or when subject changes)
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `http://localhost:8000/api/bookFollowUp/getRecordBySubject?subject=${encodeURIComponent(
          subject
        )}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    };

    fetchData();
  }, [subject]);

  return (
    <div className="p-4">
      <h1 className="font-bold mb-4">Subject: {subject}</h1>
      <pre className="bg-gray-100 p-3 rounded-md">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default BookBySubjectClient;
