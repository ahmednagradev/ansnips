import { Client, Databases, Query } from "appwrite";
import config from "../config/config";
import getErrorMessage from "./errorHelper";

class ChatService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId);

        this.databases = new Databases(this.client);
    }

    // Create a new chat session with messages
    async createChatSession({ sessionId, userId, title, chat }) {
        try {
            const session = await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteChatSessionsCollectionId,
                sessionId,
                {
                    userId,
                    title,
                    chat // JSON string of messages array
                }
            );
            return { session };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to create chat session.") };
        }
    }

    // Get all chat sessions for a user
    async getChatSessions(userId) {
        try {
            const sessions = await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteChatSessionsCollectionId,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return { sessions: sessions.documents };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch chat sessions.") };
        }
    }

    // Update chat session title (for rename)
    async updateChatSession(sessionId, { title }) {
        try {
            const session = await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteChatSessionsCollectionId,
                sessionId,
                { title }
            );
            return { session };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update chat session.") };
        }
    }

    // Delete a chat session
    async deleteChatSession(sessionId) {
        try {
            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteChatSessionsCollectionId,
                sessionId
            );
            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to delete chat session.") };
        }
    }
}

const chatService = new ChatService();
export default chatService;