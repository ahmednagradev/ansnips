import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

const DropdownMenu = ({ buttonContent, buttonClassName, options = [] }) => {
    const [open, setOpen] = useState(false);
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const menuRef = useRef();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOptionClick = (opt) => {
        if (opt.confirmProps) {
            setPendingConfirm(opt.confirmProps);
        } else if (opt.onClick) {
            opt.onClick();
        }
        setOpen(false);
    };

    return (
        <>
            <div className="relative inline-block" ref={menuRef}>
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className={`flex items-center gap-2 ${buttonClassName}`}
                >
                    {buttonContent}
                    <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center"
                    >
                        <ChevronDown size={16} />
                    </motion.span>
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg py-1 z-50">
                        {options.map((opt, i) => {
                            // COLOR HANDLING
                            const colorClasses =
                                opt.color === "red"
                                    ? "text-rose-600 dark:text-rose-500"
                                    : opt.color === "blue"
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-700 dark:text-gray-300"; // default

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleOptionClick(opt)}
                                    className={`
                                        w-full flex items-center gap-2 px-4 py-2 text-sm text-left
                                        hover:bg-gray-100 dark:hover:bg-zinc-800 transition
                                        ${colorClasses}
                                    `}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                )}
            </div>

            <ConfirmationModal
                isOpen={!!pendingConfirm}
                onClose={() => setPendingConfirm(null)}
                onConfirm={() => {
                    pendingConfirm?.onConfirm?.();
                    setPendingConfirm(null);
                }}
                {...pendingConfirm}
            />
        </>
    );
};

export default DropdownMenu;
