import { NavLink } from "react-router-dom";
import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
    const socialLinks = [
        { icon: Instagram, href: "https://instagram.com/theahmednagra", label: "Instagram" },
        { icon: Github, href: "https://github.com/ahmednagradev", label: "GitHub" },
        { icon: Linkedin, href: "https://www.linkedin.com/in/muhammad-ahmed-808071291", label: "LinkedIn" },
    ];

    return (
        <footer className="from-gray-50 to-white dark:from-zinc-900 dark:to-black border-t border-gray-200 dark:border-zinc-800 w-full mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    <div className="flex flex-col space-y-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-400 bg-clip-text text-transparent"
                            style={{
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            ansnips
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Building the future of web development, one snippet at a time.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Quick Links
                        </h3>
                        <div className="flex flex-col space-y-2">
                            <NavLink
                                to="/about"
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                About Us
                            </NavLink>
                            <NavLink
                                to="/contact"
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                Contact Us
                            </NavLink>
                            <NavLink
                                to="/privacy"
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                Privacy Policy
                            </NavLink>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Connect With Us
                        </h3>
                        <div className="flex space-x-2">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 bg-gray-100  dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors group"
                                >
                                    <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800">
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} ansnips. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;