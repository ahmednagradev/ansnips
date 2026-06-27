import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate   = useNavigate();
  const authStatus = useSelector((state) => state?.authStatus);

  useEffect(() => {
    if (authStatus) navigate('/home');
  }, [authStatus]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">

      {/* ── HERO ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 text-center">

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[clamp(42px,8.5vw,76px)] font-semibold tracking-[-0.03em] leading-[1.06] text-gray-900 dark:text-white mb-6"
        >
          Share moments.<br />
          <span className="text-blue-600 dark:text-blue-400">Build connections.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2lg mx-auto leading-relaxed mb-10"
        >
          Ansnips is a place to post, chat, and connect, without the clutter.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-[15px] font-medium transition-colors duration-150"
          >
            Get started
          </a>
          <a
            href="/about"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:text-gray-900 dark:hover:text-white rounded-lg text-[15px] font-medium transition-all duration-150"
          >
            Learn more
          </a>
        </motion.div>

      </section>

      {/* ── DIVIDER ── */}
      <div className="border-t border-gray-100 dark:border-zinc-900" />

      {/* ── MIDDLE SECTION ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-5">
          Everything in one place
        </h2>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
          Less friction. More connection. A streamlined environment engineered precisely to keep your focus on the creators, the stories, and the conversations you actually care about.
        </p>
      </motion.section>

      {/* ── CTA BAND ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="border-t border-b border-gray-100 dark:border-zinc-900 bg-gray-50 dark:bg-zinc-900/40"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-8">
            Connect, create, and share without limits.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 rounded-lg text-[15px] font-medium transition-colors duration-150"
          >
            Create your account
          </a>
        </div>
      </motion.section>

    </div>
  );
};

export default LandingPage;