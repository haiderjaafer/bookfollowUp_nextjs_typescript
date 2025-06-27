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
      await axios.post("http://127.0.0.1:9000/auth/logout", {},
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
    <nav className="">
      {/* Other nav items */}
      <button onClick={handleLogout} className="text-white bg-transparent px-4 py-2 rounded flex items-center cursor-pointer">
        تسجيل الخروج  <LogOut color="black" className="h-5 w-5 "/>
      </button>
    </nav>
  );
};