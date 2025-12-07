import { motion } from 'framer-motion';
import { MessageCircle, Video, Users, Shield, Zap, Bell } from 'lucide-react';

const LandingPage = () => {

    const features = [
        {
            icon: MessageCircle,
            title: "Real-Time Chat",
            description: "Instant messaging with seamless conversations"
        },
        {
            icon: Video,
            title: "Reels",
            description: "Share video moments that captivate"
        },
        {
            icon: Users,
            title: "Profiles",
            description: "Express yourself with rich, customizable profiles"
        },
        {
            icon: Bell,
            title: "Notifications",
            description: "Stay updated with intelligent alerts"
        },
        {
            icon: Shield,
            title: "Secure",
            description: "Enterprise-grade security and privacy"
        },
        {
            icon: Zap,
            title: "Fast",
            description: "Lightning-fast performance across devices"
        }
    ];

    return (
        <div className="min-h-screen">
            
            {/* Hero Section */}
            <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-28 pb-16 sm:pb-20 lg:pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-gray-900 dark:text-white mb-6 sm:mb-8 tracking-tight leading-none">
                        Connect.<br />Create.<br />Share.
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 leading-relaxed px-4">
                        A modern social platform built for authentic connections and creative expression
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                        <a
                            href="/auth"
                            className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 text-base sm:text-lg"
                        >
                            Get Started
                        </a>
                        <a
                            href="/about"
                            className="px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg font-medium transition-all duration-200 text-base sm:text-lg"
                        >
                            Learn More
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Features Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-y border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50"
            >
                <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 * index + 0.4 }}
                                className="text-center px-4"
                            >
                                <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 mb-4 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Social Proof Section */}
            <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="text-center"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4">
                        Built for the way you connect
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-10 sm:mb-12 leading-relaxed max-w-2xl mx-auto px-4">
                        Whether you're sharing moments with friends, discovering new content, or building your community, we've designed every detail to make your experience seamless and enjoyable.
                    </p>
                    <div className="grid grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-2xl mx-auto px-4">
                        <div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-2">Real-time</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Instant updates</div>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-2">Secure</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Privacy first</div>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-2">Beautiful</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Crafted design</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="bg-gray-50 dark:bg-zinc-900/50"
            >
                <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                        Ready to get started?
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 px-4">
                        Join thousands of creators sharing their stories
                    </p>
                    <a
                        href="/auth"
                        className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 text-base sm:text-lg"
                    >
                        Create Your Account
                    </a>
                </div>
            </motion.div>

        </div>
    );
};

export default LandingPage;