// components/Navbar.tsx
"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";

export const Logout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {},
        
     { withCredentials: true,
      headers: { 'Content-Type': 'application/json' }, 
    
    });
   
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "فشل تسجيل الخروج");
    }
  };

  return (
   
      
    <div className="relative group inline-block">
  <button
    onClick={handleLogout}
    className="px-4 py-2 rounded flex items-center cursor-pointer"
  >
    <LogOut color="black" className="h-5 w-5" />
  </button>

  {/* Tooltip Below */}
  <div
    className="absolute top-full mt-2 left-1/2 -translate-x-1/2
               whitespace-nowrap bg-gray-800 text-white text-xs
               rounded px-2 py-1 opacity-0 group-hover:opacity-100
               transition-opacity duration-300 z-10 font-bold"
  >
    تسجيل الخروج
  </div>
</div>

   
  );
};