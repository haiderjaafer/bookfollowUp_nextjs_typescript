// components/ResponsiveRegister.tsx
"use client";

import React, { useState } from "react";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";
import ButtonSpinner from "../../../components/ButtonSpinner";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [permission, setPermission] = useState("user");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) return toast.error("اسم المستخدم مطلوب");
    if (!password) return toast.error("كلمة المرور مطلوبة");

    try {
      setLoading(true);
      // Request auto-login by adding ?auto_login=true
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
        { username, password, permission },
        { withCredentials: true }
      );
      toast.success("تم التسجيل بنجاح");
      router.push("/"); // Redirect to homepage (auto-logged in)
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "فشل التسجيل");
      console.error(error);
      router.push("/login"); // Redirect to login on error
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-300 via-gray-500 to-gray-300 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl grid lg:grid-cols-2 overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6 text-center flex items-center justify-center">
            <Image src="/slogan.gif" alt="Logo" width={100} height={100} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">إنشاء حساب جديد</h2>
          <p className="text-gray-600 mb-8 text-center">اهلا وسهلا بكم في نظام متابعة الكتب الالكترونية</p>

          <form onSubmit={formSubmitHandler} className="space-y-6" noValidate>
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-1">اسم المستخدم</label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="text"
                  required
                  placeholder="اسم المستخدم"
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="permission" className="block text-sm font-bold text-gray-700 mb-1">الصلاحية</label>
              <select
                id="permission"
                name="permission"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
              >
                <option value="user">مستخدم</option>
                <option value="admin">مدير</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 transform hover:scale-105"
              >
                {loading ? <ButtonSpinner /> : "تسجيل"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-600">
            لديك حساب؟{" "}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200">
              تسجيل الدخول
            </a>
          </p>
        </div>

        <div className="hidden lg:block relative">
          <img
            src="https://images.unsplash.com/photo-1527176930608-09cb256ab504?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80"
            alt="Register background image"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-10 left-10 text-white p-4">
            <h3 className="text-3xl font-semibold mb-2">نظام متابعة الكتب الالكترونية</h3>
            <p className="text-lg">قسم تقنية المعلومات - شعبة الشبكات والانظمة البرمجية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;