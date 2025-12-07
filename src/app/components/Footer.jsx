import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const socialLinks = [
        { icon: Instagram, href: "https://instagram.com/theahmednagra", label: "Instagram" },
        { icon: Github, href: "https://github.com/ahmednagradev", label: "GitHub" },
        { icon: Linkedin, href: "https://www.linkedin.com/in/muhammad-ahmed-808071291", label: "LinkedIn" },
    ];

    const links = [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy", href: "/privacy" },
    ];

    return (
        <footer className="border-t border-gray-200 dark:border-zinc-800 w-full mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
                
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-8">
                    
                    {/* Brand */}
                    <div className="lg:col-span-4">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            ansnips
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
                            A modern social platform for authentic connections and creative expression.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="lg:col-span-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Explore
                        </h3>
                        <div className="flex flex-col space-y-3">
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Social */}
                    <div className="lg:col-span-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Connect
                        </h3>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors group"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 sm:pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                        © {new Date().getFullYear()} ansnips. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Built with passion
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;