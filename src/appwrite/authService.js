import config from "../config/config";
import { Client, Account, ID } from "appwrite";
import getErrorMessage from "../helpers/errorHelper";
import usernameService from "./userInfoService";

class AuthService {
    client = new Client()
    account;

    constructor() {
        this.client
            .setEndpoint(config.appwriteEndpoint)
            .setProject(config.appwriteProjectId)

        this.account = new Account(this.client)
    }

    async loginWithGoogle() {
        try {
            const successURL = window.location.origin + "/auth-success";
            const failureURL = window.location.origin + "/auth";
            this.account.createOAuth2Session("google", successURL, failureURL);
        } catch (error) {
            console.error("Google login error:", error);
        }
    }

    async getCurrentUser() {
        try {
            const user = await this.account.get();
            return { user };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to get current user.") };
        }
    }

    async createAccount({ email, password, name }) {
        try {
            const account = await this.account.create(
                ID.unique(),
                email,
                password,
                name
            );
            return { account };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to create account.") };
        }
    }

    async createSession({ email, password }) {
        try {
            const session = await this.account.createEmailPasswordSession(
                email,
                password
            );
            return { session };
        } catch (error) {
            return { error: getErrorMessage(error, "Login failed.") };
        }
    }

    async getUser() {
        try {
            const user = await this.account.get();
            return { user };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to get user details.") };
        }
    }

    async deleteSessions() {
        try {
            await this.account.deleteSessions();
            return { success: true };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to logout.") };
        }
    }

    async createVerification() {
        try {
            const verification = await this.account.createVerification(
                `${window.location.origin}/auth`
            );
            return { verification };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to send verification email.") };
        }
    }

    async confirmVerification(userId, secret) {
        try {
            const response = await this.account.updateVerification(userId, secret);
            return { response };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to verify email.") };
        }
    }

    /**
     * Forgot Password Feature
     * Sends a password recovery email with a secure link
     * @param {string} email - User's email address
     * @returns {Object} - { recovery: Document } or { error: string }
     */
    async createPasswordRecovery(email) {
        try {
            const recovery = await this.account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
            );
            return { recovery };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to send recovery email.") };
        }
    }

    /**
     * Complete Password Recovery
     * Confirms the recovery and sets new password
     * @param {string} userId - User ID from email link
     * @param {string} secret - Secret token from email link
     * @param {string} password - New password
     * @param {string} confirmPassword - Confirm new password
     * @returns {Object} - { response: Document } or { error: string }
     */
    async confirmPasswordRecovery(userId, secret, password, confirmPassword) {
        try {
            // Validate passwords match
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            // Validate password strength
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                throw new Error("Password must be at least 8 characters with letters and numbers");
            }

            const response = await this.account.updateRecovery(
                userId,
                secret,
                password,
                confirmPassword
            );
            return { response };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to reset password.") };
        }
    }

    /**
     * Change Password (for logged-in users)
     * Updates password while user is authenticated
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     * @param {string} confirmPassword - Confirm new password
     * @returns {Object} - { response: Document } or { error: string }
     */
    async updatePassword(oldPassword, newPassword, confirmPassword) {
        try {
            // Validate passwords match
            if (newPassword !== confirmPassword) {
                throw new Error("New passwords do not match");
            }

            // Validate password strength
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                throw new Error("Password must be at least 8 characters with letters and numbers");
            }

            // Check if old password is same as new password
            if (oldPassword === newPassword) {
                throw new Error("New password must be different from old password");
            }

            const response = await this.account.updatePassword(
                newPassword,
                oldPassword
            );
            return { response };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to change password.") };
        }
    }

    async getUserById(userId) {
        // Note: This is a simplified implementation. In a real app, you would need
        // to use Appwrite's Users API which requires server-side implementation.
        // For now, we'll return a basic user object with the ID
        try {
            const { username, error } = await usernameService.getUsername(userId);
            if (error) throw new Error(error);
            return {
                $id: userId,
                name: username || `user${userId?.substring(0, 6)}`,
            };
        } catch (error) {
            return { error: getErrorMessage(error, "Failed to get user details.") };
        }
    }

}

const authService = new AuthService()
export default authService;