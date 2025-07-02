// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Logout } from "./ui/logout";
import Image from 'next/image';
import RotatingLogo from "./RotatingLogo/RotatingLogo";

export type NavItem = {
  title: string;
  href?: string;
  target?: string; // Add target property
  children?: NavItem[];
  description?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    title: "الإضافة",
    children: [
      {
        title: "إضافة كتاب",
        href: "/addBooks/",
        description: "إضافة كتاب جديد إلى النظام",
      },
      // {
      //   title: "إضافة ارتباط",
      //   href: "/add/user",
      //   description: "إضافة مستخدم جديد إلى النظام",
      // },
      // {
      //   title: "إضافة فئة",
      //   href: "/add/category",
      //   description: "إضافة فئة جديدة للمنتجات",
      // },
    ],
  },
  {
    title: "البحث",
    children: [
      // {
      //   title: "رقم طلبية",
      //   href: "/search/orders",
      //   description: "البحث عن طريق رقم الطلبية",
      // },
      // {
      //   title: "اسم المادة",
      //   href: "/search/materialName",
      //   description: "البحث عن طريق اسم المادة",
      // },
      // {
      //   title: "بحث متقدم",
      //   href: "/dynmicTableWithPagination/",
      //   description: "خيارات البحث المتقدم مع فلاتر متعددة",
      // },
      {
        title: "بحث",
        href: "/searchPanel",
        description: "خيارات البحث المتقدم مع فلاتر متعددة",
      },
    ],
  },
  {
    title: "التقارير",
    children: [
          {
        title: "تقرير الكتب",
        href: "/report_all",
        //target: "_blank",
        description: "تقرير الكتب المنجزة وقيد الانجاز",
      },
      // {
      //   title: "تقرير الكتب",
      //   href: "/print/report",
      //   target: "_blank", // Open in new tab
      //   description: "تقرير كل الكتب",
      // },
  
      // {
      //   title: "الفروع",
      //   href: "/structure/branches",
      //   description: "فروع الشركة والمخازن",
      // },
    ],
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Animation variants for Framer Motion
  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const submenuVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };


   const headerRef = useRef<HTMLElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const spanRefCompanyName = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;

      if (headerRef.current) {
        headerRef.current.style.background = isScrolled ? "#9FB3DF" : "transparent";
       // headerRef.current.style.padding = isScrolled ? "20px 0" : "60px 0";
      }

      if (spanRef.current) {
        if (isScrolled) {
          spanRef.current.className =
            "text-black text-lg bg-clip-text font-extrabold font-extrabold animate-pulse";
        } else {
          spanRef.current.className =
            " text-lg bg-clip-text font-extrabold text-black animate-pulse";
        }
      }


          if (spanRefCompanyName.current) {
        if (isScrolled) {
          spanRefCompanyName.current.className =
            "text-black text-lg bg-clip-text font-extrabold animate-pulse";
        } else {
          spanRefCompanyName.current.className =
            " font-bold text-lg bg-clip-text  text-black font-extrabold animate-pulse";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
     ref={headerRef}
      className="sticky top-0 z-50 w-full border-b bg-[#EAEFEF] shadow-sm transition-all duration-200"
      dir="rtl"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-sky-100/50 transition-colors duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
                <span className="sr-only">تبديل القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="text-right bg-background/95">
              <motion.div
                className="flex flex-col space-y-4 pt-6"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={menuVariants}
              >
                {NAV_ITEMS.map((item) => (
                  <div key={item.title} className="flex flex-col">
                    {item.children ? (
                      <>
                        <motion.button
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                          onClick={() =>
                            setActiveSubmenu(
                              activeSubmenu === item.title ? null : item.title
                            )
                          }
                          className={cn(
                            "flex items-center justify-between font-medium font-arabic py-2 text-base",
                            "hover:text-sky-600 hover:bg-sky-50 rounded-md px-3 transition-all duration-300"
                          )}
                        >
                          {item.title}
                          <motion.span
                            animate={{ rotate: activeSubmenu === item.title ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            ↓
                          </motion.span>
                        </motion.button>
                        <AnimatePresence>
                          {activeSubmenu === item.title && (
                            <motion.div
                              className="flex flex-col pr-4 space-y-2 mt-2"
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={submenuVariants}
                            >
                              {item.children.map((child) => (
                                <Link
                                  key={child.title}
                                  href={child.href || "#"}
                                  target={child.target || "_self"} // Use target property
                                  className={cn(
                                    "text-sm py-1.5 block font-arabic text-right",
                                    "hover:text-sky-600 hover:bg-sky-50 rounded-md px-3 transition-all duration-300"
                                  )}
                                  onClick={() => setIsOpen(false)}
                                >
                                  <motion.div
                                    className="flex flex-col items-end"
                                    whileHover={{ x: 3 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <span>{child.title}</span>
                                    {child.description && (
                                      <span className="text-xs text-muted-foreground mt-1">
                                        {child.description}
                                      </span>
                                    )}
                                  </motion.div>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        target={item.target || "_self"} // Use target property
                        className={cn(
                          "font-medium font-arabic py-2 text-base",
                          "hover:text-sky-600 hover:bg-sky-50 rounded-md px-3 transition-all duration-300"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.title}
                        </motion.div>
                      </Link>
                    )}
                  </div>
                ))}
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - Hidden on mobile, visible on md and above */}
        <Link href="/" className="hidden md:flex gap-1.5 items-center mx-4 font-arabic">
            
    

    <RotatingLogo/>
           
          <motion.span
            className="inline-block font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            ref={spanRefCompanyName}
          >
            شركة مصافي الوسط
          </motion.span>

           {/* <span ref={spanRefCompanyName} className="inline-block font-bold  text-lg bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600 animate-pulse">
              شركة مصافي الوسط
            </span> */}

          
        </Link>

        

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.title}
              className="relative group"
              onMouseEnter={() => setActiveSubmenu(item.title)}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              {item.children ? (
                <>
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "font-arabic text-base font-semibold px-4 py-2",
                        "hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all duration-300"
                      )}
                    >
                      {item.title}
                      <motion.span
                        animate={{ rotate: activeSubmenu === item.title ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="mr-1"
                      >
                        ↑
                      </motion.span>
                    </Button>
                  </motion.div>
                  <AnimatePresence>
                    {activeSubmenu === item.title && (
                      <motion.div
                        className={cn(
                          "absolute right-0 mt-2 w-64 rounded-xl bg-popover shadow-xl border border-sky-100/50",
                          "backdrop-blur-sm"
                        )}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={submenuVariants}
                      >
                        <div className="py-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.title}
                              href={child.href || "#"}
                              target={child.target || "_self"} // Use target property
                              className={cn(
                                "text-sm block px-4 py-2 font-arabic text-right",
                                "hover:text-sky-600 hover:bg-sky-50 rounded-md transition-all duration-300"
                              )}
                            >
                              <motion.div
                                className="flex flex-col"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <span className="font-extrabold">{child.title}</span>
                                {child.description && (
                                  <span className="text-xs font-bold text-muted-foreground mt-1">
                                    {child.description}
                                  </span>
                                )}
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href={item.href || "#"}
                  target={item.target || "_self"} // Use target property
                  className={cn(
                    "font-arabic text-base font-semibold px-4 py-2",
                    "hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all duration-300"
                  )}
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.title}
                  </motion.div>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* System Name - Hidden on mobile, visible on md and above */}
        <Link href="/" className="hidden md:flex items-center mx-4 font-arabic">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <span ref={spanRef} className="inline-block font-bold  text-lg bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600 animate-pulse">
              نظام متابعة الكتب الالكتروني
            </span>
          </motion.div>
        </Link>
        <Logout/>
      </div>
    </header>
  );
}