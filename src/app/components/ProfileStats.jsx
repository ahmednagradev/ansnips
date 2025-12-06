import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import followerService from "../../appwrite/followerService";

/**
 * ProfileStats Component
 * Shows posts count, followers count, and following count
 * Clickable to navigate to followers/following pages
 * Instagram-style design
 * 
 * Usage in profile page:
 * <ProfileStats username={username} postsCount={posts.length} />
 */
const ProfileStats = ({ username, postsCount = 0 }) => {
    const navigate = useNavigate();
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            if (!username) return;

            try {
                // Get user ID from username
                const userInfoService = (await import("../../appwrite/userInfoService")).default;
                const userResult = await userInfoService.getUserIdByUsername({ username });

                if (userResult.error) throw new Error(userResult.error);

                // Get follower/following counts
                const statsResult = await followerService.getUserStats(userResult.userId);

                if (!statsResult.error) {
                    setFollowersCount(statsResult.followersCount);
                    setFollowingCount(statsResult.followingCount);
                }
            } catch (error) {
                console.error("Failed to load stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, [username]);

    // Format count for display
    const formatCount = (count) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-around py-4 border-y border-gray-200 dark:border-zinc-800">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center">
                        <div className="w-12 h-6 bg-gray-200 dark:bg-zinc-700 rounded mb-1 animate-pulse" />
                        <div className="w-16 h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between py-1 border-y border-gray-200 dark:border-zinc-800 text-center">
            {/* Posts */}
            <div className="flex-1">
                <div className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    {formatCount(postsCount)}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {postsCount === 1 ? "Post" : "Posts"}
                </div>
            </div>

            {/* Followers */}
            <button
                onClick={() => navigate(`/profile/${username}/followers`)}
                className="flex-1 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors rounded-lg py-2"
            >
                <div className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    {formatCount(followersCount)}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {followersCount === 1 ? "Follower" : "Followers"}
                </div>
            </button>

            {/* Following */}
            <button
                onClick={() => navigate(`/profile/${username}/following`)}
                className="flex-1 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors rounded-lg py-2"
            >
                <div className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    {formatCount(followingCount)}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Following
                </div>
            </button>
        </div>

    );
};

export default ProfileStats;