import { Client, Databases, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "./errorHelper";

/**
 * ReelsService - Manages video reels
 * Handles CRUD operations for video content
 */
class ReelsService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Create a new reel
     * @param {Object} reelData - Reel data
     * @returns {Object} - { reel } or { error }
     */
    async createReel({
        reelId,
        userId,
        title,
        content,
        videoUrl,
        thumbnailUrl,
        duration,
        cloudinaryPublicId,
        visibility = 'public'
    }) {
        try {
            const reel = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteReelsCollectionId,
                reelId,
                {
                    userId,
                    title,
                    content,
                    videoUrl,
                    thumbnailUrl,
                    duration,
                    cloudinaryPublicId,
                    visibility,
                    likes: 0,
                    views: 0
                }
            );
            return { reel };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to create reel.") };
        }
    }

    /**
     * Update an existing reel
     * @param {Object} updateData - Update data
     * @returns {Object} - { reel } or { error }
     */
    async updateReel({ reelId, userId, title, content, visibility }) {
        try {
            // Verify ownership
            const { reel: existingReel, error: fetchError } = await this.getReel(reelId);
            if (fetchError) throw new Error(fetchError);
            if (existingReel.userId !== userId) {
                throw new Error("Unauthorized");
            }

            const reel = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteReelsCollectionId,
                reelId,
                {
                    title,
                    content,
                    visibility
                }
            );
            return { reel };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update reel.") };
        }
    }

    /**
     * Delete a reel
     * @param {string} reelId - Reel ID
     * @param {string} userId - User ID
     * @returns {Object} - { success } or { error }
     */
    async deleteReel({ reelId, userId }) {
        try {
            // Verify ownership
            const { reel: existingReel, error: fetchError } = await this.getReel(reelId);
            if (fetchError) throw new Error(fetchError);
            if (existingReel.userId !== userId) {
                throw new Error("Unauthorized");
            }

            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteReelsCollectionId,
                reelId
            );
            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to delete reel.") };
        }
    }

    /**
     * Get a single reel
     * @param {string} reelId - Reel ID
     * @returns {Object} - { reel } or { error }
     */
    async getReel(reelId) {
        try {
            const reel = await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteReelsCollectionId,
                reelId
            );
            return { reel };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch reel.") };
        }
    }

    /**
     * List all public reels
     * @returns {Object} - { reels } or { error }
     */
    async listPublicReels() {
        try {
            const reels = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteReelsCollectionId,
                [
                    Query.equal("visibility", "public"),
                    Query.orderDesc('$createdAt')
                ]
            );
            return { reels };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch reels.") };
        }
    }

    /**
     * List user's reels
     * @param {string} userId - User ID
     * @returns {Object} - { reels } or { error }
     */
    async listUserReels(userId) {
        try {
            const reels = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteReelsCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.orderDesc('$createdAt')
                ]
            );
            return { reels };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch user reels.") };
        }
    }

    /**
     * List user's public reels
     * @param {string} userId - User ID
     * @returns {Object} - { reels } or { error }
     */
    async listUserPublicReels(userId) {
        try {
            const reels = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteReelsCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.equal("visibility", "public"),
                    Query.orderDesc('$createdAt')
                ]
            );
            return { reels };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch user reels.") };
        }
    }

    /**
     * Increment view count
     * @param {string} reelId - Reel ID
     * @returns {Object} - { success } or { error }
     */
    async incrementViews(reelId) {
        try {
            const { reel } = await this.getReel(reelId);
            if (!reel) throw new Error("Reel not found");

            await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteReelsCollectionId,
                reelId,
                {
                    views: (reel.views || 0) + 1
                }
            );
            return { success: true };
        } catch (error) {
            console.error("Failed to increment views:", error);
            return { error: getErrorMessage(error, "Failed to increment views.") };
        }
    }
}

const reelsService = new ReelsService();
export default reelsService;