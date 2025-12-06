import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import saveService from "../../../appwrite/saveService";
import { useSelector } from "react-redux";
import Toast from "../../components/Toast";

/**
 * SaveButton Component
 * Handles save/unsave (bookmark) functionality with optimistic UI updates
 * Shows current save status
 * 
 * @param {string} postId - ID of the post
 * @param {function} onSaveChange - Callback when save status changes (optional)
 */
const SaveButton = ({ postId, onSaveChange }) => {
    const userData = useSelector((state) => state.userData);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [notification, setNotification] = useState({ message: "", type: "" });


    /**
     * Initialize component by fetching current save status
     * Runs once when component mounts
     */
    useEffect(() => {
        const initializeSaveStatus = async () => {
            if (!userData?.$id || !postId) return;

            try {
                const result = await saveService.getUserSaveOnPost({
                    userId: userData.$id,
                    postId
                });

                if (!result.error) {
                    setIsSaved(!!result.save);
                }
            } catch (error) {
                console.error("Failed to initialize save status:", error);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeSaveStatus();
    }, [userData?.$id, postId]);

    /**
     * Handle save/unsave action with optimistic UI update
     * Updates UI immediately, then syncs with backend
     * Reverts changes if backend request fails
     */
    const handleSave = async (e) => {
        e.stopPropagation(); // Prevent triggering parent click events

        if (!userData?.$id) {
            setNotification({ message: "Please login to save posts", type: "error" });
            return;
        }

        if (isLoading) return; // Prevent multiple simultaneous requests

        // Optimistic UI update - update immediately for better UX
        const previousIsSaved = isSaved;
        setIsSaved(!isSaved);
        setIsLoading(true);

        try {
            const result = await saveService.toggleSave({
                userId: userData.$id,
                postId
            });

            if (result.error) {
                throw new Error(result.error);
            }

            // Verify the backend state matches our optimistic update
            if (result.saved !== !previousIsSaved) {
                setIsSaved(result.saved);
            }

            // Show success message           
            // setNotification({ message: result.saved ? "Post saved" : "Post unsaved", type: "success" });

            // Notify parent component of the change
            if (onSaveChange) {
                onSaveChange(result.saved);
            }
        } catch (error) {
            // Revert optimistic update on error
            setIsSaved(previousIsSaved);

            console.error("Failed to toggle save:", error);
            setNotification({ message: error.message || "Failed to update save. Please try again.", type: "error" });;
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state during initialization
    if (isInitializing) {
        return (
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
        );
    }

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            disabled={isLoading}
            className={`group relative ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
            aria-label={isSaved ? "Unsave post" : "Save post"}
        >
            <Bookmark
                className={`w-6 h-6 transition-all duration-200 ${isSaved
                    ? 'fill-gray-900 dark:fill-white text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400'
                    }`}
            />

            {/* Bookmark animation on save */}
            {isSaved && (
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                >
                    <Bookmark className="w-6 h-6 fill-gray-900 dark:fill-white text-gray-900 dark:text-white" />
                </motion.div>
            )}

            <Toast
                message={notification.message}
                type={notification.type}
                duration={1500}
                onClose={() => setNotification({ message: "", type: "" })}
            />
        </motion.button>
    );
};

export default SaveButton;