import { Tajawal } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FooterComponent from "@/components/FooterComponent";
import ClientLayout from "./ClientLayout";
import { Providers } from "./providers";
import LayoutWrapper from "./LayoutWrapper";

// const tajawal = Tajawal({
//   subsets: ["arabic"],
//   weight: ["400", "700","900"], // choose weights you need
//   variable: "--font-tajawal", // ⬅️ important for custom Tailwind class
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "نظام متابعة الكتب",
  description: "نظام متابعة الكتب والمذكرات المتأخرة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<html lang="ar" dir="rtl">
  <body className="font-serif flex flex-col min-h-screen">
    {/* <Navbar /> */}
    
    <main className="flex-grow">
       <LayoutWrapper><Providers>{children}</Providers></LayoutWrapper>
    </main>

    {/* <FooterComponent /> */}

    {/* <ToastContainer
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
    /> */}
  </body>
</html>

  );
}


// //npm install date-fns --legacy-peer-deps


// app/layout.tsx
// import ClientLayout from './ClientLayout';

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="ar" dir="rtl">
//       <body>
//         <ClientLayout>{children}</ClientLayout>
//       </body>
//     </html>
//   );
// }
