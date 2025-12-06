import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightFromLine, Fullscreen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AiChatIframe = ({ isOpen, onClose }) => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="ai-drawer"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[420px] lg:w-[400px] shadow-2xl z-50 bg-white dark:bg-black
                     border-l border-gray-200 dark:border-zinc-800"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center h-16 px-4 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                        <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
                            Assistant
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate("/assistant");
                                }}
                                title="Open assistant page"
                                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                                <Fullscreen size={20} className="text-zinc-600 dark:text-zinc-400" />
                            </button>
                            <button
                                onClick={onClose}
                                title="Close assistant"
                                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                                <ArrowRightFromLine size={20} className="text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    {/* AI Chat iframe */}
                    <div className="h-[calc(100%-64px)]">
                        <iframe
                            src={`/assistant?embed=true&theme=${isDarkMode ? "dark" : "light"}`}
                            className="w-full h-full border-none"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AiChatIframe;
