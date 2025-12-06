import { motion } from 'framer-motion';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { Code2, Book, Shield, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';

const LandingPage = () => {
    const userData = useSelector((state) => state.userData);
    const navigate = useNavigate();

    const features = [
        {
            icon: Code2,
            title: "Code Snippets",
            description: "Share and organize your code snippets with syntax highlighting and easy organization."
        },
        {
            icon: Shield,
            title: "Private & Secure",
            description: "Your snippets are private and secure. Only you can access your personal collection."
        },
        {
            icon: Book,
            title: "Documentation",
            description: "Add detailed notes and documentation to your snippets for better understanding."
        },
        {
            icon: Zap,
            title: "Quick Access",
            description: "Fast and efficient way to manage and retrieve your code snippets when needed."
        }
    ];

    // Normal redirect logic for authenticated users
    if (userData) {
        if (!userData?.emailVerification) {
            return <Navigate to="/verify" replace />;
        }
        return <Navigate to="/home" replace />;
    }

    return (
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                >
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-400 bg-clip-text text-transparent"
                        style={{
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Code Snippets
                    </span>
                    <br />
                    <span className="text-gray-900 dark:text-white">
                        Organized & Secure
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
                >
                    Your personal code snippet manager. Save, organize, and access your code snippets securely.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <button
                        onClick={() => navigate("/auth")}
                        className="inline-flex items-center font-semibold px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                    >
                        Get Started
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 * (index + 4) }}
                        className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <feature.icon className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="mt-20 text-center"
            >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Ready to Get Started?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Join now and start organizing your code snippets efficiently.
                </p>
                <NavLink
                    to="/auth"
                    className="inline-flex items-center text-sm font-semibold px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                    Sign Up Now
                </NavLink>
            </motion.div>
        </div>
    );
};

export default LandingPage;