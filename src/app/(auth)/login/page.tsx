// components/ResponsiveLogin.tsx
"use client";

import React, { useState } from "react";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";
import ButtonSpinner from "../../../components/ButtonSpinner";

interface ResponsiveLoginProps {}

const ResponsiveLogin: React.FC<ResponsiveLoginProps> = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const formSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs (assuming username and password are state variables)
    if (!username) return toast.error("اسم المستخدم مطلوب");
    if (!password) return toast.error("كلمة المرور مطلوبة");

    try {
        setLoading(true);

        // --- Replacing fetch with Axios ---
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, // Your FastAPI endpoint URL
            { username, password }, // Axios automatically serializes this to JSON body
            {
                withCredentials: true, // This is the Axios equivalent of credentials: 'include'
                headers: {
                    'Content-Type': 'application/json' // Good practice to be explicit, though Axios often defaults to this for object bodies
                }
            }
        );
        // --- End of Axios replacement ---

        // Axios automatically parses JSON response into response.data
        console.log('Login response:', response.data);

        // Axios handles 2xx responses as success, non-2xx as errors (caught in the catch block)
        toast.success("تم تسجيل الدخول بنجاح");
        setLoading(false);
 

        router.push("/"); // Redirect to homepage
        router.refresh();

    } catch (error: any) {
        setLoading(false);
        // Axios error handling is more structured
        if (axios.isAxiosError(error) && error.response) {
            // Server responded with a status code that falls out of the range of 2xx
            const errorMessage = error.response.data?.detail || "فشل تسجيل الدخول";
            toast.error(errorMessage);
            console.error("API error details:", error.response.data);
            console.error("API error status:", error.response.status);
            console.error("API error headers:", error.response.headers);
        } else {
            // Something else happened in the setting up of the request that triggered an Error
            toast.error(error?.message || "فشل تسجيل الدخول");
            console.error("Non-API error:", error);
        }
    }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-300 via-gray-500 to-gray-300 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl grid lg:grid-cols-2 overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6 text-center flex items-center justify-center">
            <Image src="/slogan.gif" alt="Logo" width={100} height={100} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">الدخول الى حسابك</h2>
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
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <a href="#" className="font-bold text-indigo-600 hover:text-indigo-500 transition duration-200">هل نسيت كلمة المرور؟</a>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 transform hover:scale-105"
              >
                {loading ? <ButtonSpinner /> : "الدخول"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-600">
            لست عضوًا؟{" "}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200">
              سجل الآن
            </a>
          </p>
        </div>

        <div className="hidden lg:block relative">
          <img
            src="https://images.unsplash.com/photo-1527176930608-09cb256ab504?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80"
            alt="Login background image"
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

export default ResponsiveLogin;