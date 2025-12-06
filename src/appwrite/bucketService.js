import { Client, Storage, Query, ID } from "appwrite";
import config from "../config/config";
import getErrorMessage from "../helpers/errorHelper";

class BucketService {
    client = new Client()
    storage;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId)
        this.storage = new Storage(this.client)
    }

    async createFile({ file }) {
        try {
            const fileData = await this.storage.createFile(
                config.appwriteBucketId,
                ID.unique(),
                file
            );
            return { file: fileData };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to upload file.") };
        }
    }

    async deleteFile({ fileId }) {
        try {
            await this.storage.deleteFile(
                config.appwriteBucketId,
                fileId
            );
            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to delete file.") };
        }
    }

    getFileDownload({ fileId }) {
        try {
            const preview = this.storage.getFileDownload(
                config.appwriteBucketId,
                fileId
            );
            return { preview };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to get file preview.") };
        }
    }

    async updateFile({ fileId }) {
        try {
            const file = await this.storage.updateFile(
                config.appwriteBucketId,
                fileId
            );
            return { file };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to update file.") };
        }
    }

    async getFile({ fileId }) {
        try {
            const file = await this.storage.getFile(
                config.appwriteBucketId,
                fileId
            );
            return { file };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to get file.") };
        }
    }

    async listFiles() {
        try {
            const files = await this.storage.listFiles(
                config.appwriteBucketId,
            );
            return { files };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to fetch files.") };
        }
    }
}

const bucketService = new BucketService()
export default bucketService