import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import commentService from "../../../appwrite/commentService";

/**
 * CommentButton Component
 * Shows comment count and triggers comment modal/section
 * Updates count in real-time when comments are added/removed
 * 
 * @param {string} postId - ID of the post
 * @param {number} initialCommentsCount - Initial number of comments (optional)
 * @param {function} onClick - Callback when button is clicked
 * @param {number} commentsCount - External comments count (for real-time updates)
 */
const CommentButton = ({ postId, initialCommentsCount = 0, onClick = true, commentsCount: externalCount, shouldShowLoader = true }) => {
    const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
    const [isInitializing, setIsInitializing] = useState(true);

    /**
     * Initialize component by fetching current comments count
     * Runs once when component mounts
     */
    useEffect(() => {
        const initializeCommentsCount = async () => {
            if (!postId) return;

            try {
                const result = await commentService.getCommentsCount(postId);

                if (!result.error) {
                    setCommentsCount(result.count);
                }
            } catch (error) {
                console.error("Failed to initialize comments count:", error);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeCommentsCount();
    }, [postId]);

    /**
     * Update count when external count changes
     * This allows parent components to update the count in real-time
     */
    useEffect(() => {
        if (externalCount !== undefined) {
            setCommentsCount(externalCount);
        }
    }, [externalCount]);

    /**
     * Handle button click
     * Prevents event propagation to avoid triggering parent click handlers
     */
    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        }
    };

    // Show loading state during initialization
    if (isInitializing && shouldShowLoader) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                <div className="w-4 h-4 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClick}
                className="group"
                aria-label="View comments"
            >
                <MessageCircle className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" />
            </motion.button>

            {/* Comments count - only show if greater than 0 */}
            {commentsCount > 0 && (
                <motion.span
                    key={commentsCount}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                    className="text-sm font-medium text-gray-900 dark:text-white"
                >
                    {commentsCount.toLocaleString()}
                </motion.span>
            )}
        </div>
    );
};

export default CommentButton;