import { Client, Databases, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "./errorHelper";

/**
 * SaveService - Manages all save/bookmark-related operations
 * Handles creating, removing, and querying saved posts
 */
class SaveService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Toggle save on a post
     * If user already saved, removes the save
     * If user hasn't saved, creates a new save
     * @param {string} userId - ID of the user performing the action
     * @param {string} postId - ID of the post being saved
     * @returns {Object} - { saved: boolean, saveId: string } or { error: string }
     */
    async toggleSave({ userId, postId }) {
        try {
            // First check if user already saved this post
            const { save, error: checkError } = await this.getUserSaveOnPost({ userId, postId });
            
            if (checkError) {
                throw new Error(checkError);
            }

            // If save exists, remove it (unsave)
            if (save) {
                const { error: deleteError } = await this.removeSave(save.$id);
                if (deleteError) throw new Error(deleteError);
                
                return { saved: false, saveId: null };
            }

            // If no save exists, create one
            const saveId = ID.unique();
            const newSave = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteSavesCollectionId,
                saveId,
                {
                    userId,
                    postId,
                }
            );

            return { saved: true, saveId: newSave.$id };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to toggle save.") };
        }
    }

    /**
     * Check if a specific user has saved a specific post
     * @param {string} userId - ID of the user
     * @param {string} postId - ID of the post
     * @returns {Object} - { save: Document } or { save: null } or { error: string }
     */
    async getUserSaveOnPost({ userId, postId }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteSavesCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.equal("postId", postId),
                    Query.limit(1)
                ]
            );

            return { save: response.documents.length > 0 ? response.documents[0] : null };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to check save status.") };
        }
    }

    /**
     * Remove a save by its ID
     * @param {string} saveId - ID of the save document
     * @returns {Object} - { success: true } or { error: string }
     */
    async removeSave(saveId) {
        try {
            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteSavesCollectionId,
                saveId
            );
            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to remove save.") };
        }
    }

    /**
     * Get total saves count for a post
     * @param {string} postId - ID of the post
     * @returns {Object} - { count: number } or { error: string }
     */
    async getSavesCount(postId) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteSavesCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.limit(1) // We only need the total count
                ]
            );

            return { count: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch saves count.") };
        }
    }

    /**
     * Get all saved posts for a specific user with pagination
     * Returns both the save documents and post details
     * @param {string} userId - ID of the user
     * @param {number} limit - Maximum number of saves to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Object} - { saves: Array, total: number } or { error: string }
     */
    async getUserSavedPosts({ userId, limit = 25, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteSavesCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return { 
                saves: response.documents, 
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch saved posts.") };
        }
    }

    /**
     * Get all users who saved a specific post
     * Useful for analytics
     * @param {string} postId - ID of the post
     * @param {number} limit - Maximum number of saves to fetch (default: 100)
     * @returns {Object} - { saves: Array, total: number } or { error: string }
     */
    async getPostSaves({ postId, limit = 100 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteSavesCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit)
                ]
            );

            return { saves: response.documents, total: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch post saves.") };
        }
    }

    /**
     * Check if user has any saved posts
     * Useful for showing empty state
     * @param {string} userId - ID of the user
     * @returns {Object} - { hasSaves: boolean } or { error: string }
     */
    async userHasSavedPosts(userId) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteSavesCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.limit(1)
                ]
            );

            return { hasSaves: response.total > 0 };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to check saved posts.") };
        }
    }
}

const saveService = new SaveService();
export default saveService;