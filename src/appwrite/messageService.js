import { Client, Databases, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "../helpers/errorHelper";

/**
 * MessageService - Manages all message-related operations
 * Handles creating, updating, deleting, and querying messages
 * Supports text and image messages
 */
class MessageService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Send a new message in a chat room
     * @param {string} chatRoomId - ID of the chat room
     * @param {string} senderId - ID of the user sending the message
     * @param {string} message - The message text (optional if image is provided)
     * @param {string} imageId - ID of uploaded image (optional)
     * @returns {Object} - { message: Document } or { error: string }
     */
    async sendMessage({ chatRoomId, senderId, message = "", imageId = null }) {
        try {
            // Validate that at least one of message or image is provided
            if (!message.trim() && !imageId) {
                throw new Error("Message cannot be empty");
            }

            const messageId = ID.unique();
            const newMessage = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteMessagesCollectionId,
                messageId,
                {
                    chatRoomId,
                    senderId,
                    message: message.trim(),
                    imageId,
                    isRead: false,
                }
            );

            return { message: newMessage };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to send message.") };
        }
    }

    /**
     * Mark a message as read
     * @param {string} messageId - ID of the message
     * @returns {Object} - { message: Document } or { error: string }
     */
    async markAsRead(messageId) {
        try {
            const updatedMessage = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteMessagesCollectionId,
                messageId,
                {
                    isRead: true,
                }
            );

            return { message: updatedMessage };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to mark message as read.") };
        }
    }

    /**
     * Mark all messages in a chat room as read for a specific user
     * @param {string} chatRoomId - ID of the chat room
     * @param {string} userId - ID of the user (recipient)
     * @returns {Object} - { success: true, count: number } or { error: string }
     */
    async markAllAsRead({ chatRoomId, userId }) {
        try {
            // Fetch all unread messages in this chat room that were sent by others
            const { messages, error: fetchError } = await this.getChatMessages({
                chatRoomId,
                limit: 100,
                unreadOnly: true,
                excludeSenderId: userId
            });

            if (fetchError) throw new Error(fetchError);

            // Mark each message as read
            const updatePromises = messages.map(msg =>
                this.markAsRead(msg.$id)
            );

            await Promise.all(updatePromises);

            return { success: true, count: messages.length };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to mark messages as read.") };
        }
    }

    /**
     * Delete a message
     * Only the sender can delete their own messages
     * @param {string} messageId - ID of the message
     * @param {string} userId - ID of the user attempting deletion
     * @returns {Object} - { success: true } or { error: string }
     */
    async deleteMessage({ messageId, userId }) {
        try {
            // First, fetch the message to verify ownership
            const { message, error: fetchError } = await this.getMessage(messageId);
            if (fetchError) throw new Error(fetchError);

            // Verify the user is the sender
            if (message.senderId !== userId) {
                throw new Error("Unauthorized: You can only delete your own messages");
            }

            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteMessagesCollectionId,
                messageId
            );

            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to delete message.") };
        }
    }

    /**
     * Get a single message by ID
     * @param {string} messageId - ID of the message
     * @returns {Object} - { message: Document } or { error: string }
     */
    async getMessage(messageId) {
        try {
            const message = await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteMessagesCollectionId,
                messageId
            );

            return { message };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch message.") };
        }
    }

    /**
     * Get all messages for a specific chat room with pagination
     * Returns messages in ascending order (oldest first) for natural chat flow
     * @param {string} chatRoomId - ID of the chat room
     * @param {number} limit - Maximum number of messages to fetch
     * @param {number} offset - Offset for pagination
     * @param {boolean} unreadOnly - Only fetch unread messages
     * @param {string} excludeSenderId - Exclude messages from this sender
     * @returns {Object} - { messages: Array, total: number, hasMore: boolean } or { error: string }
     */
    async getChatMessages({ chatRoomId, limit = 50, offset = 0, unreadOnly = false, excludeSenderId = null }) {
        try {
            const queries = [
                Query.equal("chatRoomId", chatRoomId),
                Query.orderAsc('$createdAt'), // Oldest first for chat
                Query.limit(limit),
                Query.offset(offset)
            ];

            // Add optional filters
            if (unreadOnly) {
                queries.push(Query.equal("isRead", false));
            }

            if (excludeSenderId) {
                queries.push(Query.notEqual("senderId", excludeSenderId));
            }

            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteMessagesCollectionId,
                queries
            );

            return {
                messages: response.documents,
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch messages.") };
        }
    }

    /**
     * Get unread messages count for a chat room
     * @param {string} chatRoomId - ID of the chat room
     * @param {string} userId - ID of the user (recipient)
     * @returns {Object} - { count: number } or { error: string }
     */
    async getUnreadCount({ chatRoomId, userId }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteMessagesCollectionId,
                [
                    Query.equal("chatRoomId", chatRoomId),
                    Query.equal("isRead", false),
                    Query.notEqual("senderId", userId), // Don't count own messages
                    Query.limit(1) // We only need the total count
                ]
            );

            return { count: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch unread count.") };
        }
    }

    /**
     * Get the last message in a chat room
     * Useful for chat room previews
     * @param {string} chatRoomId - ID of the chat room
     * @returns {Object} - { message: Document } or { error: string }
     */
    async getLastMessage(chatRoomId) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteMessagesCollectionId,
                [
                    Query.equal("chatRoomId", chatRoomId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(1)
                ]
            );

            return {
                message: response.documents.length > 0 ? response.documents[0] : null
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch last message.") };
        }
    }

    /**
     * Search messages in a chat room
     * @param {string} chatRoomId - ID of the chat room
     * @param {string} searchTerm - Term to search for
     * @param {number} limit - Maximum number of results
     * @returns {Object} - { messages: Array } or { error: string }
     */
    async searchMessages({ chatRoomId, searchTerm, limit = 20 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteMessagesCollectionId,
                [
                    Query.equal("chatRoomId", chatRoomId),
                    Query.search("message", searchTerm),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit)
                ]
            );

            return { messages: response.documents };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to search messages.") };
        }
    }
}

const messageService = new MessageService();
export default messageService;