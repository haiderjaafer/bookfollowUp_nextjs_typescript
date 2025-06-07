'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrintRoute = pathname?.startsWith('/print');

  return (
    <div className="font-serif flex flex-col min-h-screen">
      {!isPrintRoute && <Navbar />}

      <main className="flex-grow">
        {children}
      </main>

      {!isPrintRoute && <FooterComponent />}

      {!isPrintRoute && (
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      )}
    </div>
  );
}
