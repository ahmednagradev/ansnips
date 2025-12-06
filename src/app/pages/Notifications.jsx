import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Heart, MessageCircle, Image, Loader2, Check, UserPlus2, Users, UserPlus, ArrowLeft, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import notificationService from "../../appwrite/notificationService";
import userInfoService from "../../appwrite/userInfoService";
import ProfileAvatar from "../components/ProfileAvatar";
import Toast from "../components/Toast";
import Loader from "../components/Loader";

/**
 * Notifications Page
 * Shows all user notifications with clickable actions
 * Types: like, comment, follow, post
 */
const Notifications = () => {
    const navigate = useNavigate();
    const userData = useSelector((state) => state.userData);

    const [notifications, setNotifications] = useState([]);
    const [actorsData, setActorsData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [isMarkReadButtonDisabled, setIsMarkReadButtonDisabled] = useState(false);

    const LIMIT = 20;

    // Redirect if not authenticated
    useEffect(() => {
        if (!userData?.$id) {
            navigate("/login");
        }
    }, [userData, navigate]);

    // Load notifications on mount
    useEffect(() => {
        if (userData?.$id) {
            loadNotifications(true);
        }
    }, [userData?.$id]);

    // Load notifications with pagination
    const loadNotifications = async (reset = false) => {
        const currentOffset = reset ? 0 : offset;
        setIsLoading(true);

        try {
            const result = await notificationService.getUserNotifications({
                userId: userData.$id,
                limit: LIMIT,
                offset: currentOffset
            });

            if (result.error) throw new Error(result.error);

            // Fetch actor details for each notification
            const actorIds = [...new Set(result.notifications.map(n => n.actorId))];
            const actorDataPromises = actorIds.map(actorId =>
                userInfoService.getUserInfo(actorId)
            );
            const actorDataResults = await Promise.all(actorDataPromises);

            const dataMap = reset ? {} : { ...actorsData };
            actorDataResults.forEach((result, index) => {
                if (!result.error) {
                    dataMap[actorIds[index]] = result.userInfo;
                }
            });

            if (reset) {
                setNotifications(result.notifications);
            } else {
                setNotifications(prev => [...prev, ...result.notifications]);
            }

            setActorsData(dataMap);
            setHasMore(result.hasMore);
            setOffset(currentOffset + result.notifications.length);

        } catch (error) {
            console.error("Failed to load notifications:", error);
            setNotification({ message: error.message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        try {
            const result = await notificationService.markAllAsRead(userData.$id);
            if (result.error) throw new Error(result.error);

            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );

            setNotification({ message: "All marked as read", type: "success" });
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notif) => {
        // Mark as read
        if (!notif.isRead) {
            await notificationService.markAsRead(notif.$id);
            setNotifications(prev =>
                prev.map(n => n.$id === notif.$id ? { ...n, isRead: true } : n)
            );
        }

        // Navigate based on type
        switch (notif.type) {
            case 'like':
            case 'comment':
                if (notif.postId) {
                    navigate(`/post/${notif.postId}`);
                }
                break;
            case 'follow':
                const actor = actorsData[notif.actorId];
                if (actor?.username) {
                    navigate(`/profile/${actor.username}`);
                }
                break;
            case 'post':
                if (notif.postId) {
                    navigate(`/post/${notif.postId}`);
                }
                break;
        }
    };

    // Format notification text
    const getNotificationText = (notif) => {
        const actor = actorsData[notif.actorId];
        const username = actor?.username || "Someone";

        switch (notif.type) {
            case 'like':
                return { main: `${username} liked your post`, sub: null };
            case 'comment':
                return { main: `${username} commented on your post`, sub: notif.commentText };
            case 'follow':
                return { main: `${username} started following you`, sub: null };
            case 'post':
                return { main: `${username} uploaded a new post`, sub: null };
            default:
                return { main: "New notification", sub: null };
        }
    };

    // Format time
    const formatTime = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (isLoading && notifications.length === 0) {
        return <Loader />
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Bell className="w-7 h-7 text-blue-500 dark:text-blue-400" />
                            Notifications
                        </h1>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            title="Mark all read"
                            onClick={() => {
                                if (isMarkReadButtonDisabled) return; // prevent multiple clicks
                                handleMarkAllRead();
                                setIsMarkReadButtonDisabled(true);
                                setTimeout(() => setIsMarkReadButtonDisabled(false), 3000); // re-enable after 3s
                            }}
                            disabled={isMarkReadButtonDisabled}
                            className={`p-2 bg-gray-100 dark:bg-zinc-900 text-blue-500 dark:text-blue-400 rounded-xl transition-all
                                ${isMarkReadButtonDisabled ? "opacity-50 cursor-wait" : "hover:scale-105 active:scale-95"}
                            `}
                        >
                            <CheckCheck className="w-5 h-5" />
                        </button>
                    )}

                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-zinc-800"
                    >
                        <Bell className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No notifications yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            When someone likes, comments, or follows you, you'll see it here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="rounded-lg overflow-hidden shadow-sm">
                        {notifications.map((notif, index) => {
                            const actor = actorsData[notif.actorId];
                            const { main, sub } = getNotificationText(notif);

                            // Soft elegant gradients for each type
                            const typeBg =
                                notif.type === "like"
                                    ? "bg-gradient-to-br from-rose-400 to-pink-500"
                                    : notif.type === "comment"
                                        ? "bg-gradient-to-br from-sky-400 to-indigo-500"
                                        : notif.type === "follow"
                                            ? "bg-gradient-to-br from-teal-400 to-emerald-500"
                                            : "bg-gradient-to-br from-violet-400 to-purple-500";

                            const icon =
                                notif.type === "like" ? (
                                    <Heart className="w-3.5 h-3.5" fill="currentColor" />
                                ) : notif.type === "comment" ? (
                                    <MessageCircle className="w-3.5 h-3.5" />
                                ) : notif.type === "follow" ? (
                                    <UserPlus className="w-3.5 h-3.5" />
                                ) : (
                                    <Image className="w-3.5 h-3.5" />
                                );

                            return (
                                <motion.button
                                    key={notif.$id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full flex items-start justify-between px-4 py-3 transition-all
                                        ${notif.isRead
                                            ? "bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800"
                                            : "bg-gradient-to-br from-blue-300/60 to-gray-100 dark:from-blue-900/60 dark:to-zinc-900 border-b border-blue-300/60 dark:border-blue-900/60"}
                                        hover:scale-[1.010]`}
                                >
                                    {/* Left section */}
                                    <div className="flex items-start gap-4 min-w-0">
                                        {/* Avatar + Icon */}
                                        <div className="relative flex-shrink-0">
                                            <ProfileAvatar profileId={notif.actorId} size="md" />
                                            <div
                                                className={`absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center ${typeBg}
                                                text-white shadow-[0_0_4px_rgba(0,0,0,0.15)] ring-1 ring-white/80 dark:ring-zinc-900/80`}
                                            >
                                                {icon}
                                            </div>
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-[15px] leading-snug text-start text-gray-900 dark:text-gray-100 ${notif.isRead ? "font-medium" : "font-semibold"}`}
                                            >
                                                {main}
                                            </p>
                                            {sub && (
                                                <p className="text-sm text-start text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-2">
                                                    {sub}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-3 mt-1">
                                        {formatTime(notif.$createdAt)}
                                    </p>
                                </motion.button>
                            );
                        })}


                        {/* Load More */}
                        {hasMore && (
                            <button
                                onClick={() => loadNotifications()}
                                disabled={isLoading}
                                className="w-full py-3 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? "Loading..." : "Load more"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Toast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: "", type: "" })}
            />
        </div>
    );
};

export default Notifications;