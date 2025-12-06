import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import chatRoomService from "../../appwrite/chatRoomService";

/**
 * MessageUserButton Component
 * Button to initiate or continue a chat with a specific user
 * Creates new chat room if doesn't exist, or navigates to existing one
 * 
 * @param {string} recipientUserId - ID of the user to message
 * @param {string} className - Additional CSS classes (optional)
 */
const MessageUserButton = ({ recipientUserId, className = "" }) => {
    const navigate = useNavigate();
    const userData = useSelector((state) => state.userData);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle click to start/continue chat
     * Creates chat room if it doesn't exist, then navigates to it
     */
    const handleMessageClick = async () => {
        // Prevent messaging yourself
        if (userData.$id === recipientUserId) {
            return;
        }

        setIsLoading(true);

        try {
            // Create or get existing chat room
            const result = await chatRoomService.createOrGetChatRoom({
                userId1: userData.$id,
                userId2: recipientUserId,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            // Navigate to chat room
            navigate(`/chat/${result.chatRoom.$id}`);

        } catch (error) {
            console.error("Failed to open chat:", error);
            // Could show toast here if you want
        } finally {
            setIsLoading(false);
        }
    };

    // Don't show button if user is viewing their own profile
    if (userData?.$id === recipientUserId) {
        return null;
    }

    return (
        <button
            onClick={handleMessageClick}
            disabled={isLoading}
            className={`flex items-center px-4 py-2 h-fit rounded-lg text-sm font-medium transition-all border border-neutral-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 hover:scale-103 ${isLoading ? "opacity-60 cursor-wait hover:scale-100" : ""}`}
        >
            Message
        </button>
    );
};

export default MessageUserButton;