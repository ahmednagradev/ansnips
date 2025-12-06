import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import notificationService from "../../appwrite/notificationService";

/**
 * NotificationButton Component
 * Navigation button that shows unread notifications count
 * Displays animated badge when there are unread notifications
 */
const NotificationButton = () => {
    const navigate = useNavigate();
    const userData = useSelector((state) => state.userData);  
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch unread count on mount and periodically
    useEffect(() => {
        if (!userData?.$id) {
            setIsLoading(false);
            return;
        }

        const fetchUnreadCount = async () => {
            try {
                const result = await notificationService.getUnreadCount(userData.$id);

                if (!result.error) {
                    setUnreadCount(result.count);
                }
            } catch (error) {
                console.error("Failed to fetch unread count:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchUnreadCount();

        // Poll every 30 seconds for updates
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [userData?.$id]);

    // Navigate to notifications page
    const handleClick = () => {
        if (!userData?.$id) {
            navigate("/login");
            return;
        }
        navigate("/notifications");
    };

    return (
        <button
            onClick={handleClick}
            className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
            <Bell size={26} />
            
            {/* Unread badge */}
            <AnimatePresence>
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 dark:bg-rose-400 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
};

export default NotificationButton;