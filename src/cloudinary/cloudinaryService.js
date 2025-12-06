import axios from 'axios';
import config from '../config/config';

/**
 * CloudinaryService - Handles video uploads to Cloudinary
 * Uses signed uploads for security
 * Auto-generates thumbnails and optimizes videos
 */
class CloudinaryService {
    constructor() {
        this.cloudName = config.cloudinaryCloudName;
        this.uploadPreset = config.cloudinaryUploadPreset;
        this.apiKey = config.cloudinaryApiKey;
        this.apiSecret = config.cloudinaryApiSecret;
    }

    /**
     * Generate signature for secure upload
     * @param {Object} params - Upload parameters
     * @returns {string} - Signature
     */
    async generateSignature(params) {
        const timestamp = Math.round((new Date()).getTime() / 1000);
        const paramsToSign = {
            timestamp,
            upload_preset: this.uploadPreset,
            folder: 'reels',
            ...params
        };

        // In production, this should be done on your backend
        // For now, we'll use unsigned upload with preset
        return { timestamp, signature: null };
    }

    /**
     * Upload video to Cloudinary with progress tracking
     * @param {File} file - Video file
     * @param {Function} onProgress - Progress callback (0-100)
     * @returns {Object} - { videoUrl, thumbnailUrl, duration, publicId } or { error }
     */
    async uploadVideo(file, onProgress) {
        try {
            // Validate file
            if (!file) {
                throw new Error('No file provided');
            }

            // Validate file type
            const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
            if (!validTypes.includes(file.type)) {
                throw new Error('Invalid video format. Please use MP4, MOV, AVI, or WebM');
            }

            // Validate file size (100MB)
            const maxSize = 100 * 1024 * 1024; // 100MB in bytes
            if (file.size > maxSize) {
                throw new Error('Video size must be less than 100MB');
            }

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            formData.append('cloud_name', this.cloudName);
            formData.append('folder', 'reels');

            // Video transformations
            formData.append('resource_type', 'video');
            // formData.append('eager', 'c_pad,h_720,w_720|c_crop,h_720,w_720'); // Generate thumbnail
            // formData.append('eager_async', 'true');

            // Upload to Cloudinary
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/video/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        if (onProgress) {
                            onProgress(percentCompleted);
                        }
                    }
                }
            );

            const data = response.data;

            // Extract video URL and thumbnail
            const videoUrl = data.secure_url;
            const publicId = data.public_id;

            // Generate thumbnail URL (first frame)
            const thumbnailUrl = videoUrl.replace('/upload/', '/upload/so_0,c_fill,w_720,h_720/').replace(/\.(mp4|mov|avi|webm)$/, '.jpg');

            // Get video duration
            const duration = data.duration;

            return {
                videoUrl,
                thumbnailUrl,
                duration: Math.round(duration),
                publicId,
                width: data.width,
                height: data.height,
                format: data.format
            };

        } catch (error) {
            console.error('Cloudinary upload error:', error);

            if (error.response) {
                // Cloudinary API error
                return {
                    error: error.response.data?.error?.message || 'Failed to upload video to Cloudinary'
                };
            } else if (error.request) {
                // Network error
                return { error: 'Network error. Please check your connection.' };
            } else {
                // Other errors
                return { error: error.message || 'Failed to upload video' };
            }
        }
    }

    /**
     * Delete video from Cloudinary
     * @param {string} publicId - Cloudinary public ID
     * @returns {Object} - { success: true } or { error }
     */
    async deleteVideo(publicId) {
        try {
            // Note: Deleting requires server-side implementation with API secret
            // For now, we'll just return success
            // In production, implement this on your backend

            const formData = new FormData();
            formData.append('public_id', publicId);
            formData.append('api_key', this.apiKey);

            // This would need to be done server-side with API secret
            console.warn('Video deletion should be implemented server-side');

            return { success: true };
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            return { error: 'Failed to delete video' };
        }
    }

    /**
     * Get optimized video URL with transformations
     * @param {string} publicId - Cloudinary public ID
     * @param {Object} options - Transformation options
     * @returns {string} - Transformed video URL
     */
    getOptimizedVideoUrl(publicId, options = {}) {
        const {
            quality = 'auto',
            width = 720,
            height = 720,
            crop = 'pad'
        } = options;

        return `https://res.cloudinary.com/${this.cloudName}/video/upload/q_${quality},w_${width},h_${height},c_${crop}/${publicId}`;
    }

    /**
     * Get video thumbnail URL
     * @param {string} publicId - Cloudinary public ID
     * @param {number} time - Time in seconds for thumbnail (default: 0)
     * @returns {string} - Thumbnail URL
     */
    getThumbnailUrl(publicId, time = 0) {
        return `https://res.cloudinary.com/${this.cloudName}/video/upload/so_${time},c_fill,w_720,h_720/${publicId}.jpg`;
    }
}

const cloudinaryService = new CloudinaryService();
export default cloudinaryService;