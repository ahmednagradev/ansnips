import { Client, Databases, Query } from "appwrite";
import config from "../config/config";
import getErrorMessage from "./errorHelper";

class PostService {
    client = new Client()
    databases
    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId)
        this.databases = new Databases(this.client)
    }

    async createPost({ postId, userId, title, content, images, featuredImage, likes, saves, code, visibility = 'public' }) {
        try {
            const post = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwritePostsCollectionId,
                postId,
                {
                    userId,
                    title,
                    content,
                    images: images || (featuredImage ? [featuredImage] : []), // Support both new and legacy
                    featuredImage: featuredImage || (images && images[0]) || null, // Keep for backward compatibility
                    likes,
                    saves,
                    code,
                    visibility,
                }
            );
            return { post };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to create post.") };
        }
    }


    async updatePost({ postId, userId, title, content, images, featuredImage, likes, saves, code, visibility }) {
        try {
            // Verify ownership before update
            const { post: existingPost, error: fetchError } = await this.getPost(postId);
            if (fetchError) throw new Error(fetchError);

            if (existingPost.userId !== userId) {
                throw new Error("Unauthorized");
            }

            const updateData = {
                title,
                content,
                likes,
                saves,
                code,
                visibility
            };

            // Update images if provided
            if (images !== undefined) {
                updateData.images = images;
                updateData.featuredImage = images[0] || null; // Keep first image as featured for backward compatibility
            } else if (featuredImage !== undefined) {
                updateData.featuredImage = featuredImage;
                updateData.images = [featuredImage];
            }

            const post = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwritePostsCollectionId,
                postId,
                updateData
            );
            return { post };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update post.") };
        }
    }

    async deletePost({ postId, userId }) {
        try {
            // Verify ownership before delete
            const { post: existingPost, error: fetchError } = await this.getPost(postId);
            if (fetchError) throw new Error(fetchError);

            if (existingPost.userId !== userId) {
                throw new Error("Unauthorized");
            }

            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwritePostsCollectionId,
                postId
            );
            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to delete post.") };
        }
    }

    async getPost(postId) {
        try {
            const post = await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwritePostsCollectionId,
                postId
            );

            return { post };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch post.") };
        }
    }

    async listPosts(userId) {
        try {
            const posts = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwritePostsCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.orderDesc('$createdAt'),
                ]
            );
            return { posts };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch posts.") };
        }
    }

    async listPublicPosts() {
        try {
            const posts = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwritePostsCollectionId,
                [
                    Query.equal("visibility", "public"),
                    Query.orderDesc('$createdAt'),
                ]
            );
            return { posts };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch public posts.") };
        }
    }

    async listUserPublicPosts(userId) {
        try {
            const posts = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwritePostsCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.equal("visibility", "public"),
                    Query.orderDesc('$createdAt'),
                ]
            );
            return { posts };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch user's public posts.") };
        }
    }
}

const postService = new PostService()
export default postService;