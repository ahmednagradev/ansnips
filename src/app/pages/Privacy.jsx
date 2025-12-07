import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';

const Privacy = () => {

  useEffect(() => {
    scrollTo(top)
  }, [])

  const principles = [
    {
      icon: Shield,
      title: "Your data is yours",
      description: "We never sell your personal information to third parties"
    },
    {
      icon: Lock,
      title: "Encrypted & secure",
      description: "All data is protected with industry-standard encryption"
    },
    {
      icon: Eye,
      title: "Complete transparency",
      description: "Clear information about what we collect and why"
    },
    {
      icon: UserCheck,
      title: "You're in control",
      description: "Access, modify, or delete your data anytime"
    }
  ];

  return (
    <div className="min-h-screen">
      
      {/* Header */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            How we protect and handle your information
          </p>
        </motion.div>

        {/* Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20"
        >
          {principles.map((principle, index) => (
            <div
              key={index}
              className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800"
            >
              <principle.icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {principle.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {principle.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-10 sm:space-y-12"
        >
          
          {/* Information We Collect */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Information we collect
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We collect information you provide directly to us when you create an account, update your profile, or use our services. This includes:
              </p>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Account information (name, email address, username)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Profile information and content you create</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Messages and communications with other users</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Device and usage information to improve our services</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How We Use Information */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              How we use your information
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Deliver and personalize your experience</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Enable communication between users</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Send important updates and notifications</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Ensure security and prevent abuse</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Analyze usage to improve our platform</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Information Sharing */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Information sharing
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              We do not sell your personal information. We only share information in limited circumstances: with your consent, to comply with legal requirements, or with service providers who help us operate our platform under strict confidentiality agreements.
            </p>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Your rights and choices
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You have control over your information:
              </p>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Access and download your data at any time</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Update or correct your information</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Delete your account and associated data</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex-shrink-0">•</span>
                  <span>Control your privacy settings and preferences</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Data security
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement industry-standard security measures to protect your information from unauthorized access, alteration, or destruction. This includes encryption, secure servers, and regular security assessments.
            </p>
          </div>

        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 sm:mt-16 p-6 sm:p-8 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 text-center"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Questions about your privacy?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Contact us at <a href="mailto:theahmednagra@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline break-all">theahmednagra@gmail.com</a>
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
            Last updated: December 2025
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default Privacy;