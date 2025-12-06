import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'blue', // 'blue' (default) | 'red'
}) => {
    if (!isOpen) return null;

    // Choose color classes based on variant
    const colors =
        variant === 'red'
            ? {
                iconBg: 'bg-rose-100 dark:bg-rose-900/20',
                iconText: 'text-rose-600 dark:text-rose-400',
                buttonBg: 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600',
            }
            : {
                iconBg: 'bg-blue-100 dark:bg-blue-900/20',
                iconText: 'text-blue-600 dark:text-blue-400',
                buttonBg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
            };

    return (
        <div className="h-[100vh] fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-sm mx-4 relative overflow-hidden"
            >
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${colors.iconText} ${colors.iconBg}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {message}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="mt-3 w-full rounded-lg border border-gray-300 dark:border-zinc-700 shadow-sm px-5 py-2.5 bg-white dark:bg-zinc-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 sm:mt-0 sm:w-auto transition-all duration-200"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`mt-3 w-full rounded-lg border border-transparent shadow-sm px-5 py-2.5 ${colors.buttonBg} text-base font-medium text-white sm:w-auto sm:mt-0 transition-all duration-200 transform hover:scale-105 active:scale-95`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ConfirmationModal;
