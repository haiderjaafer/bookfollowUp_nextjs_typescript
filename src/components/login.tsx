"use client";
// Import React for component creation
import React, { useState } from 'react';
// Import necessary icons from Heroicons (adjust based on actual needs)
import { UserIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline'; // Using outline for a cleaner look
import Image from 'next/image';
import { toast } from 'react-toastify';
import ButtonSpinner from './ButtonSpinner';

// Define the props interface for the component (optional, if props are needed later)
interface ResponsiveLoginProps {}

// Define the functional component using TypeScript
const ResponsiveLogin: React.FC<ResponsiveLoginProps> = () => {


    const[username,setUsername] = useState("")
    const[password,setPassword] = useState("")
    const [loading, setLoading] = useState(false);

const formSubmitHandler=async(e:React.FormEvent)=>{

        e.preventDefault();

        if(username === "") return toast.error("اسم المستخدم مطلوب");
        if(password === "") return toast.error("كلمة المرور مطاوبة");


                console.log({username,password});
        try {
          setLoading(true);
         // await axios.post(`${DOMAIN}/api/users/login`, { email, password });
         // router.replace('/'); // here put home page instead of login page
          setLoading(false);
         // router.refresh();
      } catch (error:any) {
          toast.error(error?.response?.data.message);
          console.log(error);
          setLoading(false);
      }


}








  // Return the JSX structure for the login component
  return (
    // Main container: Full screen height, gradient background, uses flexbox to center content
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-300 via-gray-500 to-gray-300 p-4">
      {/* Login card container: Max width, responsive grid layout, background, shadow, rounded corners */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl grid lg:grid-cols-2 overflow-hidden">

        {/* Left side: Form area - Takes full width on small screens, half on large */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {/* Logo placeholder (replace with actual logo) */}
          <div className="mb-6 text-center flex items-center justify-center">
            {/* Example: Replace with <img src="/logo.png" alt="Logo" className="h-12 mx-auto" /> */}
            {/* <span className="text-3xl font-bold text-indigo-600">YourLogo</span> */}
            <Image src="/slogan.gif" alt="Logo" width={100} height={100} />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">الدخول الى حسابك</h2>
          {/* Subtitle/Greeting */}
          <p className="text-gray-600 mb-8 text-center">اهلا وسهلا بكم في نظام متابعة الكتب الالكترونية</p>

          {/* Login Form */}
          <form onSubmit={formSubmitHandler} className="space-y-6" noValidate>
            {/* Email Input Field Group */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-1">اسم المستخدم</label>
              <div className="relative">
                {/* Input field with padding for icon */}
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="text"
                  required
                  placeholder="اسم المستخدم"
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  onChange={(e) => setUsername(e.target.value)}
                />
                {/* Email Icon inside input */}
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input Field Group */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                {/* Input field with padding for icon */}
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Password Icon inside input */}
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

           
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                {/* <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /> */}
                {/* <label htmlFor="remember-me" className="ml-2 block text-gray-900">Remember me</label> */}
              </div>
              
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

          {/* Divider */}
          {/* <div className="my-8 flex items-center justify-center">
            <hr className="w-full border-gray-300" />
            <span className="px-4 text-sm text-gray-500 bg-white">OR</span>
            <hr className="w-full border-gray-300" />
          </div> */}

         
          {/* <div className="space-y-4">
            
            <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200">
              
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.0006 10.9371C12.0006 10.2371 12.0006 9.5371 11.9371 8.8746H6.00061V12.8746H9.71211C9.53711 13.7121 8.87461 15.1621 7.53711 16.0746L7.50061 16.3121L10.0746 18.2246L10.3871 18.2621C11.9621 16.8371 12.9371 14.6621 12.9371 12.0006C12.9371 11.6256 12.9371 11.2506 12.8746 10.9371H12.0006Z" clipRule="evenodd"/><path fillRule="evenodd" d="M12 21C15.3 21 17.9625 19.8375 19.95 17.9625L16.35 15.2625C15.2625 16.05 13.7625 16.5 12 16.5C9.3375 16.5 7.0875 14.775 6.225 12.4125L2.475 15.1125C4.4625 18.7125 7.95 21 12 21Z" clipRule="evenodd"/><path fillRule="evenodd" d="M6.225 12.4125C6.0375 11.85 5.925 11.25 5.925 10.6125C5.925 9.975 6.0375 9.375 6.225 8.8125L2.475 6.1125C1.8375 7.3125 1.5 8.6625 1.5 10.6125C1.5 12.5625 1.8375 13.9125 2.475 15.1125L6.225 12.4125Z" clipRule="evenodd"/><path fillRule="evenodd" d="M12 4.5C13.9125 4.5 15.4125 5.2125 16.3125 6.075L19.9875 2.625C17.9625 0.975 15.3 0 12 0C7.95 0 4.4625 2.2875 2.475 6.1125L6.225 8.8125C7.0875 6.45 9.3375 4.5 12 4.5Z" clipRule="evenodd"/></svg>
              Sign in with Google
            </button>
            
          </div>

          
          <p className="mt-10 text-center text-sm text-gray-600">
            Not a member?{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200">
              Sign up now
            </a>
          </p> */}
        </div>

        {/* Right side: Image/Graphic area - Hidden on small screens, visible on large */}
        <div className="hidden lg:block relative">
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1527176930608-09cb256ab504?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" // Replace with your desired image URL
            alt="Login background image"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Optional Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          {/* Optional Text on Image */}
          <div className="absolute bottom-10 left-10 text-white p-4">
            <h3 className="text-3xl font-semibold mb-2">نظام متابعة الكتب الالكترونية</h3>
            <p className="text-lg">قسم تقنية المعلومات - شعبة الشبكات والانظمة البرمجية</p>
          </div>
        </div>

      </div>
    </div>
  );
};

// Export the component for use in other parts of the Next.js application
export default ResponsiveLogin;

