import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Loader2, Search, Sparkles, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import postService from '../../appwrite/postService';
import userInfoService from '../../appwrite/userInfoService';
import PostSkeleton from '../components/PostSkeleton';
import reelsService from '../../appwrite/reelsService';
import PostCard from '../components/PostCard';

const Home = () => {
    const navigate = useNavigate();
    const userData = useSelector(state => state.userData);
    const stateUsername = useSelector(state => state.username);

    const [posts, setPosts] = useState([]);
    const [userDetailsCache, setUserDetailsCache] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    const [reels, setReels] = useState([]);
    const [reelsOffset, setReelsOffset] = useState(0);
    const [hasMoreReels, setHasMoreReels] = useState(true);
    const [isReelsLoading, setIsReelsLoading] = useState(false);
    const [isReelsLoadingMore, setIsReelsLoadingMore] = useState(false);
    const [reelsError, setReelsError] = useState("");

    const observerTarget = useRef(null);
    const POSTS_LIMIT = 10;
    const REELS_LIMIT = 10;

    /** Fetch user details with caching */
    const fetchUserDetails = useCallback(async (userId) => {
        if (userDetailsCache[userId]) return userDetailsCache[userId];
        try {
            const { userInfo, error } = await userInfoService.getUserInfo(userId);
            if (error) throw new Error(error);
            setUserDetailsCache(prev => ({ ...prev, [userId]: userInfo }));
            return userInfo;
        } catch (err) {
            console.error("Failed to fetch user details:", err);
            return null;
        }
    }, [userDetailsCache]);

    /** Load public posts */
    const loadPosts = useCallback(async (reset = false) => {
        if (!reset && !hasMore) return;
        const currentOffset = reset ? 0 : offset;
        reset ? setIsLoading(true) : setIsLoadingMore(true);

        try {
            const { posts: postsData, error } = await postService.listPublicPosts();
            if (error) throw new Error(error);

            const allPosts = postsData.documents;
            const paginatedPosts = allPosts.slice(currentOffset, currentOffset + POSTS_LIMIT);

            // Fetch user details for new posts
            const userIds = [...new Set(paginatedPosts.map(post => post.userId))];
            await Promise.all(userIds.map(fetchUserDetails));

            if (reset) setPosts(paginatedPosts);
            else setPosts(prev => [...prev, ...paginatedPosts]);

            setOffset(currentOffset + paginatedPosts.length);
            setHasMore(currentOffset + paginatedPosts.length < allPosts.length);
            setError("");

        } catch (err) {
            console.error("Failed to load posts:", err);
            setError(err.message || "Failed to load posts");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [offset, hasMore, fetchUserDetails]);

    /** Load public reels */
    const loadReels = useCallback(async (reset = false) => {
        if (!reset && !hasMoreReels) return;
        const currentOffset = reset ? 0 : reelsOffset;
        reset ? setIsReelsLoading(true) : setIsReelsLoadingMore(true);

        try {
            const { reels: reelsData, error } = await reelsService.listPublicReels();
            if (error) throw new Error(error);

            const allReels = reelsData.documents;
            const paginatedReels = allReels.slice(currentOffset, currentOffset + REELS_LIMIT);

            const userIds = [...new Set(paginatedReels.map(reel => reel.userId))];
            await Promise.all(userIds.map(fetchUserDetails));

            if (reset) setReels(paginatedReels);
            else setReels(prev => [...prev, ...paginatedReels]);

            setReelsOffset(currentOffset + paginatedReels.length);
            setHasMoreReels(currentOffset + paginatedReels.length < allReels.length);
            setReelsError("");

        } catch (err) {
            console.error("Failed to load reels:", err);
            setReelsError(err.message || "Failed to load reels");
        } finally {
            setIsReelsLoading(false);
            setIsReelsLoadingMore(false);
        }
    }, [reelsOffset, hasMoreReels, fetchUserDetails]);

    /** Initial load */
    useEffect(() => {
        loadPosts(true);
        loadReels(true);
    }, []);

    /** Merge feed and sort by date */
    const feed = useMemo(() => {
        return [...posts.map(p => ({ ...p, type: "post" })), ...reels.map(r => ({ ...r, type: "reel" }))]
            .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
    }, [posts, reels]);

    /** Infinite scroll observer */
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !isLoadingMore) loadPosts();
        }, { threshold: 0.1 });

        const currentTarget = observerTarget.current;
        if (currentTarget) observer.observe(currentTarget);
        return () => { if (currentTarget) observer.unobserve(currentTarget); };
    }, [hasMore, isLoadingMore, loadPosts]);

    /** Refresh feed */
    const handleRefresh = () => {
        setOffset(0);
        setHasMore(true);
        loadPosts(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discover</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Explore amazing content</p>
                            </div>
                        </div>
                        <div className='flex gap-3'>
                            <button onClick={() => navigate(`/profile/${stateUsername}`)} className="p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all" title="My profile">
                                <UserCircle className='w-5 h-5 text-gray-600 dark:text-gray-400' />
                            </button>
                            <button onClick={() => navigate('/search')} className="p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all" title="Search users">
                                <Search className='w-5 h-5 text-gray-600 dark:text-gray-400' />
                            </button>
                            <button onClick={handleRefresh} disabled={isLoading} className="p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all disabled:opacity-50" title="Refresh feed">
                                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Loading/ Error/ Empty State */}
                {isLoading ? (
                    <div className="space-y-6">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
                ) : error ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
                        <AlertCircle className="w-12 h-12 text-rose-500 dark:text-rose-400 mb-4" />
                        <p className="text-lg font-semibold text-rose-500 dark:text-rose-400 mb-2">Something went wrong</p>
                        <p className="font-medium text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                        <button onClick={handleRefresh} className="px-6 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Try Again</button>
                    </motion.div>
                ) : feed.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-zinc-800">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h2>
                        <p className="font-medium text-gray-600 dark:text-gray-400 mb-6">Be the first to share something with the community</p>
                        {userData && <Link to="/post/create" className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">Create Your First Post</Link>}
                    </motion.div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {feed.map((item, index) => (
                                <PostCard
                                    key={item.$id}
                                    post={item}
                                    index={index}
                                    userDetails={userDetailsCache[item.userId]}
                                    showAuthor={true}
                                    autoplayVideo={true}
                                />
                            ))}
                        </div>

                        {/* Infinite Scroll Trigger */}
                        <div ref={observerTarget} className="py-8">
                            {(isLoadingMore || isReelsLoadingMore) && <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}
                        </div>

                        {/* End of List */}
                        {!hasMore && posts.length > 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">You've reached the end</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
