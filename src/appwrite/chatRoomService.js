import { Client, Databases, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "../helpers/errorHelper";

/**
 * ChatRoomService - Manages all chat room-related operations
 * Handles creating, updating, and querying chat rooms
 * Each chat room represents a conversation between two users
 */
class ChatRoomService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Create a new chat room or get existing one between two users
     * Prevents duplicate chat rooms between same users
     * @param {string} userId1 - ID of first user
     * @param {string} userId2 - ID of second user
     * @returns {Object} - { chatRoom: Document, isNew: boolean } or { error: string }
     */
    async createOrGetChatRoom({ userId1, userId2 }) {
        try {
            // Ensure consistent ordering of user IDs to prevent duplicates
            const [user1, user2] = [userId1, userId2].sort();

            // Check if chat room already exists
            const { chatRoom: existingRoom, error: checkError } = await this.findChatRoom({
                userId1: user1,
                userId2: user2
            });

            if (checkError && !checkError.includes("not found")) {
                throw new Error(checkError);
            }

            // Return existing chat room if found
            if (existingRoom) {
                return { chatRoom: existingRoom, isNew: false };
            }

            // Create new chat room (chat room id will be same as other user id)
            const chatRoomId = ID.unique();  
            const newChatRoom = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteChatRoomsCollectionId,
                chatRoomId,
                {
                    participants: [user1, user2],
                    // lastMessage: "",
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: JSON.stringify({ [user1]: 0, [user2]: 0 })
                }
            );

            return { chatRoom: newChatRoom, isNew: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to create chat room.") };
        }
    }

    /**
     * Find existing chat room between two users
     * @param {string} userId1 - ID of first user
     * @param {string} userId2 - ID of second user
     * @returns {Object} - { chatRoom: Document } or { chatRoom: null } or { error: string }
     */
    async findChatRoom({ userId1, userId2 }) {
        try {
            const [user1, user2] = [userId1, userId2].sort();

            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteChatRoomsCollectionId,
                [
                    Query.contains("participants", user1),
                    Query.contains("participants", user2),
                    Query.limit(1)
                ]
            );

            return {
                chatRoom: response.documents.length > 0 ? response.documents[0] : null
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to find chat room.") };
        }
    }

    /**
     * Update chat room with last message info
     * Called after sending a new message
     * @param {string} chatRoomId - ID of the chat room
     * @param {string} lastMessage - Text of the last message
     * @param {string} senderId - ID of the sender
     * @param {Array} participants - Array of participant user IDs
     * @returns {Object} - { chatRoom: Document } or { error: string }
     */
    // async updateLastMessage({ chatRoomId, lastMessage, senderId, participants }) {
    //     try {
    //         // Get current unread counts
    //         const { chatRoom, error: fetchError } = await this.getChatRoom(chatRoomId);
    //         if (fetchError) throw new Error(fetchError);

    //         const unreadCount = JSON.parse(chatRoom.unreadCount || "{}");

    //         // Increment unread count for the other participant(s)
    //         participants.forEach(participantId => {
    //             if (participantId !== senderId) {
    //                 unreadCount[participantId] = (unreadCount[participantId] || 0) + 1;
    //             }
    //         });

    //         const updatedChatRoom = await this.databases.updateDocument(
    //             config.appwriteDatabaseId,
    //             config.appwriteChatRoomsCollectionId,
    //             chatRoomId,
    //             {
    //                 lastMessage: lastMessage.substring(0, 100), // Truncate for preview
    //                 lastMessageTime: new Date().toISOString(),
    //                 unreadCount: JSON.stringify(unreadCount),
    //             }
    //         );

    //         return { chatRoom: updatedChatRoom };
    //     } catch (error) {
    //         return { error: getErrorMessage(error, "Failed to update chat room.") };
    //     }
    // }

    /**
     * Mark all messages as read in a chat room for a user
     * Resets unread count to 0
     * @param {string} chatRoomId - ID of the chat room
     * @param {string} userId - ID of the user
     * @returns {Object} - { chatRoom: Document } or { error: string }
     */
    async markChatAsRead({ chatRoomId, userId }) {
        try {
            // Get current chat room
            const { chatRoom, error: fetchError } = await this.getChatRoom(chatRoomId);
            if (fetchError) throw new Error(fetchError);

            const unreadCount = JSON.parse(chatRoom.unreadCount || "{}");
            unreadCount[userId] = 0;

            const updatedChatRoom = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteChatRoomsCollectionId,
                chatRoomId,
                {
                    unreadCount: JSON.stringify(unreadCount),
                }
            );

            return { chatRoom: updatedChatRoom };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to mark chat as read.") };
        }
    }

    /**
     * Get a single chat room by ID
     * @param {string} chatRoomId - ID of the chat room
     * @returns {Object} - { chatRoom: Document } or { error: string }
     */
    async getChatRoom(chatRoomId) {
        try {
            const chatRoom = await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteChatRoomsCollectionId,
                chatRoomId
            );

            return { chatRoom };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch chat room.") };
        }
    }

    /**
     * Get all chat rooms for a specific user
     * Returns rooms sorted by last message time (newest first)
     * @param {string} userId - ID of the user
     * @param {number} limit - Maximum number of chat rooms to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Object} - { chatRooms: Array, total: number, hasMore: boolean } or { error: string }
     */
    async getUserChatRooms({ userId, limit = 20, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteChatRoomsCollectionId,
                [
                    Query.contains("participants", userId),
                    Query.orderDesc('lastMessageTime'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return {
                chatRooms: response.documents,
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch chat rooms.") };
        }
    }

    /**
     * Get total unread messages count for a user across all chat rooms
     * @param {string} userId - ID of the user
     * @returns {Object} - { count: number } or { error: string }
     */
    async getTotalUnreadCount(userId) {
        try {
            const { chatRooms, error } = await this.getUserChatRooms({
                userId,
                limit: 100 // Fetch all chat rooms for accurate count
            });

            if (error) throw new Error(error);

            let totalUnread = 0;
            chatRooms.forEach(room => {
                const unreadCount = JSON.parse(room.unreadCount || "{}");
                totalUnread += unreadCount[userId] || 0;
            });

            return { count: totalUnread };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch total unread count.") };
        }
    }

    /**
     * Delete a chat room
     * Only for administrative purposes or user preference
     * @param {string} chatRoomId - ID of the chat room
     * @param {string} userId - ID of the user attempting deletion
     * @returns {Object} - { success: true } or { error: string }
     */
    async deleteChatRoom({ chatRoomId, userId }) {
        try {
            // Verify user is a participant
            const { chatRoom, error: fetchError } = await this.getChatRoom(chatRoomId);
            if (fetchError) throw new Error(fetchError);

            if (!chatRoom.participants.includes(userId)) {
                throw new Error("Unauthorized: You are not a participant in this chat");
            }

            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteChatRoomsCollectionId,
                chatRoomId
            );

            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to delete chat room.") };
        }
    }

    /**
     * Get the other participant in a chat room
     * Helper method to identify who the user is chatting with
     * @param {Object} chatRoom - Chat room document
     * @param {string} currentUserId - ID of the current user
     * @returns {string} - ID of the other participant
     */
    getOtherParticipant(chatRoom, currentUserId) {
        return chatRoom.participants.find(id => id !== currentUserId);
    }
}

const chatRoomService = new ChatRoomService();
export default chatRoomService;