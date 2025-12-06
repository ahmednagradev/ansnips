import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import followerService from "../../appwrite/followerService";
import Toast from "../components/Toast";
import { notifyFollow } from "../../appwrite/NotificationHelpers";

/**
 * FollowButton Component
 * Shows Follow/Following button with loading state
 * Handles follow/unfollow actions
 */
const FollowButton = ({ targetUserId, onFollowChange }) => {
    const userData = useSelector((state) => state.userData);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [notification, setNotification] = useState({ message: "", type: "" });


    // Check initial follow status
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!userData?.$id || !targetUserId) return;

            try {
                const result = await followerService.checkIsFollowing({
                    followerId: userData.$id,
                    followingId: targetUserId
                });

                if (!result.error) {
                    setIsFollowing(result.isFollowing);
                }
            } catch (error) {
                console.error("Failed to check follow status:", error);
            } finally {
                setIsInitializing(false);
            }
        };

        checkFollowStatus();
    }, [userData?.$id, targetUserId]);

    // Handle follow/unfollow
    const handleToggleFollow = async () => {
        if (!userData?.$id || isLoading) return;
        setIsLoading(true);

        try {
            const result = isFollowing
                ? await followerService.unfollowUser({
                    followerId: userData.$id,
                    followingId: targetUserId
                })
                : await followerService.followUser({
                    followerId: userData.$id,
                    followingId: targetUserId
                })

            if (result.error) {
                setNotification({ message: result.error, type: "error" });
                throw new Error(result.error);
            }

            setIsFollowing(!isFollowing);

            // Notify parent component
            if (onFollowChange) {
                onFollowChange(!isFollowing);
            }

            // Trigger notification
            if (!isFollowing) {
                await notifyFollow({
                    followedUserId: targetUserId,
                    followerId: userData.$id
                });
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Don't show for own profile
    if (userData?.$id === targetUserId) {
        return null;
    }

    if (isInitializing) {
        return (
            <div className="w-24 h-9 rounded-lg bg-neutral-200 dark:bg-zinc-700 opacity-60" />
        );
    }

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFollow();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isLoading}
                className={`flex items-center px-4 py-2 h-fit rounded-lg text-sm font-medium transition-all border border-neutral-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 hover:scale-102 disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100`}
            >
                {isFollowing ? (
                    <span className="text-sm">Following</span>
                ) : (
                    <span className="text-sm">Follow</span>
                )}
            </button>
            <Toast
                message={notification.message}
                onClose={() => setNotification({ message: "" })}
            />
        </>
    );
};

export default FollowButton;