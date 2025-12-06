import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import likeService from "../../appwrite/likeService";
import userInfoService from "../../appwrite/userInfoService";
import ProfileAvatar from "./ProfileAvatar";

/**
 * LikesModal Component
 * Instagram-style modal showing users who liked a post
 * Features: User list, follow buttons, navigation to profiles
 */
const LikesModal = ({ postId, isOpen, onClose }) => {
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.userData);

    const [likes, setLikes] = useState([]);
    const [usersData, setUsersData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);

    const LIMIT = 20;

    /**
     * Load likes when modal opens
     */
    useEffect(() => {
        if (isOpen && postId) {
            loadLikes(true);
        }
    }, [isOpen, postId]);

    /**
     * Load likes with pagination
     */
    const loadLikes = async (reset = false) => {
        if (!reset && !hasMore) return;

        const currentOffset = reset ? 0 : offset;
        setIsLoading(true);
        setError(null);

        try {
            // Get likes for this post
            const result = await likeService.getPostLikes({
                postId,
                limit: LIMIT
            });

            if (result.error) throw new Error(result.error);

            // Get unique user IDs
            const userIds = result.likes.map(like => like.userId);

            // Fetch user info for each user
            const userDataPromises = userIds.map(userId =>
                userInfoService.getUserInfo(userId)
            );
            const userDataResults = await Promise.all(userDataPromises);

            // Build users data map
            const dataMap = reset ? {} : { ...usersData };
            userDataResults.forEach((result, index) => {
                if (!result.error) {
                    dataMap[userIds[index]] = result.userInfo;
                }
            });

            // Update state
            if (reset) {
                setLikes(result.likes);
            } else {
                setLikes(prev => [...prev, ...result.likes]);
            }

            setUsersData(dataMap);
            setHasMore(result.likes.length === LIMIT);
            setOffset(currentOffset + result.likes.length);

        } catch (err) {
            console.error("Failed to load likes:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Navigate to user profile
     */
    const handleUserClick = (username) => {
        navigate(`/profile/${username}`);
        onClose();
    };

    /**
     * Close modal on backdrop click
     */
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleBackdropClick}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Likes
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent">
                        {isLoading && likes.length === 0 ? (
                            /* Loading State */
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                            </div>
                        ) : error ? (
                            /* Error State */
                            <div className="text-center py-12 px-4">
                                <p className="text-rose-500 dark:text-rose-400 mb-4">
                                    {error}
                                </p>
                                <button
                                    onClick={() => loadLikes(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : likes.length === 0 ? (
                            /* Empty State */
                            <div className="text-center py-12 px-4">
                                <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No likes yet
                                </p>
                            </div>
                        ) : (
                            /* Likes List */
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {likes.map((like, index) => {
                                    const userInfo = usersData[like.userId];

                                    return (
                                        <motion.div
                                            key={like.$id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                {/* User Info - Clickable */}
                                                <button
                                                    onClick={() => handleUserClick(userInfo?.username)}
                                                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                                >
                                                    <ProfileAvatar
                                                        profileId={like.userId}
                                                        size="md"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {userInfo?.username  || "Unknown"}
                                                        </p>
                                                        {userInfo?.bio && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                                {userInfo.bio}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Load More */}
                                {hasMore && (
                                    <div className="p-4">
                                        <button
                                            onClick={() => loadLikes()}
                                            disabled={isLoading}
                                            className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? "Loading..." : "Load more"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LikesModal;