import { Client, Databases, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "../helpers/errorHelper";

/**
 * FollowerService
 * Manages follower/following relationships between users
 * Collection should have: followerId, followingId, $createdAt, $updatedAt
 */
class FollowerService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Follow a user
     */
    async followUser({ followerId, followingId }) {
        try {
            // Prevent self-follow
            if (followerId === followingId) {
                throw new Error("You cannot follow yourself");
            }

            // Check if already following
            const { isFollowing } = await this.checkIsFollowing({ followerId, followingId });
            if (isFollowing) {
                return { error: "Already following this user" };
            }

            const followId = ID.unique();
            await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteFollowersCollectionId,
                followId,
                {
                    followerId,
                    followingId
                }
            );

            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to follow user.") };
        }
    }

    /**
     * Unfollow a user
     */
    async unfollowUser({ followerId, followingId }) {
        try {
            // Find the follow relationship
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteFollowersCollectionId,
                [
                    Query.equal("followerId", followerId),
                    Query.equal("followingId", followingId),
                    Query.limit(1)
                ]
            );

            if (response.documents.length === 0) {
                return { error: "Not following this user" };
            }

            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteFollowersCollectionId,
                response.documents[0].$id
            );

            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to unfollow user.") };
        }
    }

    /**
     * Check if user is following another user
     */
    async checkIsFollowing({ followerId, followingId }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteFollowersCollectionId,
                [
                    Query.equal("followerId", followerId),
                    Query.equal("followingId", followingId),
                    Query.limit(1)
                ]
            );

            return { isFollowing: response.documents.length > 0 };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to check follow status.") };
        }
    }

    /**
     * Get followers count for a user
     */
    async getFollowersCount(userId) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteFollowersCollectionId,
                [
                    Query.equal("followingId", userId),
                    Query.limit(1)
                ]
            );

            return { count: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch followers count.") };
        }
    }

    /**
     * Get following count for a user
     */
    async getFollowingCount(userId) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteFollowersCollectionId,
                [
                    Query.equal("followerId", userId),
                    Query.limit(1)
                ]
            );

            return { count: response.total };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch following count.") };
        }
    }

    /**
     * Get list of followers with pagination
     */
    async getFollowers({ userId, limit = 20, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteFollowersCollectionId,
                [
                    Query.equal("followingId", userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return {
                followers: response.documents.map(doc => doc.followerId),
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch followers.") };
        }
    }

    /**
     * Get list of following with pagination
     */
    async getFollowing({ userId, limit = 20, offset = 0 }) {
        try {
            const response = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteFollowersCollectionId,
                [
                    Query.equal("followerId", userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return {
                following: response.documents.map(doc => doc.followingId),
                total: response.total,
                hasMore: response.total > offset + limit
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch following.") };
        }
    }

    /**
     * Get both counts at once for efficiency
     */
    async getUserStats(userId) {
        try {
            const [followersResult, followingResult] = await Promise.all([
                this.getFollowersCount(userId),
                this.getFollowingCount(userId)
            ]);

            if (followersResult.error || followingResult.error) {
                throw new Error("Failed to fetch user stats");
            }

            return {
                followersCount: followersResult.count,
                followingCount: followingResult.count
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch user stats.") };
        }
    }
}

const followerService = new FollowerService();
export default followerService;







































// import { Client, Databases, Query, ID } from "appwrite";
// import config from "../config/config";
// import getErrorMessage from "./errorHelper";

// class FollowService {
//     client = new Client();
//     databases;

//     constructor() {
//         this.client
//             .setEndpoint(config.appwriteEndpoint)
//             .setProject(config.appwriteProjectId);

//         this.databases = new Databases(this.client);
//     }

//     // Follow a user
//     async followUser({ followerId, followingId }) {
//         try {
//             // Prevent duplicate follow
//             const existing = await this.databases.listDocuments(
//                 config.appwriteDatabaseId,
//                 config.appwriteFollowsCollectionId,
//                 [
//                     Query.equal("followerId", followerId),
//                     Query.equal("followingId", followingId)
//                 ]
//             );

//             if (existing.total > 0) {
//                 return { alreadyFollowing: true };
//             }

//             const follow = await this.databases.createDocument(
//                 config.appwriteDatabaseId,
//                 config.appwriteFollowsCollectionId,
//                 ID.unique(),
//                 { followerId, followingId }
//             );

//             return { follow };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to follow user.") };
//         }
//     }

//     // Unfollow a user
//     async unfollowUser({ followerId, followingId }) {
//         try {
//             const result = await this.databases.listDocuments(
//                 config.appwriteDatabaseId,
//                 config.appwriteFollowsCollectionId,
//                 [
//                     Query.equal("followerId", followerId),
//                     Query.equal("followingId", followingId)
//                 ]
//             );

//             if (result.total === 0) {
//                 return { notFollowing: true };
//             }

//             const followId = result.documents[0].$id;

//             await this.databases.deleteDocument(
//                 config.appwriteDatabaseId,
//                 config.appwriteFollowsCollectionId,
//                 followId
//             );

//             return { success: true };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to unfollow user.") };
//         }
//     }

//     // Check if current user follows another
//     async isFollowing({ followerId, followingId }) {
//         try {
//             const result = await this.databases.listDocuments(
//                 config.appwriteDatabaseId,
//                 config.appwriteFollowsCollectionId,
//                 [
//                     Query.equal("followerId", followerId),
//                     Query.equal("followingId", followingId)
//                 ]
//             );

//             return { isFollowing: result.total > 0 };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to check follow status.") };
//         }
//     }

//     // Get followers of a user
//     async getFollowers(userId) {
//         try {
//             const followers = await this.databases.listDocuments(
//                 config.appwriteDatabaseId,
//                 config.appwriteFollowsCollectionId,
//                 [Query.equal("followingId", userId)]
//             );
//             return { followers: followers.documents };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to fetch followers.") };
//         }
//     }

//     // Get all users the current user is following
//     async getFollowing(userId) {
//         try {
//             const following = await this.databases.listDocuments(
//                 config.appwriteDatabaseId,
//                 config.appwriteFollowsCollectionId,
//                 [Query.equal("followerId", userId)]
//             );
//             return { following: following.documents };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to fetch following.") };
//         }
//     }
// }

// const followService = new FollowService();
// export default followService;
