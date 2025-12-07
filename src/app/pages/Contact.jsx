import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import config from '../../config/config';

const Contact = () => {

  useEffect(() => {
    scrollTo(top)
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [focused, setFocused] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize EmailJS with your public key
  useEffect(() => {
    emailjs.init(config.emailjsPublicKey); // EmailJS public key
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Send email using EmailJS
      const result = await emailjs.send(
        config.emailjsServiceID,        // EmailJS service ID
        config.emailjsTemplateId,       // EmailJS template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_name: 'Ahmed',       // Name
        }
      );

      if (result.status === 200) {
        setStatus({ 
          type: 'success', 
          message: 'Message sent successfully! We\'ll get back to you soon.' 
        });
        // Clear form
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus({ 
        type: 'error', 
        message: 'Failed to send message. Please try again or email us directly.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 lg:pb-24">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight px-4">
            Let's talk
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Have questions or feedback? We're here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 order-2 lg:order-1"
          >
            {/* Status Message */}
            {status.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  status.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50' 
                    : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${
                  status.type === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {status.message}
                </p>
              </motion.div>
            )}

            <div className="space-y-6 sm:space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  disabled={isSubmitting}
                  className="w-full px-0 py-3 sm:py-4 bg-transparent border-b-2 border-gray-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-blue-400 outline-none text-gray-900 dark:text-white transition-all text-base sm:text-lg disabled:opacity-50"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  disabled={isSubmitting}
                  className="w-full px-0 py-3 sm:py-4 bg-transparent border-b-2 border-gray-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-blue-400 outline-none text-gray-900 dark:text-white transition-all text-base sm:text-lg disabled:opacity-50"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  disabled={isSubmitting}
                  rows={5}
                  className="w-full px-0 py-3 sm:py-4 bg-transparent border-b-2 border-gray-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-blue-400 outline-none text-gray-900 dark:text-white transition-all resize-none text-base sm:text-lg disabled:opacity-50 scrollbar-none"
                  placeholder="Tell us what's on your mind..."
                  required
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 text-base sm:text-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Contact Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 space-y-6 sm:space-y-8 order-1 lg:order-2"
          >
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
                Get in Touch
              </h3>
              <div className="space-y-6">
                <a
                  href="mailto:theahmednagra@gmail.com"
                  className="group flex items-start gap-4 p-4 sm:p-6 rounded-xl bg-gray-50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-zinc-900 border border-transparent hover:border-gray-200 dark:hover:border-zinc-800 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </div>
                    <div className="text-sm sm:text-base text-gray-900 dark:text-white break-all">
                      theahmednagra@gmail.com
                    </div>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 sm:p-6 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-transparent">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Location
                    </div>
                    <div className="text-sm sm:text-base text-gray-900 dark:text-white">
                      Tech Spark, BWP 63100
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-semibold text-gray-900 dark:text-white">Response time:</span> We typically respond within 24 hours on business days
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Contact;


