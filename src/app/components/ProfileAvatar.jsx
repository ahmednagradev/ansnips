import { useEffect, useState } from "react";
import { User } from "lucide-react";
import bucketService from "../../appwrite/bucketService";
import userInfoService from "../../appwrite/userInfoService";

/**
 * ProfileAvatar Component
 * Displays user profile image or fallback gradient circle
 * Replace Instagram-style user circles with this component
 */
const ProfileAvatar = ({
    profileId,                  // user ID
    size = "md",
    className = "",
    onClick
}) => {
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        if (!profileId) return;

        const fetchImage = async () => {
            try {
                const { userInfo } = await userInfoService.getUserInfo(profileId);
                setProfileImage(userInfo?.profileImage || null);
            } catch {
                setProfileImage(null);
            }
        };

        fetchImage();
    }, [profileId]);

    // Size configurations
    const sizes = {
        xs: "w-6 h-6",      // 24px - for small UI elements
        sm: "w-8 h-8",      // 32px - for comments, small cards
        md: "w-10 h-10",    // 40px - for post cards, chat list
        lg: "w-14 h-14",    // 56px - for profile headers
        xl: "w-24 h-24",    // 96px - for profile pages
        "2xl": "w-32 h-32"  // 128px - for settings/edit profile
    };

    const iconSizes = {
        xs: "w-3 h-3",
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
        "2xl": "w-16 h-16"
    };

    const containerSize = sizes[size] || sizes.md;
    const iconSize = iconSizes[size] || iconSizes.md;

    return (
        <div
            className={`relative flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {/* Outer container — gradient border only if no profile image */}
            <div
                className={`${containerSize} rounded-full ${profileImage
                        ? '' // No border if image exists
                        : 'border-2 border-gray-600 dark:border-gray-400 p-[2px]'
                    }`}
            >
                {/* Inner container */}
                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                    {profileImage ? (
                        // User's profile image
                        <img
                            src={bucketService.getFileDownload({ fileId: profileImage }).preview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // Fallback icon
                        <User className={`${iconSize} text-gray-600 dark:text-gray-400`} />
                    )}
                </div>
            </div>
        </div>

    );
};

export default ProfileAvatar;
