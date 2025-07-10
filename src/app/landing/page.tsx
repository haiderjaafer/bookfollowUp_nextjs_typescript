'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const slideFromTop = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const slideFromBottom = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <motion.nav
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={slideFromTop}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MemoSystem</span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <motion.a
                whileHover={{ y: -2 }}
                href="#features"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Features
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                href="#departments"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Departments
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                href="#contact"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h1
              variants={slideFromTop}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Memo System
              </span>
              <br />
              <span className="text-gray-700">
                نظام المراسلات
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Streamline correspondence between departments with our advanced memo management system.
              <br />
              <span className="text-lg text-gray-500 mt-2 block">
                تبسيط المراسلات بين الأقسام مع نظام إدارة المذكرات المتقدم
              </span>
            </motion.p>

            <motion.div
              variants={slideFromBottom}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Start Managing Memos
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Hero Image/Illustration */}
            <motion.div
              variants={scaleIn}
              className="relative max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Create Memos</h3>
                    <p className="text-gray-600 text-sm">إنشاء المذكرات</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200"
                  >
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg mb-4 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 9a2 2 0 002 2h8a2 2 0 002-2l-2-9" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
                    <p className="text-gray-600 text-sm">تتبع التقدم</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-lg mb-4 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Collaborate</h3>
                    <p className="text-gray-600 text-sm">التعاون</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2
              variants={slideFromTop}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Powerful Features
              <span className="block text-2xl text-gray-600 mt-2">ميزات قوية</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Everything you need to manage departmental correspondence efficiently
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time Notifications",
                titleAr: "إشعارات فورية",
                description: "Get instant updates when memos are created, reviewed, or approved",
                icon: "🔔"
              },
              {
                title: "Department Management",
                titleAr: "إدارة الأقسام",
                description: "Organize and manage correspondence between different departments",
                icon: "🏢"
              },
              {
                title: "Secure Document Handling",
                titleAr: "معالجة آمنة للوثائق",
                description: "Advanced security features to protect sensitive information",
                icon: "🔒"
              },
              {
                title: "Workflow Automation",
                titleAr: "أتمتة سير العمل",
                description: "Automate approval processes and routing of memos",
                icon: "⚡"
              },
              {
                title: "Analytics & Reporting",
                titleAr: "التحليلات والتقارير",
                description: "Comprehensive insights into memo processing and department efficiency",
                icon: "📊"
              },
              {
                title: "Mobile Access",
                titleAr: "الوصول عبر الهاتف المحمول",
                description: "Access your memos and manage correspondence on the go",
                icon: "📱"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { y: 50, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.6,
                      delay: index * 0.1
                    }
                  }
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-blue-600 mb-3">{feature.titleAr}</p>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2
              variants={slideFromBottom}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Connected Departments
              <span className="block text-2xl text-gray-600 mt-2">الأقسام المترابطة</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "HR", nameAr: "الموارد البشرية", color: "from-blue-500 to-blue-600" },
              { name: "Finance", nameAr: "المالية", color: "from-green-500 to-green-600" },
              { name: "IT", nameAr: "تقنية المعلومات", color: "from-purple-500 to-purple-600" },
              { name: "Operations", nameAr: "العمليات", color: "from-orange-500 to-orange-600" },
              { name: "Legal", nameAr: "القانونية", color: "from-red-500 to-red-600" },
              { name: "Marketing", nameAr: "التسويق", color: "from-pink-500 to-pink-600" },
              { name: "Sales", nameAr: "المبيعات", color: "from-indigo-500 to-indigo-600" },
              { name: "Support", nameAr: "الدعم", color: "from-teal-500 to-teal-600" }
            ].map((dept, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { scale: 0, opacity: 0 },
                  visible: {
                    scale: 1,
                    opacity: 1,
                    transition: {
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }
                  }
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-gradient-to-br ${dept.color} p-6 rounded-xl text-white text-center shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <h3 className="font-semibold text-lg mb-1">{dept.name}</h3>
                <p className="text-sm opacity-90">{dept.nameAr}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideFromBottom}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold">MemoSystem</span>
            </div>
            <p className="text-gray-400 mb-4">
              Streamlining departmental correspondence with modern technology
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 MemoSystem. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

