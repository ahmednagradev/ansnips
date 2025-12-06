import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Masonry from 'react-masonry-css';
import { Heart, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import likeService from "../../appwrite/likeService";
import postService from "../../appwrite/postService";
import reelsService from "../../appwrite/reelsService";
import PostCard from "../components/PostCard";
import userInfoService from "../../appwrite/userInfoService";
import PostSkeleton from "../components/PostSkeleton";
import Toast from "../components/Toast";

/**
 * LikedPosts Page Component - With Masonry Layout
 * Displays all posts AND reels liked by the current user
 * Uses the same masonry grid layout as AllPosts/Profile page
 * Implements infinite scroll pagination for better performance
 */
const LikedPosts = () => {
    const navigate = useNavigate();
    const userData = useSelector((state) => state.userData);
    const [likedContent, setLikedContent] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [error, setError] = useState(null);
    const [userDetailsCache, setUserDetailsCache] = useState({});
    const [notification, setNotification] = useState({ message: "", type: "" });

    const CONTENT_LIMIT = 15; // Match AllPosts pagination

    // Masonry breakpoints - Same as AllPosts
    const breakpointColumns = {
        default: 4,
        1280: 4,
        1024: 3,
        640: 2,
        500: 1
    };

    /**
     * Load liked content on component mount
     */
    useEffect(() => {
        if (userData?.$id) {
            loadLikedContent(true);
        }
    }, [userData?.$id]);

    /**
     * Fetch user details for multiple users
     * Uses caching to avoid redundant API calls
     */
    const fetchUserDetails = async (userId) => {
        // Return from cache if available
        if (userDetailsCache[userId]) {
            return userDetailsCache[userId];
        }

        try {
            const { userInfo } = await userInfoService.getUserInfo(userId);
            const userDetails = userInfo;

            // Cache the result
            setUserDetailsCache(prev => ({
                ...prev,
                [userId]: userDetails
            }));

            return userDetails;
        } catch (error) {
            console.error("Failed to fetch user details:", error);
            return null;
        }
    };

    /**
     * Load liked content (posts + reels) with pagination
     * @param {boolean} reset - Whether to reset the list (used for refresh)
     */
    const loadLikedContent = async (reset = false) => {
        // Prevent multiple simultaneous loads
        if (isLoadingMore && !reset) return;

        reset ? setIsLoading(true) : setIsLoadingMore(true);
        const currentOffset = reset ? 0 : offset;

        try {
            // Fetch liked post/reel IDs
            const likesResult = await likeService.getUserLikes({
                userId: userData.$id,
                limit: CONTENT_LIMIT,
                offset: currentOffset
            });

            if (likesResult.error) {
                throw new Error(likesResult.error);
            }

            // Extract IDs
            const postIds = likesResult.likes.map(like => like.postId);

            // Fetch both posts and reels in parallel
            const contentPromises = postIds.map(async (id) => {
                // Try to fetch as post first
                const postResult = await postService.getPost(id);
                if (!postResult.error && postResult.post) {
                    return { ...postResult.post, _type: "post" };
                }

                // If not found as post, try as reel
                const reelResult = await reelsService.getReel(id);
                if (!reelResult.error && reelResult.reel) {
                    return { ...reelResult.reel, _type: "reel" };
                }

                return null;
            });

            const contentResults = await Promise.all(contentPromises);

            // Filter out nulls and sort by creation date
            const validContent = contentResults
                .filter(item => item !== null)
                .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

            // Fetch user details for all content
            const userIds = [...new Set(validContent.map(item => item.userId))];
            await Promise.all(userIds.map(userId => fetchUserDetails(userId)));

            // Update state
            if (reset) {
                setLikedContent(validContent);
            } else {
                setLikedContent(prev => [...prev, ...validContent]);
            }

            setHasMore(likesResult.hasMore);
            setOffset(currentOffset + validContent.length);
            setError(null);
        } catch (error) {
            console.error("Failed to load liked content:", error);
            setError(error.message || "Failed to load liked content");
            setNotification({ message: "Failed to load liked content", type: "error" });
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    /**
     * Handle scroll event for infinite loading
     */
    useEffect(() => {
        const handleScroll = () => {
            // Check if user scrolled near bottom
            const scrollPosition = window.innerHeight + window.scrollY;
            const bottomPosition = document.documentElement.scrollHeight - 500;

            if (scrollPosition >= bottomPosition && hasMore && !isLoadingMore) {
                loadLikedContent();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, isLoadingMore]);

    /**
     * Handle when content is unliked
     * Remove it from the list immediately
     */
    const handleContentUnliked = (contentId) => {
        setLikedContent(prev => prev.filter(item => item.$id !== contentId));
        setNotification({ message: "Removed from liked", type: "success" });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <div className="container max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 md:py-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Heart className="w-7 h-7 text-rose-500 dark:text-rose-400" />
                                Liked Posts
                            </h1>
                        </div>

                        {/* Content Count */}
                        {likedContent?.length > 0 && !isLoading && (
                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold">
                                {likedContent.length} {likedContent.length === 1 ? "item" : "items"}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <PostSkeleton key={i} />
                            ))}
                        </div>
                    ) : error && likedContent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Failed to load liked content
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                            <button
                                onClick={() => loadLikedContent(true)}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : likedContent.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-zinc-800"
                        >
                            <Heart className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                No liked content yet
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Start exploring and like posts or reels you enjoy
                            </p>
                            <button
                                onClick={() => navigate("/home")}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Explore Content
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Masonry Grid - Same as AllPosts */}
                            <Masonry
                                breakpointCols={breakpointColumns}
                                className="flex -ml-4 w-auto"
                                columnClassName="pl-4 bg-clip-padding"
                            >
                                {likedContent.map((item, index) => (
                                    <motion.div
                                        key={item.$id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="mb-4"
                                    >
                                        <PostCard
                                            post={item}
                                            index={index}
                                            userDetails={userDetailsCache[item.userId]}
                                            showAuthor={true}
                                            onUnlike={() => handleContentUnliked(item.$id)}
                                        />
                                    </motion.div>
                                ))}
                            </Masonry>

                            {/* Loading More Indicator */}
                            {isLoadingMore && (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                                </div>
                            )}

                            {/* End Message */}
                            {!hasMore && likedContent.length > 0 && (
                                <div className="text-center py-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    You've reached the end
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>

            {/* Toast */}
            <Toast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: "", type: "" })}
            />
        </div>
    );
};

export default LikedPosts;