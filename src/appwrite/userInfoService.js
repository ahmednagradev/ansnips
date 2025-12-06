import { Client, Databases, ID, Query } from "appwrite";
import config from "../config/config";
import getErrorMessage from "../helpers/errorHelper";

/**
 * UserInfoService
 * Manages user profile information: name, username, bio, and profile image
 * Now includes name for easy access throughout the application
 */
class UserInfoService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    /**
     * Create new user info document with username and name
     * Called during signup - username and name are required
     */
    async createUsername({ userId, username, name }) {
        try {
            const result = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                userId,
                { 
                    username,
                    name: name || "",
                    bio: "",
                    profileImage: null
                }
            );
            return { 
                username: result.username,
                name: result.name
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to create username.") };
        }
    }

    /**
     * Get username by user ID
     * Maintains backward compatibility with existing code
     */
    async getUsername(userId) {
        try {
            const result = await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                userId
            );
            return { username: result.username };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to get username.") };
        }
    }

    /**
     * Get complete user info including name, username, bio, and profile image
     */
    async getUserInfo(userId) {
        try {
            const result = await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                userId
            );
            return { 
                userInfo: {
                    name: result.name || "",
                    username: result.username,
                    bio: result.bio || "",
                    profileImage: result.profileImage || null
                }
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to get user info.") };
        }
    }

    /**
     * Check if username already exists
     * Used for validation during signup and username changes
     */
    async checkUsernameExists({ username }) {
        try {
            const result = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                [Query.equal("username", username)]
            );
            return { exists: result.documents.length > 0 };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to check username existence.") };
        }
    }

    /**
     * Update username only
     * Maintains backward compatibility
     */
    async updateUsername({ userId, username }) {
        try {
            const result = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                userId,
                { username }
            );
            return { username: result.username };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update username.") };
        }
    }

    /**
     * Update name only
     */
    async updateName({ userId, name }) {
        try {
            const result = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                userId,
                { name: name || "" }
            );
            return { name: result.name };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update name.") };
        }
    }

    /**
     * Update bio only
     */
    async updateBio({ userId, bio }) {
        try {
            const result = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                userId,
                { bio: bio || "" }
            );
            return { bio: result.bio };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update bio.") };
        }
    }

    /**
     * Update profile image only
     */
    async updateProfileImage({ userId, profileImage }) {
        try {
            const result = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                userId,
                { profileImage }
            );
            return { profileImage: result.profileImage };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update profile image.") };
        }
    }

    /**
     * Update complete profile (name, username, bio, and/or profile image)
     * Only updates fields that are provided
     */
    async updateProfile({ userId, name, username, bio, profileImage }) {
        try {
            const updateData = {};
            
            if (name !== undefined) updateData.name = name;
            if (username !== undefined) updateData.username = username;
            if (bio !== undefined) updateData.bio = bio;
            if (profileImage !== undefined) updateData.profileImage = profileImage;

            const result = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                userId,
                updateData
            );

            return { 
                userInfo: {
                    name: result.name,
                    username: result.username,
                    bio: result.bio,
                    profileImage: result.profileImage
                }
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update profile.") };
        }
    }

    /**
     * Get user ID by username
     * Now also returns name for convenience
     */
    async getUserIdByUsername({ username }) {
        try {
            const result = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                [Query.equal("username", username)]
            );

            if (result.documents.length === 0) {
                return { error: "User not found." };
            }

            const userDoc = result.documents[0];
            return { 
                userId: userDoc.$id, 
                username: userDoc.username,
                name: userDoc.name
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to get user by username.") };
        }
    }

    /**
     * Get all usernames for search functionality
     * Returns name, username, bio, and profileImage for search results
     */
    async getAllUsernames() {
        try {
            const result = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteUsersCollectionId,
                [Query.limit(100)] // Limit for performance
            );

            return { usernames: result.documents };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to get user details.") };
        }
    }
}

const userInfoService = new UserInfoService();
export default userInfoService;


// import { Client, Databases, ID, Query } from "appwrite";
// import config from "../config/config";
// import getErrorMessage from "./errorHelper";

// /**
//  * UserInfoService
//  * Manages user profile information: username, bio, and profile image
//  * Maintains backward compatibility with existing username functionality
//  */
// class UserInfoService {
//     client = new Client();
//     databases;

