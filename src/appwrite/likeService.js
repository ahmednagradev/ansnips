import { Client, Databases, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "./errorHelper";

/**
 * LikeService - Manages all like-related operations
 * Handles creating, removing, and querying likes for posts
 */
class LikeService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Toggle like on a post
     * If user already liked, removes the like
     * If user hasn't liked, creates a new like
     * @param {string} userId - ID of the user performing the action
     * @param {string} postId - ID of the post being liked
     * @returns {Object} - { liked: boolean, likeId: string } or { error: string }
     */
    async toggleLike({ userId, postId }) {
        try {
            // First check if user already liked this post
            const { like, error: checkError } = await this.getUserLikeOnPost({ userId, postId });
            
            if (checkError) {
                throw new Error(checkError);
            }

            // If like exists, remove it (unlike)
            if (like) {
                const { error: deleteError } = await this.removeLike(like.$id);
                if (deleteError) throw new Error(deleteError);
                
                return { liked: false, likeId: null };
            }

            // If no like exists, create one
            const likeId = ID.unique();
            const newLike = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteLikesCollectionId,
                likeId,
                {
                    userId,
                    postId,
                }
            );

            return { liked: true, likeId: newLike.$id };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to toggle like.") };
        }
    }

    /**
     * Check if a specific user has liked a specific post
     * @param {string} userId - ID of the user
     * @param {string} postId - ID of the post
     * @returns {Object} - { like: Document } or { like: null } or { error: string }
     */
    async getUserLikeOnPost({ userId, postId }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteLikesCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.equal("postId", postId),
                    Query.limit(1)
                ]
            );

            return { like: response.documents.length > 0 ? response.documents[0] : null };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to check like status.") };
        }
    }

    /**
     * Remove a like by its ID
     * @param {string} likeId - ID of the like document
     * @returns {Object} - { success: true } or { error: string }
     */
    async removeLike(likeId) {
        try {
            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteLikesCollectionId,
                likeId
            );
            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to remove like.") };
        }
    }

    /**
     * Get total likes count for a post
     * @param {string} postId - ID of the post
     * @returns {Object} - { count: number } or { error: string }
     */
    async getLikesCount(postId) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteLikesCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.limit(1) // We only need the total count
                ]
            );

            return { count: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch likes count.") };
        }
    }

    /**
     * Get all users who liked a specific post
     * Useful for showing "liked by" information
     * @param {string} postId - ID of the post
     * @param {number} limit - Maximum number of likes to fetch (default: 100)
     * @returns {Object} - { likes: Array } or { error: string }
     */
    async getPostLikes({ postId, limit = 100 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteLikesCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit)
                ]
            );

            return { likes: response.documents, total: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch post likes.") };
        }
    }

    /**
     * Get all posts liked by a specific user
     * @param {string} userId - ID of the user
     * @param {number} limit - Maximum number of likes to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Object} - { likes: Array } or { error: string }
     */
    async getUserLikes({ userId, limit = 25, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteLikesCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return { likes: response.documents, total: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch user likes.") };
        }
    }
}

const likeService = new LikeService();
export default likeService;