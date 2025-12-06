import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import followerService from "../../appwrite/followerService";
import userInfoService from "../../appwrite/userInfoService";
import ProfileAvatar from "../components/ProfileAvatar";
import FollowButton from "../components/FollowButton";
import Toast from "../components/Toast";
import Loader from "../components/Loader";

/**
 * Following Page
 * Shows list of users that the profile user is following
 * Instagram-style design with follow buttons
 */
const Following = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.userData);

    const [profileUserId, setProfileUserId] = useState(null);
    const [following, setFollowing] = useState([]);
    const [followingData, setFollowingData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [notification, setNotification] = useState({ message: "", type: "" });

    const LIMIT = 20;

    // Get profile user ID from username
    useEffect(() => {
        const getProfileUserId = async () => {
            try {
                const result = await userInfoService.getUserIdByUsername({ username });
                if (result.error) throw new Error(result.error);
                setProfileUserId(result.userId);
            } catch (error) {
                console.error("Failed to get user:", error);
                setNotification({ message: error.message, type: "error" });
            }
        };

        if (username) {
            getProfileUserId();
        }
    }, [username]);

    // Load following
    useEffect(() => {
        if (!profileUserId) return;

        const loadFollowing = async () => {
            setIsLoading(true);

            try {
                const result = await followerService.getFollowing({
                    userId: profileUserId,
                    limit: LIMIT,
                    offset: 0
                });

                if (result.error) throw new Error(result.error);

                setFollowing(result.following);
                setHasMore(result.hasMore);
                setOffset(result.following.length);

                // Fetch user info for each following
                const userDataPromises = result.following.map(userId =>
                    userInfoService.getUserInfo(userId)
                );
                const userDataResults = await Promise.all(userDataPromises);

                const dataMap = {};
                userDataResults.forEach((res, index) => {
                    const userId = result.following[index]; // original userId
                    if (!result.error) {
                        dataMap[userId] = res.userInfo;
                    }
                });
                setFollowingData(dataMap);

            } catch (error) {
                console.error("Failed to load following:", error);
                setNotification({ message: error.message, type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        loadFollowing();
    }, [profileUserId]);

    // Load more following
    const loadMore = async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);

        try {
            const result = await followerService.getFollowing({
                userId: profileUserId,
                limit: LIMIT,
                offset
            });

            if (result.error) throw new Error(result.error);

            setFollowing(prev => [...prev, ...result.following]);
            setHasMore(result.hasMore);
            setOffset(prev => prev + result.following.length);

            // Fetch user info
            const userDataPromises = result.following.map(userId =>
                userInfoService.getUserInfo(userId)
            );
            const userDataResults = await Promise.all(userDataPromises);

            const dataMap = { ...followingData };
            userDataResults.forEach((result, index) => {
                if (!result.error) {
                    dataMap[result.following[index]] = result.userInfo;
                }
            });
            setFollowingData(dataMap);

        } catch (error) {
            console.error("Failed to load more following:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && following.length === 0) {
        return <Loader />
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Following
                    </h1>
                </div>

                {/* Following List */}
                {following.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-zinc-800"
                    >
                        <Users className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Not following anyone yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            When this account follows people, they'll appear here
                        </p>
                    </motion.div>
                ) : (
                    <div className="rounded-2xl overflow-hidden shadow-md">
                        {following.map((userId, index) => {
                            const userInfo = followingData[userId];

                            return (
                                <motion.div
                                    key={userId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="px-4 py-3 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 hover:scale-[1.010] transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="flex items-center gap-3 flex-1 cursor-pointer"
                                            onClick={() => navigate(`/profile/${userInfo?.username}`)}
                                        >
                                            <ProfileAvatar
                                                profileId={userId}
                                                size="md"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                                                    {userInfo?.username}
                                                </h3>
                                                {userInfo?.bio && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                                        {userInfo.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <FollowButton targetUserId={userId} />
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Load More */}
                        {hasMore && (
                            <button
                                onClick={loadMore}
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

export default Following;