//     constructor() {
//         this.client
//             .setEndpoint(config.appwriteEndpoint)
//             .setProject(config.appwriteProjectId);
//         this.databases = new Databases(this.client);
//     }

//     /**
//      * Create new user info document with username
//      * Called during signup - only username is required initially
//      */
//     async createUsername({ userId, username }) {
//         try {
//             const result = await this.databases.createDocument(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 userId,
//                 { 
//                     username,
//                     bio: "",
//                     profileImage: null
//                 }
//             );
//             return { username: result.username };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to create username.") };
//         }
//     }

//     /**
//      * Get username by user ID
//      * Maintains backward compatibility with existing code
//      */
//     async getUsername(userId) {
//         try {
//             const result = await this.databases.getDocument(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 userId
//             );
//             return { username: result.username };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to get username.") };
//         }
//     }

//     /**
//      * Get complete user info including username, bio, and profile image
//      */
//     async getUserInfo(userId) {
//         try {
//             const result = await this.databases.getDocument(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 userId
//             );
//             return { 
//                 userInfo: {
//                     username: result.username,
//                     bio: result.bio || "",
//                     profileImage: result.profileImage || null
//                 }
//             };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to get user info.") };
//         }
//     }

//     /**
//      * Check if username already exists
//      * Used for validation during signup and username changes
//      */
//     async checkUsernameExists({ username }) {
//         try {
//             const result = await this.databases.listDocuments(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 [Query.equal("username", username)]
//             );
//             return { exists: result.documents.length > 0 };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to check username existence.") };
//         }
//     }

//     /**
//      * Update username only
//      * Maintains backward compatibility
//      */
//     async updateUsername({ userId, username }) {
//         try {
//             const result = await this.databases.updateDocument(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 userId,
//                 { username }
//             );
//             return { username: result.username };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to update username.") };
//         }
//     }

//     /**
//      * Update bio only
//      */
//     async updateBio({ userId, bio }) {
//         try {
//             const result = await this.databases.updateDocument(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 userId,
//                 { bio: bio || "" }
//             );
//             return { bio: result.bio };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to update bio.") };
//         }
//     }

//     /**
//      * Update profile image only
//      */
//     async updateProfileImage({ userId, profileImage }) {
//         try {
//             const result = await this.databases.updateDocument(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 userId,
//                 { profileImage }
//             );
//             return { profileImage: result.profileImage };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to update profile image.") };
//         }
//     }

//     /**
//      * Update complete profile (username, bio, and/or profile image)
//      * Only updates fields that are provided
//      */
//     async updateProfile({ userId, username, bio, profileImage }) {
//         try {
//             const updateData = {};
            
//             if (username !== undefined) updateData.username = username;
//             if (bio !== undefined) updateData.bio = bio;
//             if (profileImage !== undefined) updateData.profileImage = profileImage;

//             const result = await this.databases.updateDocument(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 userId,
//                 updateData
//             );

//             return { 
//                 userInfo: {
//                     username: result.username,
//                     bio: result.bio,
//                     profileImage: result.profileImage
//                 }
//             };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to update profile.") };
//         }
//     }

//     /**
//      * Get user ID by username
//      * Maintains backward compatibility
//      */
//     async getUserIdByUsername({ username }) {
//         try {
//             const result = await this.databases.listDocuments(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 [Query.equal("username", username)]
//             );

//             if (result.documents.length === 0) {
//                 return { error: "User not found." };
//             }

//             const userDoc = result.documents[0];
//             return { userId: userDoc.$id, username: userDoc.username };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to get user by username.") };
//         }
//     }

//     /**
//      * Get all usernames for search functionality
//      * Returns username, bio, and profileImage for search results
//      */
//     async getAllUsernames() {
//         try {
//             const result = await this.databases.listDocuments(
//                 config.appwriteDatabaseId,
//                 config.appwriteUsersCollectionId,
//                 [Query.limit(100)] // Limit for performance
//             );

//             return { usernames: result.documents };
//         } catch (error) {
//             return { error: getErrorMessage(error, "Failed to get user details.") };
//         }
//     }
// }

// const userInfoService = new UserInfoService();
// export default userInfoService;