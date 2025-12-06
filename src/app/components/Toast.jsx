import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300); // wait for exit animation
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [message, onClose, duration]);

    const getToastStyles = () => {
        switch (type) {
            case 'error':
                return {
                    bg: 'bg-rose-100 dark:bg-rose-900/20',
                    border: 'border-rose-200 dark:border-rose-800',
                    text: 'text-rose-600 dark:text-rose-400',
                    icon: <AlertCircle size={20} />
                };
            case 'success':
                return {
                    bg: 'bg-green-100 dark:bg-green-900/20',
                    border: 'border-green-200 dark:border-green-800',
                    text: 'text-green-600 dark:text-green-400',
                    icon: <CheckCircle size={20} />
                };
            default:
                return {
                    bg: 'bg-blue-100 dark:bg-blue-900/20',
                    border: 'border-blue-200 dark:border-blue-800',
                    text: 'text-blue-600 dark:text-blue-400',
                    icon: <Info size={20} />
                };
        }
    };

    const styles = getToastStyles();

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="toast"
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="fixed bottom-4 right-4 z-50"
                >
                    <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${styles.bg} ${styles.border}`}
                    >
                        <span className={styles.text}>{styles.icon}</span>
                        <span className={`text-sm font-medium ${styles.text}`}>{message}</span>
                        <button
                            onClick={() => setVisible(false)}
                            className={`p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors ${styles.text}`}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
