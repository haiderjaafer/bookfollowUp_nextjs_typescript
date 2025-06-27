'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrintRoute = pathname?.startsWith('/print');
  const isLoginRoute = pathname === '/login'; //  Check for login

  const isRegisterRoute = pathname === '/register';

  const hideLayout = isPrintRoute || isLoginRoute || isRegisterRoute;

  return (
    <div className="font-serif flex flex-col min-h-screen">
      {!hideLayout && <Navbar />}

      <main className="flex-grow">
        {children}
      </main>

      {!hideLayout && <FooterComponent />}
 
   
    </div>
  );
}
