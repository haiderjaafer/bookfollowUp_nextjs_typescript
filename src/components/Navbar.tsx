'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Menu, User, X } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Logout } from './logout';
import RotatingLogo from './RotatingLogo/RotatingLogo';
import UserDropdown from './UserDropdownMenu';

export type NavItem = {
  title: string;
  href?: string;
  target?: string;
  children?: NavItem[];
  description?: string;
};

interface UserData {
  userID: string;
  username: string;
  permission: string;
}

interface NavbarProps {
  userData?: UserData | null;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'الإضافة',
    children: [
      {
        title: 'إضافة كتاب',
        href: '/addBooks/',
        description: 'إضافة كتاب جديد إلى النظام',
      },
    ],
  },
  {
    title: 'البحث',
    children: [
      {
        title: 'بحث',
        href: '/searchPanel',
        description: 'خيارات البحث المتقدم مع فلاتر متعددة',
      },
    ],
  },
  {
    title: 'التقارير',
    children: [
      {
        title: 'تقرير الكتب',
        href: '/report_all',
        description: 'تقرير الكتب المنجزة وقيد الانجاز',
      },
    ],
  },
];

export function Navbar({ userData }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  const submenuVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  console.log('Navbar - userData:', userData);
  console.log('Navbar - activeSubmenu:', activeSubmenu);
  console.log('Navbar - isScrolled:', isScrolled);

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 z-50 w-full border-b shadow-sm transition-all duration-200',
        isScrolled ? 'bg-[#99a1af]' : 'bg-gray-400'
      )}
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
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
                <span className="sr-only">تبديل القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="text-right bg-background/95">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Make changes to your profile here. Click save when you're done.
              </SheetDescription>
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
                            setActiveSubmenu(activeSubmenu === item.title ? null : item.title)
                          }
                          className={cn(
                            'flex items-center justify-between font-medium font-arabic py-2 text-base',
                            'hover:text-sky-600 hover:bg-sky-50 rounded-md px-3 transition-all duration-300'
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
                                  href={child.href || '#'}
                                  target={child.target || '_self'}
                                  className={cn(
                                    'text-sm py-1.5 block font-arabic text-right',
                                    'hover:text-sky-600 hover:bg-sky-50 rounded-md px-3 transition-all duration-300'
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
                        href={item.href || '#'}
                        target={item.target || '_self'}
                        className={cn(
                          'font-medium font-arabic py-2 text-base',
                          'hover:text-sky-600 hover:bg-sky-50 rounded-md px-3 transition-all duration-300'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
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

        {/* Logo and Company Name */}
        <Link
          href="/"
          className="hidden md:flex gap-1.5 items-center mx-4 font-sans focus:outline-none focus:ring-0"
        >
          <RotatingLogo />
          <motion.span
            className={cn(
              'inline-block text-lg bg-clip-text text-black animate-pulse',
              isScrolled ? 'font-extrabold text-white' : 'font-extrabold '
            )}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            شركة مصافي الوسط
          </motion.span>
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
                  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'font-arabic text-base font-semibold px-4 py-2',
                        'hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all duration-300'
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
                          'absolute right-0 mt-2 w-64 rounded-xl bg-popover shadow-xl border border-sky-100/50',
                          'backdrop-blur-sm'
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
                              href={child.href || '#'}
                              target={child.target || '_self'}
                              className={cn(
                                'text-sm block px-4 py-2 font-arabic text-right',
                                'hover:text-sky-600 hover:bg-sky-50 rounded-md transition-all duration-300'
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
                  href={item.href || '#'}
                  target={item.target || '_self'}
                  className={cn(
                    'font-arabic text-base font-semibold px-4 py-2',
                    'hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all duration-300'
                  )}
                >
                  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                    {item.title}
                  </motion.div>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* System Name */}
        <Link href="/" className="hidden md:flex  items-center mx-4 font-arabic">
          <motion.div className="flex items-center " whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <span
              className={cn(
                'inline-block text-lg bg-clip-text text-black animate-pulse',
                isScrolled ? 'font-extrabold text-white' : 'font-bold'
              )}
            >
              نظام متابعة الكتب الالكتروني
            </span>
          </motion.div>
        </Link>

        
        {/* <div className="hidden md:flex items-center gap-4">
          {userData ? (
            <div className="flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-lg">
              <User className="h-4 w-4 text-sky-600" />
              <div className="text-right flex items-center gap-2">
                <p className="font-semibold text-sm text-black">{userData.username}</p>
                <Logout />
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded flex items-center cursor-pointer text-black"
            >
              <User className="h-5 w-5 mr-1" />
              تسجيل الدخول
            </Link>
          )}
        </div> */}

        {userData ? <UserDropdown userData={userData} /> : null }

      </div>
    </header>
  );
}