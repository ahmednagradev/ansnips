import notificationService from "../appwrite/notificationService";

/**
 * Notification Helpers
 * Helper functions to create notifications for different actions
 * Call these after successful like, comment, follow, or post actions
 */

/**
 * Trigger notification when someone likes a post
 * Call this in LikeButton after successful like
 */
export const notifyLike = async ({ postOwnerId, actorId, postId }) => {
    if (!postOwnerId || !actorId || !postId) return;

    await notificationService.createNotification({
        type: 'like',
        userId: postOwnerId,
        actorId,
        postId
    });
};

/**
 * Trigger notification when someone comments on a post
 * Call this in CommentsSection after successful comment
 */
export const notifyComment = async ({ postOwnerId, actorId, postId, commentText }) => {
    if (!postOwnerId || !actorId || !postId) return;

    await notificationService.createNotification({
        type: 'comment',
        userId: postOwnerId,
        actorId,
        postId,
        commentText: commentText?.substring(0, 100) // Limit to 100 chars
    });
};

/**
 * Trigger notification when someone follows a user
 * Call this in FollowButton or followerService after successful follow
 */
export const notifyFollow = async ({ followedUserId, followerId }) => {
    if (!followedUserId || !followerId) return;

    await notificationService.createNotification({
        type: 'follow',
        userId: followedUserId,
        actorId: followerId
    });
};

/**
 * Trigger notifications to all followers when user uploads a post
 * Call this after creating a new post
 */
export const notifyFollowersNewPost = async ({ authorId, postId, followerIds }) => {
    if (!authorId || !postId || !followerIds?.length) return;

    // Create notification for each follower
    const notifications = followerIds.map(followerId =>
        notificationService.createNotification({
            type: 'post',
            userId: followerId,
            actorId: authorId,
            postId
        })
    );

    await Promise.all(notifications);
};