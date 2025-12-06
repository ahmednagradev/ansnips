import { Client, Databases, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "../helpers/errorHelper";

/**
 * CommentLikeService - Manages all comment like operations
 * Handles liking/unliking comments and fetching like data
 */
class CommentLikeService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Like a comment
     * @param {string} commentId - ID of the comment to like
     * @param {string} userId - ID of the user liking the comment
     * @param {string} commentOwnerId - ID of the comment owner (for notifications)
     * @returns {Object} - { like: Document } or { error: string }
     */
    async likeComment({ commentId, userId, commentOwnerId }) {
        try {
            // Check if already liked
            const existingLike = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCommentLikesCollectionId,
                [
                    Query.equal("commentId", commentId),
                    Query.equal("userId", userId),
                    Query.limit(1)
                ]
            );

            if (existingLike.documents.length > 0) {
                throw new Error("You have already liked this comment");
            }

            const like = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentLikesCollectionId,
                ID.unique(),
                {
                    commentId,
                    userId,
                    commentOwnerId
                }
            );

            return { like };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to like comment.") };
        }
    }

    /**
     * Unlike a comment
     * @param {string} commentId - ID of the comment to unlike
     * @param {string} userId - ID of the user unliking the comment
     * @returns {Object} - { success: true } or { error: string }
     */
    async unlikeComment({ commentId, userId }) {
        try {
            // Find the like document
            const existingLike = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCommentLikesCollectionId,
                [
                    Query.equal("commentId", commentId),
                    Query.equal("userId", userId),
                    Query.limit(1)
                ]
            );

            if (existingLike.documents.length === 0) {
                throw new Error("Like not found");
            }

            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentLikesCollectionId,
                existingLike.documents[0].$id
            );

            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to unlike comment.") };
        }
    }

    /**
     * Get likes for a comment
     * @param {string} commentId - ID of the comment
     * @param {number} limit - Maximum number of likes to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Object} - { likes: Array, total: number } or { error: string }
     */
    async getCommentLikes({ commentId, limit = 50, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCommentLikesCollectionId,
                [
                    Query.equal("commentId", commentId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return {
                likes: response.documents,
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch comment likes.") };
        }
    }

    /**
     * Check if user liked a comment
     * @param {string} commentId - ID of the comment
     * @param {string} userId - ID of the user
     * @returns {Object} - { isLiked: boolean } or { error: string }
     */
    async isCommentLikedByUser({ commentId, userId }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCommentLikesCollectionId,
                [
                    Query.equal("commentId", commentId),
                    Query.equal("userId", userId),
                    Query.limit(1)
                ]
            );

            return { isLiked: response.documents.length > 0 };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to check like status.") };
        }
    }

    /**
     * Get likes count for multiple comments (batch operation)
     * @param {Array<string>} commentIds - Array of comment IDs
     * @returns {Object} - { likeCounts: Object } or { error: string }
     */
    async getBatchCommentLikes(commentIds) {
        try {
            if (!commentIds || commentIds.length === 0) {
                return { likeCounts: {} };
            }

            const promises = commentIds.map(commentId =>
                this.databases.listDocuments(
                    config.appwriteDatabaseId,
                    config.appwriteCommentLikesCollectionId,
                    [
                        Query.equal("commentId", commentId),
                        Query.limit(1)
                    ]
                )
            );

            const results = await Promise.all(promises);
            const likeCounts = {};

            commentIds.forEach((commentId, index) => {
                likeCounts[commentId] = results[index].total;
            });

            return { likeCounts };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch batch likes.") };
        }
    }

    /**
     * Check which comments are liked by user (batch operation)
     * @param {Array<string>} commentIds - Array of comment IDs
     * @param {string} userId - ID of the user
     * @returns {Object} - { likedComments: Object } or { error: string }
     */
    async getBatchUserLikes(commentIds, userId) {
        try {
            if (!commentIds || commentIds.length === 0 || !userId) {
                return { likedComments: {} };
            }

            const promises = commentIds.map(commentId =>
                this.databases.listDocuments(
                    config.appwriteDatabaseId,
                    config.appwriteCommentLikesCollectionId,
                    [
                        Query.equal("commentId", commentId),
                        Query.equal("userId", userId),
                        Query.limit(1)
                    ]
                )
            );

            const results = await Promise.all(promises);
            const likedComments = {};

            commentIds.forEach((commentId, index) => {
                likedComments[commentId] = results[index].documents.length > 0;
            });

            return { likedComments };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch user likes.") };
        }
    }
}

const commentLikeService = new CommentLikeService();
export default commentLikeService;