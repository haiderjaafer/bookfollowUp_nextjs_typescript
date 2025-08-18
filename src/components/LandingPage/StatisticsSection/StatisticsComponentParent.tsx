'use client';

import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { BookStatusCounts, BookTypeCounts, UserBookCount } from './types';
import StatisticsComponentChild from '@/components/LandingPage/StatisticsSection/StatisticsComponentChild';

interface permissionProp {
  permission: string;
}

const StatisticsComponentParent = ({permission}:permissionProp) => {

  

  const [bookTypeCounts, setBookTypeCounts] = useState<BookTypeCounts>({ 
    External: 0, 
    Internal: 0, 
    Fax: 0 
  });
  const [bookStatusCounts, setBookStatusCounts] = useState<BookStatusCounts>({
    Accomplished: 0,
    Pending: 0,
    Deliberation: 0,
  });
  const [userBookCounts, setUserBookCounts] = useState<UserBookCount[]>([]);
  const [loadingCountBooksStatistics, setLoadingCountBooksStatistics] = useState(true);

  // Fetch statistics counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoadingCountBooksStatistics(true);

        // Fetch book type counts
        const typeResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/counts/book-type`,
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        setBookTypeCounts(typeResponse.data);
        console.log('Book type counts:', typeResponse.data);

        // Fetch book status counts
        const statusResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/counts/book-status`,
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        setBookStatusCounts(statusResponse.data);
        console.log('Book status counts:', statusResponse.data);

        // Fetch user book counts
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/counts/user-books`,
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        setUserBookCounts(userResponse.data);
        console.log('User book counts:', userResponse.data);

      } catch (err: unknown) {
        console.error('Error fetching counts:', err);
        
        // Type guard to check if it's an AxiosError
        if (err instanceof AxiosError) {
          console.log('Error status:', err.response?.status);
          console.log('Error detail:', err.response?.data?.detail);
          toast.error(err.response?.data?.detail || 'Failed to load books statistics');
        } else {
          // Handle non-Axios errors
          const errorMessage = err instanceof Error ? err.message : 'Failed to load books statistics';
          console.log('Non-Axios error:', errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoadingCountBooksStatistics(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <StatisticsComponentChild
      bookTypeCounts={bookTypeCounts}
      bookStatusCounts={bookStatusCounts}
      userBookCounts={userBookCounts}
      loadingCountBooksStatistics={loadingCountBooksStatistics}
      permission= {permission}
    />
  );
};

export default StatisticsComponentParent;