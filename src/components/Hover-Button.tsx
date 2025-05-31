 // Import React, necessary for creating components
import React from 'react';
// Import Head component from Next.js to potentially add Font Awesome CDN link
import Head from 'next/head';
import { ArrowUpTrayIcon, XMarkIcon  } from "@heroicons/react/24/solid";
 
 import { UserRoundPlus } from "lucide-react";






// Define the props interface for the component, currently empty as no props are needed
interface SocialShareButtonProps {}

// Define the functional component using TypeScript
const SocialShareButton: React.FC<SocialShareButtonProps> = () => {
  // Return the JSX structure of the component
  return (
    <>
   
      <button
        // Apply Tailwind classes for styling and layout
        className="
          relative           {/* Position context for absolute children */}
          flex               {/* Use flexbox for centering content */}
          h-12               {/* Set height to 12 units (e.g., 48px if 1 unit = 4px) */}
          w-32               {/* Set width to 32 units (e.g., 128px) */}
          cursor-pointer     {/* Show pointer cursor on hover */}
          items-center       {/* Center items vertically */}
          justify-center     {/* Center items horizontally */}
          overflow-hidden    {/* Hide content that overflows the button bounds */}
          rounded-3xl        {/* Apply large rounded corners (1.5rem) */}
          bg-blue-600        {/* Set background color to a shade of blue */}
          text-white         {/* Set text/icon color to white */}
          transition-all     {/* Enable transitions for all animatable properties */}
          duration-300       {/* Set transition duration to 300ms */}
          ease-in-out        {/* Use ease-in-out timing function for transitions */}
          group              {/* Define this element as a group for controlling child states on hover */}
          hover:rounded-lg   {/* Change border radius to large (0.5rem) on hover */}
        "
      >
       
        <span
          // Apply Tailwind classes for styling, positioning, and transitions for the initial view
          className="
            absolute         {/* Position absolutely within the relative parent button */}
            inset-          {/* Cover the entire button area (top, right, bottom, left = 0) */}
            flex             {/* Use flexbox for centering */}
            items-center     {/* Center items vertically */}
            justify-center   {/* Center items horizontally */}
            gap-4            {/* Add gap (1rem) between icons */}
            text-lg          {/* Set icon size (1.125rem) */}
            opacity-100      {/* Initially fully visible */}
            transition-all   {/* Enable transitions for all animatable properties */}
            duration-300     {/* Set transition duration to 300ms */}
            ease-in-out      {/* Use ease-in-out timing function */}
            group-hover:-translate-y-10 {/* On parent hover, move this span up (negative Y translation) */}
            group-hover:opacity-0       {/* On parent hover, fade this span out */}
          "
        >
        <span className='flex items-center  relative  right-10  '> 
             {/* <ArrowUpTrayIcon className='  size-5'/>  */}
             <UserRoundPlus className='  size-5'/>
             
             </span>
        </span>

       
        <span
          // Apply Tailwind classes for styling, positioning, and transitions for the hover view
          className="
            absolute         {/* Position absolutely within the relative parent button */}
            inset-0          {/* Cover the entire button area */}
            flex             {/* Use flexbox for centering */}
            items-center     {/* Center items vertically */}
            justify-center   {/* Center items horizontally */}
            gap-2            {/* Add gap (0.5rem) between text and icon */}
            px-7             {/* Add horizontal padding (1.75rem) (from original code) */}
            text-md          {/* Set text/icon size (0.875rem) */}
            opacity-0        {/* Initially fully transparent (hidden) */}
            transition-all   {/* Enable transitions for all animatable properties */}
            duration-300     {/* Set transition duration to 300ms */}
            ease-in-out      {/* Use ease-in-out timing function */}
            translate-y-10   {/* Initially positioned below its normal position (positive Y translation) */}
            group-hover:translate-y-0 {/* On parent hover, move this span to its normal Y position */}
            group-hover:opacity-100   {/* On parent hover, fade this span in */}
          "
        >
         <span className='flex items-center  relative   left-3'>
            
         {/* <UserRoundPlus className=' size-5'/> */}
         <span className='font-extrabold'>اضافة</span>
         </span>
        </span>
      </button>
    </>
  );
};

// Export the component for use in other parts of the Next.js application
export default SocialShareButton;

