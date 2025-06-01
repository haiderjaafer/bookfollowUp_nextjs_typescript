
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button"; // shadcn/ui Button
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DatePicker } from "../ui/date-picker";
import DirectoryNameInput from "../directoryName/directoryNameInput";
import SubjectInput from "../subject/subjectInput";
import { BookInsertionType } from "../../../bookInsertionType";
import DestinationInput from "../destination/destinationInput";
import { toast } from "react-toastify";
import DropzoneComponent from "../ReactDropZoneComponont";
import ReusableButton from "../Hover-Button";

export default function BookInsertionForm() {

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [selectedBookDate, setSelectedBookDate] = useState<string | null>(null);
  // State for form fields
  const [formData, setFormData] = useState<BookInsertionType>({
    bookType: "",
    bookNo: "",
    bookDate: selectedBookDate ?? "",
    directoryName: "",
    incomingNo: "",
    incomingDate: "",
    subject: "",
    destination: "",
    bookAction: "",
    bookStatus: "",
    notes: "",
    userID: "1",
  });

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));


    // if (name === 'incomingNo') {

    //     console.log("name",value);

    // }
  };

  // Handle form submission (to be connected to your FastAPI backend)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Replace with your API call to FastAPI
    console.log("Form submitted:", formData);
    // Example: fetch('/api/book', { method: 'POST', body: JSON.stringify(formData) })

        // Check if at least one file is selected
    if (!selectedFiles.length) {
      toast("الملف فارغ");
      return;
    }

    // Append the file(s) to FormData
    selectedFiles.forEach((file) => {
        console.log("file",file);
    });

    try {
    const response = await fetch( `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookFollowUp/bookfollowUpPost`, {  // change fetch to axios
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      toast.success("تم حفظ الكتاب بنجاح");
      console.log("Book added successfully!");
      setFormData({
        bookType: "",
        bookNo: "",
        bookDate: format(new Date(), "yyyy-MM-dd"), // Initialize with current date,
        directoryName: "",
        incomingNo: "",
        incomingDate: format(new Date(), "yyyy-MM-dd"),
        subject: "",
        destination: "",
        bookAction: "",
        bookStatus: "",
        notes: "",
        userID: "",
      });
    } else {
      console.error("Failed to add book");
       toast.warning(`حدث فشل اثناء الحفظ`);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }

  finally {
    //setIsSubmitting(false);
  }
    
  };

  // Animation variants for Framer Motion
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };


   const handleChangeBookDate = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log("formattedDate", formattedDate);
    //setSelectedBookDate(formattedDate);
    setFormData(prev => ({
      ...prev,
      bookDate: formattedDate
    }));
  };    

const handleChangeIncomingDate = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log("formattedDate", formattedDate);
    setFormData(prev => ({
      ...prev,
      incomingDate: formattedDate
    }));
  };
  
  
    const handleFilesAccepted = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileRemoved = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };



  return (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-sky-50/50 py-8"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-sky-100/50">
        {/* Page Heading */}
        <h1 className="text-2xl md:text-3xl font-bold font-arabic text-center text-sky-600 mb-8">
          صفحة إضافة كتاب
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Book Type */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookType"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                نوع الكتاب
              </label>
              <select
                id="bookType"
                name="bookType"
                value={formData.bookType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              >
                <option value="">اختر نوع الكتاب</option>
                <option value="خارجي">خارجي</option>
                <option value="داخلي">داخلي</option>
                
              </select>
            </motion.div>

            {/* Book Number */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookNo"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                رقم الكتاب
              </label>
              <input
                id="bookNo"
                name="bookNo"
                type="text"
                value={formData.bookNo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              />
            </motion.div>

            {/* Book Date {selectedBookDate} */}
            <motion.div variants={inputVariants}>
              
              <label
                htmlFor="bookDate"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                تاريخ الكتاب
              </label>
               <DatePicker onDateChange={handleChangeBookDate}  />
        
            </motion.div>

            
            <motion.div variants={inputVariants} className="md:col-span-2 lg:col-span-3">
              <label
                htmlFor="directoryName"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                اسم الدائرة
              </label>

              <DirectoryNameInput formData={formData} setFormData={setFormData}/>
              {/* <input
                id="directoryName"
                name="directoryName"
                type="text"
                value={formData.directoryName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              /> */}
            </motion.div>

            {/* Incoming Number */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="incomingNo"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                رقم الوارد
              </label>
              <input
                id="incomingNo"
                name="incomingNo"
                type="text"
                value={formData.incomingNo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
              />
            </motion.div>

            {/* Incoming Date */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="incomingDate"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                تاريخ الوارد
              </label>

               <DatePicker onDateChange={handleChangeIncomingDate}  />
              {/* <input
                id="incomingDate"
                name="incomingDate"
                type="date"
                value={formData.incomingDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right [direction:rtl]"
              /> */}
            </motion.div>

            {/* Subject */}
            <motion.div variants={inputVariants} className="md:col-span-2 lg:col-span-3">
              <label
                htmlFor="subject"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                الموضوع
              </label>

              <SubjectInput formData={formData} setFormData={setFormData}/>
              {/* <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              /> */}
            </motion.div>

            {/* Destination */}
            <motion.div variants={inputVariants} className="md:col-span-2 lg:col-span-3">
              <label
                htmlFor="destination"
                className="block text-lg font-serif font-arabic text-gray-700 mb-1 text-right"
              >
                جهة تحويل البريد
              </label>

              <DestinationInput formData={formData} setFormData={setFormData}  />
              {/* <input
                id="destination"
                name="destination"
                type="text"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              /> */}
            </motion.div>

            {/* Book Action */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookAction"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                إجراء الكتاب
              </label>
              <input
                id="bookAction"
                name="bookAction"
                value={formData.bookAction}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              
             
              />
            </motion.div>

            {/* Book Status */}
            <motion.div variants={inputVariants}>
              <label
                htmlFor="bookStatus"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                حالة الكتاب
              </label>
              <select
                id="bookStatus"
                name="bookStatus"
                value={formData.bookStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              >
                <option value="">اختر الحالة</option>
                <option value="منجز">منجز</option>
                <option value="قيد الانجاز">قيد الانجاز</option>
                
              </select>
            </motion.div>

            {/* User ID */}
            {/* <motion.div variants={inputVariants}>
              <label
                htmlFor="userID"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                معرف المستخدم
              </label>
              <input
                id="userID"
                name="userID"
                type="text"
                value={formData.userID}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right"
                required
              />
            </motion.div> */}

            {/* Notes */}
            <motion.div variants={inputVariants} className="md:col-span-2 lg:col-span-3">
              <label
                htmlFor="notes"
                className="block text-sm font-medium font-arabic text-gray-700 mb-1 text-right"
              >
                ملاحظات
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-arabic text-right resize-y"
                rows={4}
              />
            </motion.div>
          </div>

             <DropzoneComponent
        onFilesAccepted={handleFilesAccepted}
        onFileRemoved={handleFileRemoved}
      />

          {/* Submit Button 
          <motion.div
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              className="w-full md:w-auto px-8 py-2 bg-sky-600 hover:bg-sky-700 text-white font-arabic font-semibold rounded-lg transition-all duration-300"
            >
              إضافة الكتاب
            </Button>
          </motion.div>
          */}
<div className="flex justify-center">
          <ReusableButton type="submit" onClick={() => alert("Clicked!")} />

          </div>
        </form>
      </div>
    </motion.div>
  );
}