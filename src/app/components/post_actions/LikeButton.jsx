import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import likeService from "../../../appwrite/likeService";
import { useSelector } from "react-redux";
import Toast from "../../components/Toast";
import { notifyLike } from "../../../helpers/notificationHelpers";

/**
 * LikeButton Component
 * Handles like/unlike functionality with optimistic UI updates
 * Shows current like status and CLICKABLE count to view who liked
 * 
 * @param {string} post - The post
 * @param {number} initialLikesCount - Initial number of likes (optional)
 * @param {function} onLikeChange - Callback when like status changes (optional)
 * @param {function} onCountClick - Callback when count is clicked to show likes modal (NEW)
 */
const LikeButton = ({ post, initialLikesCount = 0, onLikeChange, onCountClick }) => {
    const userData = useSelector((state) => state.userData);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Initialize like status and count
    useEffect(() => {
        const initializeLikeStatus = async () => {
            if (!userData?.$id || !post.$id) return;

            try {
                const [likeStatusResult, countResult] = await Promise.all([
                    likeService.getUserLikeOnPost({
                        userId: userData.$id,
                        postId: post.$id
                    }),
                    likeService.getLikesCount(post.$id)
                ]);

                if (!likeStatusResult.error) {
                    setIsLiked(!!likeStatusResult.like);
                }

                if (!countResult.error) {
                    setLikesCount(countResult.count);
                }
            } catch (error) {
                console.error("Failed to initialize like status:", error);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeLikeStatus();
    }, [userData?.$id, post.$id]);

    // Handle like/unlike with optimistic update
    const handleLike = async (e) => {
        e.stopPropagation();

        if (!userData?.$id) {
            setNotification({ message: "Please login to like posts", type: "error" });
            return;
        }

        if (isLoading) return;

        const previousIsLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        setIsLoading(true);

        try {
            const result = await likeService.toggleLike({
                userId: userData.$id,
                postId: post.$id
            });

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.liked !== !previousIsLiked) {
                setIsLiked(result.liked);
                setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
            }

            if (onLikeChange) {
                onLikeChange(result.liked, likesCount);
            }

            // Trigger notification if liked (not unliked)
            if (result.liked && post.userId) {
                await notifyLike({
                    postOwnerId: post.userId,
                    actorId: userData.$id,
                    postId: post.$id
                });
            }

        } catch (error) {
            setIsLiked(previousIsLiked);
            setLikesCount(previousCount);

            console.error("Failed to toggle like:", error);
            setNotification({
                message: error.message || "Failed to update like. Please try again.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle count click to show likes modal
    const handleCountClick = (e) => {
        e.stopPropagation();
        if (likesCount > 0 && onCountClick) {
            onCountClick();
        }
    };

    if (isInitializing) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                <div className="w-8 h-4 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center gap-2">
                {/* Like/Unlike Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    disabled={isLoading}
                    className={`group relative ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                    aria-label={isLiked ? "Unlike post" : "Like post"}
                >
                    <Heart
                        className={`w-6 h-6 transition-all duration-200 ${isLiked
                            ? 'fill-rose-500 text-rose-500'
                            : 'text-gray-700 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400'
                            }`}
                    />

                    {isLiked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0"
                        >
                            <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                        </motion.div>
                    )}
                </motion.button>

                {/* CLICKABLE Likes Count - Shows modal when clicked */}
                {likesCount > 0 && (
                    <motion.button
                        key={likesCount}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                        onClick={handleCountClick}
                        className={`text-sm font-medium text-gray-900 dark:text-white transition-colors ${onCountClick ? 'hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer' : ''
                            }`}
                        aria-label="View who liked this post"
                    >
                        {likesCount.toLocaleString()}
                    </motion.button>
                )}
            </div>

            <Toast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />
        </>
    );
};

export default LikeButton;