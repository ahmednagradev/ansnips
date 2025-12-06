import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Loader2, ArrowLeft, User, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Cropper from "react-easy-crop";
import userInfoService from "../../appwrite/userInfoService";
import bucketService from "../../appwrite/bucketService";
import ProfileAvatar from "../components/ProfileAvatar";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import InputField from "../components/InputField";

/**
 * Settings Page
 * User profile editing with image cropping using react-easy-crop library
 */
const Settings = () => {
    const navigate = useNavigate();
    const userData = useSelector((state) => state.userData);

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [originalData, setOriginalData] = useState({});

    const [selectedFile, setSelectedFile] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [croppedPreview, setCroppedPreview] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    // react-easy-crop states
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1)
    const [cropperKey, setCropperKey] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [hasChanges, setHasChanges] = useState(false);

    // Load current user info
    useEffect(() => {
        const loadUserInfo = async () => {
            if (!userData?.$id) return;

            try {
                const result = await userInfoService.getUserInfo(userData.$id);

                if (result.error) throw new Error(result.error);

                const { name: loadedName, username: loadedUsername, bio: loadedBio, profileImage: loadedImage } = result.userInfo;

                setName(loadedName);
                setUsername(loadedUsername);
                setBio(loadedBio);
                setProfileImage(loadedImage);
                setOriginalData({ username: loadedUsername, bio: loadedBio, profileImage: loadedImage });

            } catch (error) {
                console.error("Failed to load user info:", error);
                setNotification({ message: error.message, type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        loadUserInfo();
    }, [userData?.$id]);

    // Check if any changes were made
    useEffect(() => {
        const changed =
            name !== originalData.name ||
            username !== originalData.username ||
            bio !== originalData.bio ||
            profileImage !== originalData.profileImage;
        setHasChanges(changed);
    }, [username, bio, profileImage, originalData]);

    // Handle image file selection
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setNotification({ message: "Please select an image file", type: "error" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setNotification({ message: "Image must be less than 5MB", type: "error" });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setShowCropper(true);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        };
        reader.readAsDataURL(file);
    };

    // Reset zoom and fix layout issue
    useEffect(() => {
        if (imageSrc) {
            setZoom(1); // reset zoom
            setTimeout(() => {
                setCropperKey(prev => prev + 1); // fix layout issue
            }, 90);
        }
    }, [imageSrc]);

    // Called when crop area changes
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Create cropped image
    const createCroppedImage = async () => {
        try {
            const image = await createImage(imageSrc);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to output size
            canvas.width = 400;
            canvas.height = 400;

            // Draw cropped image
            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                400,
                400
            );

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.9);
            });
        } catch (error) {
            console.error('Error creating cropped image:', error);
            return null;
        }
    };

    // Apply crop
    const handleCropConfirm = async () => {
        if (!croppedAreaPixels) return;

        setIsUploading(true);

        try {
            const croppedBlob = await createCroppedImage();
            if (!croppedBlob) throw new Error("Failed to create cropped image");

            // Create preview
            const previewURL = URL.createObjectURL(croppedBlob);
            setCroppedPreview(previewURL);

            // Upload to Appwrite
            const file = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
            const uploadResult = await bucketService.createFile({ file });

            if (uploadResult.error) {
                throw new Error(uploadResult.error);
            }

            // Delete old image if exists and different
            if (profileImage && profileImage !== originalData.profileImage) {
                await bucketService.deleteFile({ fileId: profileImage });
            }

            setProfileImage(uploadResult.file.$id);
            setShowCropper(false);
            setImageSrc(null);

        } catch (error) {
            console.error("Failed to upload image:", error);
            setNotification({ message: error.message || "Failed to process image", type: "error" });
        } finally {
            setIsUploading(false);
        }
    };

    // Cancel cropping
    const handleCropCancel = () => {
        setShowCropper(false);
        setImageSrc(null);
        setCroppedPreview(null);
    };

    // Save all changes
    const handleSave = async () => {
        if (!hasChanges) return;

        if (username.trim().length < 3) {
            setNotification({ message: "Username must be at least 3 characters", type: "error" });
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setNotification({ message: "Username can only contain letters, numbers, and underscores", type: "error" });
            return;
        }

        // Minimum length check for full name
        if (name.trim().length < 3) {
            setNotification({ message: "Name must be at least 3 characters", type: "error" });
            return;
        }

        // Only letters and spaces allowed
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            setNotification({ message: "Name can only contain letters and spaces", type: "error" });
            return;
        }

        // Check username availability if changed
        if (username !== originalData.username) {
            const checkResult = await userInfoService.checkUsernameExists({ username });
            if (checkResult.error) {
                setNotification({ message: checkResult.error, type: "error" });
                return;
            }
            if (checkResult.exists) {
                setNotification({ message: "Username is already taken", type: "error" });
                return;
            }
        }

        setIsSaving(true);

        try {
            const result = await userInfoService.updateProfile({
                userId: userData.$id,
                name: name !== originalData.name ? name : undefined,
                username: username !== originalData.username ? username : undefined,
                bio: bio !== originalData.bio ? bio : undefined,
                profileImage: profileImage !== originalData.profileImage ? profileImage : undefined
            });

            if (result.error) throw new Error(result.error);

            setOriginalData({ name, username, bio, profileImage });
            setNotification({ message: "Profile updated successfully", type: "success" });

            setTimeout(() => {
                navigate(`/profile/${username}`);
            }, 1500);

        } catch (error) {
            console.error("Failed to update profile:", error);
            setNotification({ message: error.message, type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    // Discard changes
    const handleDiscard = () => {
        setUsername(originalData.username);
        setBio(originalData.bio);
        setProfileImage(originalData.profileImage);
        setCroppedPreview(null);
    };

    if (isLoading) {
        return (
            <Loader />
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Edit Profile
                    </h1>
                    <div className="w-9"></div>
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-md"
                >
                    {/* Profile Image */}
                    <div className="flex flex-col items-center mb-8">
                        {croppedPreview ? (
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-zinc-900 overflow-hidden mb-6">
                                <img
                                    src={croppedPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <ProfileAvatar
                                profileId={userData?.$id}
                                size="2xl"
                                className="mb-4"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="profile-image-input"
                        />
                        <label
                            htmlFor="profile-image-input"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            <span className="text-sm font-medium">Change Photo</span>
                        </label>
                    </div>

                    {/* Full Name */}
                    <div className="mb-6">
                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2 ml-0.5">
                            Full Name
                        </label>
                        <InputField
                            icon={UserCircle}
                            placeholder="Full Name"
                            type="text"
                            value={name}
                            maxLength={30}
                            onChange={(e) => setName(e.target.value)}
                            className="text-[15px]"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Letters and spaces only
                        </p>
                    </div>

                    {/* Username */}
                    <div className="mb-6">
                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2 ml-0.5">
                            Username
                        </label>
                        <InputField
                            icon={User}
                            placeholder="Username"
                            type="text"
                            value={username}
                            maxLength={30}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            className="text-[15px]"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Letters, numbers, and underscores only
                        </p>
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2 ml-0.5">
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            maxLength={150}
                            rows={4}
                            className="w-full h-32 text-[15px] px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors duration-300 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            {bio.length}/150
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <button
                            onClick={handleDiscard}
                            disabled={isSaving || !hasChanges}
                            className="flex-1 text-sm font-semibold px-4 py-3 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Saving</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </motion.div>
                </motion.div>

                {/* Image Cropper Modal */}
                {showCropper && imageSrc && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-lg w-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Adjust Photo
                                </h3>
                                <button
                                    onClick={handleCropCancel}
                                    disabled={isUploading}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Cropper */}
                            <div className="relative h-96 bg-black rounded-xl overflow-hidden mb-4">
                                <Cropper
                                    key={cropperKey}
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape="round"
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>

                            {/* Zoom Slider */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Zoom: {Math.round(zoom * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full accent-blue-500"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCropCancel}
                                    disabled={isUploading}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCropConfirm}
                                    disabled={isUploading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Apply</span>
                                        </>
                                    ) : (
                                        <span>Apply</span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            <Toast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: "", type: "" })}
            />
        </div>
    );
};

// Helper to create image element
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

export default Settings;