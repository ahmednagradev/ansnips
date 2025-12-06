import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';

const Privacy = () => {

  useEffect(() => {
    scrollTo(top)
  }, [])

  const sections = [
    {
      icon: Shield,
      title: "Data Protection",
      content: "We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction."
    },
    {
      icon: Lock,
      title: "Information Security",
      content: "Your data is encrypted using industry-standard protocols and stored securely in protected databases."
    },
    {
      icon: Eye,
      title: "Transparency",
      content: "We're committed to being transparent about how we collect, use, and share your information."
    },
    {
      icon: UserCheck,
      title: "User Rights",
      content: "You have full control over your personal data and can request access, modification, or deletion at any time."
    }
  ];

  const policies = [
    {
      title: "Information We Collect",
      content: "We collect information that you provide directly to us, including name, email address, and any other information you choose to provide."
    },
    {
      title: "How We Use Information",
      content: "We use the information we collect to provide, maintain, and improve our services, communicate with you, and protect our services and users."
    },
    {
      title: "Information Sharing",
      content: "We do not sell, trade, or otherwise transfer your personally identifiable information to third parties without your consent."
    }
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We value your privacy and are committed to protecting your personal information. Here's how we handle your data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <section.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {section.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {policies.map((policy, index) => (
            <div key={index} className={`${index > 0 ? 'mt-8' : ''}`}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {policy.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {policy.content}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 text-center text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <p className='text-sm'>Last updated: September 2025</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Privacy;