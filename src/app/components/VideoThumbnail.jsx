import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * VideoThumbnail Component
 * Shows video thumbnail with play button and duration
 * Used in feed to preview reels before navigating to full player
 * 
 * @param {string} videoUrl - Cloudinary video URL
 * @param {string} thumbnailUrl - Cloudinary thumbnail URL
 * @param {number} duration - Video duration in seconds
 * @param {Function} onClick - Callback when thumbnail is clicked
 */
const VideoThumbnail = ({ videoUrl, thumbnailUrl, duration, onClick }) => {
    /**
     * Format duration from seconds to MM:SS
     */
    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            onClick={onClick}
            className="relative w-full bg-gray-900 cursor-pointer group overflow-hidden aspect-[9/16] max-w-sm mx-auto rounded-xl"
        >
            {/* Thumbnail Image */}
            <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                loading="lazy"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

            {/* Play Button */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:bg-white transition-colors">
                    <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                </div>
            </motion.div>

            {/* Duration Badge */}
            {duration && (
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                    {formatDuration(duration)}
                </div>
            )}

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>
    );
};

export default VideoThumbnail;