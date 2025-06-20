function FooterComponent() {
  return (
    <footer className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center text-center sm:text-start">
        
        <p className="text-sm sm:text-base font-extrabold">   جميع الحقوق محفوظة &copy;  قسم تقنية المعلومات</p>
        <p> &nbsp; / &nbsp;  </p>
        <p className="text-xs sm:text-sm mt-2 sm:mt-0 font-extrabold">شعبة الشبكات والانظمة البرمجية  </p>
        
      </div>
    </footer>
  );
}
export default FooterComponent;
