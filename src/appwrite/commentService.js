import { Client, Databases, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "./errorHelper";

/**
 * CommentService - Manages all comment-related operations
 * Handles creating, updating, deleting, and querying comments and replies
 */
class CommentService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Create a new comment on a post
     * @param {string} userId - ID of the user creating the comment
     * @param {string} postId - ID of the post being commented on
     * @param {string} comment - The comment text (max 500 characters)
     * @param {string} parentCommentId - Optional: ID of parent comment for replies
     * @returns {Object} - { comment: Document } or { error: string }
     */
    async createComment({ userId, username, postId, comment, parentCommentId = null }) {
        try {
            // Validate comment
            if (!comment || comment.trim().length === 0) {
                throw new Error("Comment cannot be empty");
            }
            if (comment.length > 500) {
                throw new Error("Comment cannot exceed 500 characters");
            }

            // Fetch post owner safely
            let ownerId = null;

            try {
                const postDoc = await this.databases.getDocument(
                    config.appwriteDatabaseId,
                    config.appwritePostsCollectionId,
                    postId
                );
                ownerId = postDoc.userId;
            } catch {
                // If not found in posts, try reels
                try {
                    const reelDoc = await this.databases.getDocument(
                        config.appwriteDatabaseId,
                        config.appwriteReelsCollectionId,
                        postId
                    );
                    ownerId = reelDoc.userId;
                } catch {
                    throw new Error("Post/Reel not found");
                }
            }

            const commentId = ID.unique();
            const newComment = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                commentId,
                {
                    userId,
                    username,
                    postOwnerId: ownerId,
                    postId,
                    comment: comment.trim(),
                    parentCommentId,
                    replyCount: 0
                }
            );

            // Increment parent comment reply count if needed
            if (parentCommentId) {
                await this.incrementReplyCount(parentCommentId);
            }

            return { comment: newComment };
        } catch (error) {
            // Ensure we always pass an Error object to getErrorMessage
            const errObj = error instanceof Error ? error : new Error(String(error));
            return { error: getErrorMessage("Failed to create comment.", errObj) };
        }
    }


    /**
     * Increment reply count for a comment
     * @param {string} commentId - ID of the comment
     */
    async incrementReplyCount(commentId) {
        try {
            const comment = await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                commentId
            );

            await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                commentId,
                {
                    replyCount: (comment.replyCount || 0) + 1
                }
            );
        } catch (error) {
            console.error("Failed to increment reply count:", error);
        }
    }

    /**
     * Decrement reply count for a comment
     * @param {string} commentId - ID of the comment
     */
    async decrementReplyCount(commentId) {
        try {
            const comment = await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                commentId
            );

            await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                commentId,
                {
                    replyCount: Math.max((comment.replyCount || 0) - 1, 0)
                }
            );
        } catch (error) {
            console.error("Failed to decrement reply count:", error);
        }
    }

    /**
     * Update an existing comment
     * Only the comment author can update their comment
     * @param {string} commentId - ID of the comment to update
     * @param {string} userId - ID of the user attempting the update
     * @param {string} comment - The new comment text
     * @returns {Object} - { comment: Document } or { error: string }
     */
    async updateComment({ commentId, userId, comment }) {
        try {
            // Validate comment length
            if (!comment || comment.trim().length === 0) {
                throw new Error("Comment cannot be empty");
            }

            if (comment.length > 500) {
                throw new Error("Comment cannot exceed 500 characters");
            }

            // First, fetch the comment to verify ownership
            const { comment: existingComment, error: fetchError } = await this.getComment(commentId);
            if (fetchError) throw new Error(fetchError);

            // Verify the user is the comment author
            if (existingComment.userId !== userId) {
                throw new Error("Unauthorized: You can only edit your own comments");
            }

            const updatedComment = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                commentId,
                {
                    comment: comment.trim(),
                }
            );

            return { comment: updatedComment };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update comment.") };
        }
    }

    /**
     * Delete a comment
     * Only the comment author or post owner can delete
     * @param {string} commentId - ID of the comment to delete
     * @param {string} userId - ID of the user attempting the deletion
     * @returns {Object} - { success: true } or { error: string }
     */
    async deleteComment({ commentId, userId }) {
        try {
            // First, fetch the comment to verify ownership
            const { comment: existingComment, error: fetchError } = await this.getComment(commentId);
            if (fetchError) throw new Error(fetchError);

            // Verify the user is either the comment author or the post owner
            const isCommentAuthor = existingComment.userId === userId;
            const isPostOwner = existingComment.postOwnerId === userId;

            if (!isCommentAuthor && !isPostOwner) {
                throw new Error("Unauthorized: You can only delete your own comments or comments on your posts");
            }

            // If this is a reply, decrement parent's reply count
            if (existingComment.parentCommentId) {
                await this.decrementReplyCount(existingComment.parentCommentId);
            }

            // Delete all replies to this comment
            if (existingComment.replyCount > 0) {
                const { comments: replies } = await this.getCommentReplies({
                    commentId,
                    limit: 1000
                });

                if (replies && replies.length > 0) {
                    const deletePromises = replies.map(reply =>
                        this.databases.deleteDocument(
                            config.appwriteDatabaseId,
                            config.appwriteCommentsCollectionId,
                            reply.$id
                        )
                    );
                    await Promise.all(deletePromises);
                }
            }

            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                commentId
            );

            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to delete comment.") };
        }
    }

    /**
     * Get a single comment by ID
     * @param {string} commentId - ID of the comment
     * @returns {Object} - { comment: Document } or { error: string }
     */
    async getComment(commentId) {
        try {
            const comment = await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                commentId
            );

            return { comment };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch comment.") };
        }
    }

    /**
     * Get all comments for a specific post with pagination (only top-level comments)
     * Returns comments in descending order (newest first)
     * @param {string} postId - ID of the post
     * @param {number} limit - Maximum number of comments to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Object} - { comments: Array, total: number, hasMore: boolean } or { error: string }
     */
    async getPostComments({ postId, limit = 20, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.isNull("parentCommentId"),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return {
                comments: response.documents,
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch comments.") };
        }
    }

    /**
     * Get replies for a specific comment
     * @param {string} commentId - ID of the parent comment
     * @param {number} limit - Maximum number of replies to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Object} - { comments: Array, total: number, hasMore: boolean } or { error: string }
     */
    async getCommentReplies({ commentId, limit = 20, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                [
                    Query.equal("parentCommentId", commentId),
                    Query.orderAsc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return {
                comments: response.documents,
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch replies.") };
        }
    }

    /**
     * Get total comments count for a post (including replies)
     * @param {string} postId - ID of the post
     * @returns {Object} - { count: number } or { error: string }
     */
    async getCommentsCount(postId) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.limit(1)
                ]
            );

            return { count: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch comments count.") };
        }
    }

    /**
     * Get all comments by a specific user
     * @param {string} userId - ID of the user
     * @param {number} limit - Maximum number of comments to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Object} - { comments: Array, total: number } or { error: string }
     */
    async getUserComments({ userId, limit = 25, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCommentsCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return {
                comments: response.documents,
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch user comments.") };
        }
    }
}

const commentService = new CommentService();
export default commentService;