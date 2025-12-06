import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import reelsService from '../../appwrite/reelsService';
import userInfoService from '../../appwrite/userInfoService';
import ReelPlayer from '../components/ReelPlayer';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

/**
 * ReelsPage Component - Production Ready
 * Instagram-like vertical video feed with optimized performance
 */
const ReelsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const lastScrollTime = useRef(0);

    const [reels, setReels] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userDetailsCache, setUserDetailsCache] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [touchStart, setTouchStart] = useState({ y: 0, time: 0 });

    useEffect(() => {
        // Prevent pull-to-refresh on mobile
        document.body.style.overscrollBehavior = 'none';

        return () => {
            document.body.style.overscrollBehavior = 'auto';
        };
    }, []);

    /**
     * Fetch user details with memoized caching
     */
    const fetchUserDetails = useCallback(async (userId) => {
        // Return cached if available
        if (userDetailsCache[userId]) {
            return userDetailsCache[userId];
        }

        try {
            const { userInfo, error } = await userInfoService.getUserInfo(userId);
            if (error) throw new Error(error);

            // Cache the result
            setUserDetailsCache(prev => ({ ...prev, [userId]: userInfo }));
            return userInfo;
        } catch (err) {
            console.error('Failed to fetch user details:', err);
            return null;
        }
    }, []); // Empty deps - we check cache manually

    /**
     * Load reels - ONLY ONCE on mount or when ID changes
     */
    const loadReels = useCallback(async () => {
        setIsLoading(true);
        try {
            const { reels: reelsData, error } = await reelsService.listPublicReels();
            if (error) throw new Error(error);

            const reelsList = reelsData.documents;

            if (reelsList.length === 0) {
                setError('No reels available');
                return;
            }

            setReels(reelsList);

            // Fetch user details for all unique users
            const userIds = [...new Set(reelsList.map(r => r.userId))];
            const userPromises = userIds.map(userId => fetchUserDetails(userId));
            await Promise.all(userPromises);

            // Set initial index based on URL
            if (id) {
                const index = reelsList.findIndex(r => r.$id === id);
                if (index !== -1) {
                    setCurrentIndex(index);
                }
            }

            setError('');
        } catch (err) {
            console.error('Failed to load reels:', err);
            setError(err.message || 'Failed to load reels');
        } finally {
            setIsLoading(false);
        }
    }, [id, fetchUserDetails]);

    /**
     * Load reels only once on mount
     * REMOVED currentIndex from dependencies to prevent loop
     */
    useEffect(() => {
        loadReels();
    }, [id]); // Only reload if URL ID changes

    /**
     * Navigate to specific reel with transition management
     */
    const navigateToReel = useCallback((newIndex) => {
        // Prevent if already transitioning
        if (isTransitioning) return;

        // Boundary checks
        if (newIndex < 0 || newIndex >= reels.length) return;
        if (newIndex === currentIndex) return;

        // Lock transitions
        setIsTransitioning(true);
        setCurrentIndex(newIndex);

        // Update URL and increment views
        const newReel = reels[newIndex];
        if (newReel) {
            window.history.replaceState(null, '', `/reels/${newReel.$id}`);
            reelsService.incrementViews(newReel.$id).catch(console.error);
        }

        // Unlock after transition completes
        setTimeout(() => setIsTransitioning(false), 400);
    }, [reels, currentIndex, isTransitioning]);

    /**
     * Debounced wheel handler - 300ms minimum between scrolls
     */
    const handleWheel = useCallback((e) => {
        e.preventDefault();

        const now = Date.now();
        if (now - lastScrollTime.current < 300) return;
        lastScrollTime.current = now;

        if (isTransitioning) return;

        const direction = e.deltaY > 0 ? 1 : -1;
        navigateToReel(currentIndex + direction);
    }, [currentIndex, isTransitioning, navigateToReel]);

    /**
     * Touch handlers with velocity detection
     */
    const handleTouchStart = useCallback((e) => {
        setTouchStart({
            y: e.touches[0].clientY,
            time: Date.now()
        });
    }, []);

    const handleTouchEnd = useCallback((e) => {
        const touchEnd = e.changedTouches[0].clientY;
        const timeDiff = Date.now() - touchStart.time;
        const distance = touchStart.y - touchEnd;

        // Velocity-based gesture detection
        const minDistance = 50;
        const maxTime = 300;

        if (Math.abs(distance) < minDistance || timeDiff > maxTime) return;
        if (isTransitioning) return;

        if (distance > 0) {
            navigateToReel(currentIndex + 1);
        } else {
            navigateToReel(currentIndex - 1);
        }
    }, [touchStart, currentIndex, isTransitioning, navigateToReel]);

    /**
     * Keyboard navigation
     */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateToReel(currentIndex - 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateToReel(currentIndex + 1);
            } else if (e.key === 'Escape') {
                navigate(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, navigateToReel, navigate]);

    /**
     * Preload adjacent videos for instant playback
     */
    useEffect(() => {
        if (reels.length === 0) return;

        const preloadIndexes = [currentIndex + 1, currentIndex + 2];
        const links = [];

        preloadIndexes.forEach(index => {
            if (index < reels.length && reels[index]) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'video';
                link.href = reels[index].videoUrl;
                document.head.appendChild(link);
                links.push(link);
            }
        });

        // Cleanup
        return () => {
            links.forEach(link => link.remove());
        };
    }, [currentIndex, reels]);

    // Loading state
    if (isLoading) return <Loader />;

    // Error state
    if (error && reels.length === 0) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
                <div className="text-center px-6">
                    <p className="text-white text-lg font-medium mb-2">Oops!</p>
                    <p className="text-gray-400 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (reels.length === 0) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
                <div className="text-center px-6">
                    <p className="text-white text-lg font-medium mb-2">No reels yet</p>
                    <p className="text-gray-400 text-sm mb-6">Check back later</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                ref={containerRef}
                className="fixed inset-0 bg-black overflow-hidden z-50 select-none"
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 z-50 w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all shadow-lg active:scale-90"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>

                {/* Reel Counter */}
                {/* <div className="absolute top-4 right-4 z-50 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full">
                    <span className="text-white text-sm font-medium">
                        {currentIndex + 1} / {reels.length}
                    </span>
                </div> */}

                {/* Current Reel with smooth transition */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="absolute inset-0"
                    >
                        <ReelPlayer
                            reel={reels[currentIndex]}
                            userDetails={userDetailsCache[reels[currentIndex]?.userId]}
                            isActive={true}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Hidden preload for next video */}
                {currentIndex < reels.length - 1 && (
                    <div className="hidden">
                        <video
                            src={reels[currentIndex + 1].videoUrl}
                            preload="auto"
                            muted
                        />
                    </div>
                )}
            </div>

            <Toast
                message={error}
                type="error"
                onClose={() => setError('')}
            />
        </>
    );
};

export default ReelsPage;