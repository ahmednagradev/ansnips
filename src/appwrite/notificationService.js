import { Client, Databases, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "./errorHelper";

/**
 * NotificationService
 * Manages user notifications for likes, comments, follows, and posts
 * Collection schema:
 * - type: 'like' | 'comment' | 'follow' | 'post'
 * - userId: ID of user who should receive notification
 * - actorId: ID of user who triggered the notification
 * - postId: ID of related post (for like, comment, post types)
 * - commentText: Text of comment (for comment type)
 * - isRead: boolean
 * - $createdAt, $updatedAt
 */
class NotificationService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Create a notification
     */
    async createNotification({ type, userId, actorId, postId = null, commentText = null }) {
        try {
            console.log(type, userId, actorId, postId, commentText)
            // Don't create notification if user is acting on their own content
            if (userId === actorId) {
                return { success: false, reason: "Self action" };
            }

            const notificationId = ID.unique();
            const notification = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteNotificationsCollectionId,
                notificationId,
                {
                    type,
                    userId,
                    actorId,
                    postId,
                    commentText,
                    isRead: false
                }
            );

            return { notification };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to create notification.") };
        }
    }

    /**
     * Get notifications for a user with pagination
     */
    async getUserNotifications({ userId, limit = 20, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteNotificationsCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return {
                notifications: response.documents,
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch notifications.") };
        }
    }

    /**
     * Get unread notifications count
     */
    async getUnreadCount(userId) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteNotificationsCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.equal("isRead", false),
                    Query.limit(1)
                ]
            );

            return { count: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch unread count.") };
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        try {
            await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteNotificationsCollectionId,
                notificationId,
                { isRead: true }
            );

            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to mark as read.") };
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        try {
            const { notifications, error } = await this.getUserNotifications({
                userId,
                limit: 100
            });

            if (error) throw new Error(error);

            const unreadNotifications = notifications.filter(n => !n.isRead);

            await Promise.all(
                unreadNotifications.map(notification =>
                    this.markAsRead(notification.$id)
                )
            );

            return { success: true, count: unreadNotifications.length };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to mark all as read.") };
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId) {
        try {
            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteNotificationsCollectionId,
                notificationId
            );

            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to delete notification.") };
        }
    }

    /**
     * Delete old notifications (cleanup)
     * Delete notifications older than 30 days
     */
    async deleteOldNotifications(userId) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteNotificationsCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.lessThan('$createdAt', thirtyDaysAgo.toISOString())
                ]
            );

            await Promise.all(
                response.documents.map(notification =>
                    this.deleteNotification(notification.$id)
                )
            );

            return { success: true, count: response.documents.length };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to delete old notifications.") };
        }
    }
}

const notificationService = new NotificationService();
export default notificationService;