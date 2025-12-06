import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Video, Plus, Check, Loader2, ArrowLeft, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import postService from '../../appwrite/postService';
import reelsService from '../../appwrite/reelsService';
import bucketService from '../../appwrite/bucketService';
import cloudinaryService from '../../cloudinary/cloudinaryService';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import { ID } from 'appwrite';
import followerService from '../../appwrite/followerService';
import { notifyFollowersNewPost } from '../../helpers/notificationHelpers';

const PostForm = () => {
	const userData = useSelector((state) => state.userData);
	const username = useSelector((state) => state.username);
	const { id } = useParams();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState("");
	const [contentType, setContentType] = useState(null); // 'post' or 'reel'
	const [showTypeSelector, setShowTypeSelector] = useState(true);

	const [formData, setFormData] = useState({
		title: "",
		content: "",
		images: [], // Multiple images for posts
		video: null, // Single video for reels
		visibility: "public",
	});
	const [imagePreviews, setImagePreviews] = useState([]);
	const [videoPreview, setVideoPreview] = useState(null);

	// Load existing post/reel data
	useEffect(() => {
		if (id) {
			setShowTypeSelector(false);
			fetchExistingContent();
		}
	}, [id]);

	const fetchExistingContent = async () => {
		setLoading(true);
		// Try to fetch as post first
		const { post, error: postError } = await postService.getPost(id);
		if (!postError && post) {
			setContentType('post');
			setFormData({
				title: post.title,
				content: post.content,
				images: post.images || [post.featuredImage], // Support both single and multiple
				video: null,
				visibility: post.visibility || "public",
			});

			// Load image previews
			const previews = (post.images || [post.featuredImage]).map(imageId =>
				bucketService.getFileDownload({ fileId: imageId }).preview
			);
			setImagePreviews(previews);
			setLoading(false);
			return;
		}

		// Try to fetch as reel
		const { reel, error: reelError } = await reelsService.getReel(id);
		if (!reelError && reel) {
			setContentType('reel');
			setFormData({
				title: reel.title,
				content: reel.content,
				images: [],
				video: reel.videoUrl,
				visibility: reel.visibility || "public",
			});
			setVideoPreview(reel.thumbnailUrl);
			setLoading(false);
			return;
		}

		setError("Content not found");
		setLoading(false);
	};

	// Handle content type selection
	const selectContentType = (type) => {
		setContentType(type);
		setShowTypeSelector(false);
	};

	// Handle multiple image uploads
	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		if (files.length === 0) return;

		// Limit to 10 images
		if (files.length + formData.images.length > 10) {
			setError("Maximum 10 images allowed");
			return;
		}

		setFormData({ ...formData, images: [...formData.images, ...files] });

		// Generate previews
		files.forEach(file => {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreviews(prev => [...prev, reader.result]);
			};
			reader.readAsDataURL(file);
		});
	};

	// Remove image
	const removeImage = (index) => {
		setFormData({
			...formData,
			images: formData.images.filter((_, i) => i !== index)
		});
		setImagePreviews(prev => prev.filter((_, i) => i !== index));
	};

	// Handle video upload
	const handleVideoUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Validate video
		const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
		if (!validTypes.includes(file.type)) {
			setError('Invalid video format. Please use MP4, MOV, AVI, or WebM');
			return;
		}

		// Check file size (100MB)
		const maxSize = 100 * 1024 * 1024;
		if (file.size > maxSize) {
			setError('Video size must be less than 100MB');
			return;
		}

		// Check duration (60 seconds)
		const video = document.createElement('video');
		video.preload = 'metadata';
		video.onloadedmetadata = () => {
			window.URL.revokeObjectURL(video.src);
			if (video.duration > 60) {
				setError('Video duration must be less than 60 seconds');
				return;
			}

			setFormData({ ...formData, video: file });
			setVideoPreview(URL.createObjectURL(file));
		};
		video.src = URL.createObjectURL(file);
	};

	// Handle drag/drop
	const handleDrop = (e, type) => {
		e.preventDefault();
		if (type === 'image') {
			const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
			if (files.length > 0) {
				const fakeEvent = { target: { files } };
				handleImageUpload(fakeEvent);
			}
		} else {
			const file = e.dataTransfer.files[0];
			if (file && file.type.startsWith('video/')) {
				const fakeEvent = { target: { files: [file] } };
				handleVideoUpload(fakeEvent);
			}
		}
	};

	const handleDragOver = (e) => e.preventDefault();

	// Submit form
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setUploadProgress(0);

		try {
			if (contentType === 'post') {
				await handlePostSubmit();
			} else {
				await handleReelSubmit();
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
			setUploadProgress(0);
		}
	};

	// Handle post submission (multiple images)
	const handlePostSubmit = async () => {
		let imageIds = [];

		// Upload images
		for (let i = 0; i < formData.images.length; i++) {
			const image = formData.images[i];

			if (image instanceof File) {
				setUploadProgress(Math.round(((i + 1) / formData.images.length) * 100));
				const { file, error: uploadError } = await bucketService.createFile({ file: image });
				if (uploadError) throw new Error(uploadError);
				imageIds.push(file.$id);
			} else {
				imageIds.push(image); // Existing image ID
			}
		}

		const postData = {
			title: formData.title,
			content: formData.content,
			images: imageIds,
			visibility: formData.visibility,
			userId: userData.$id,
		};

		if (id) {
			const { error: updateError } = await postService.updatePost({
				postId: id,
				...postData,
			});
			if (updateError) throw new Error(updateError);
		} else {
			const { post: createdPost, error: createError } = await postService.createPost({
				postId: ID.unique(),
				...postData,
			});
			if (createError) throw new Error(createError);

			// Notify followers
			const { followers } = await followerService.getFollowers({
				userId: userData.$id,
				limit: 100
			});

			await notifyFollowersNewPost({
				authorId: userData.$id,
				postId: createdPost.$id,
				followerIds: followers
			});
		}

		navigate(`/profile/${username}`);
	};

	// Handle reel submission (video)
	const handleReelSubmit = async () => {
		let videoUrl, thumbnailUrl, duration, cloudinaryPublicId;

		if (formData.video instanceof File) {
			// Upload to Cloudinary
			const uploadResult = await cloudinaryService.uploadVideo(
				formData.video,
				(progress) => setUploadProgress(progress)
			);

			if (uploadResult.error) throw new Error(uploadResult.error);

			videoUrl = uploadResult.videoUrl;
			thumbnailUrl = uploadResult.thumbnailUrl;
			duration = uploadResult.duration;
			cloudinaryPublicId = uploadResult.publicId;
		} else {
			// Existing video
			videoUrl = formData.video;
		}

		const reelData = {
			title: formData.title,
			content: formData.content,
			videoUrl,
			thumbnailUrl,
			duration,
			cloudinaryPublicId,
			visibility: formData.visibility,
			userId: userData.$id,
		};

		if (id) {
			const { error: updateError } = await reelsService.updateReel({
				reelId: id,
				userId: userData.$id,
				title: formData.title,
				content: formData.content,
				visibility: formData.visibility,
			});
			if (updateError) throw new Error(updateError);
		} else {
			const { reel: createdReel, error: createError } = await reelsService.createReel({
				reelId: ID.unique(),
				...reelData,
			});
			if (createError) throw new Error(createError);

			// Notify followers
			const { followers } = await followerService.getFollowers({
				userId: userData.$id,
				limit: 100
			});

			// You can create a separate notify function for reels
		}

		navigate('/reels');
	};

	// Clean up preview URLs
	useEffect(() => {
		return () => {
			if (videoPreview && videoPreview.startsWith("blob:")) {
				URL.revokeObjectURL(videoPreview);
			}
		};
	}, [videoPreview]);

	if (loading && !uploadProgress) return <Loader />;

	return (
		<div className="min-h-screen bg-white dark:bg-black py-8">
			<div className="container max-w-4xl mx-auto px-4">
				{/* Back Button */}
				<button
					onClick={() => navigate(-1)}
					className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
					<span className="font-medium">Back</span>
				</button>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					{/* Content Type Selector */}
					{showTypeSelector && !id && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-zinc-800 mb-6"
						>
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
								What do you want to create?
							</h2>
							<p className="text-gray-600 dark:text-gray-400 text-center mb-8">
								Choose the type of content you'd like to share
							</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Post Option */}
								<motion.button
									whileTap={{ scale: 0.98 }}
									onClick={() => selectContentType('post')}
									className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-8 transition-all hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl"
								>
									<div className="relative z-10">
										<div className="w-16 h-16 bg-blue-500 dark:bg-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
											<ImageIcon className="w-8 h-8 text-white" />
										</div>
										<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
											Create Post
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Share photos with captions. Perfect for galleries and moments.
										</p>
										<div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
											<span>Up to 10 images</span>
											<Plus className="w-4 h-4" />
										</div>
									</div>
								</motion.button>

								{/* Reel Option */}
								<motion.button
									whileTap={{ scale: 0.98 }}
									onClick={() => selectContentType('reel')}
									className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-8 transition-all hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl"
								>
									<div className="relative z-10">
										<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
											<Video className="w-8 h-8 text-white" />
										</div>
										<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
											Create Reel
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Share short videos. Engage with vertical content.
										</p>
										<div className="mt-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
											<span>Up to 60 seconds</span>
											<Play className="w-4 h-4" />
										</div>
									</div>
								</motion.button>
							</div>
						</motion.div>
					)}

					{/* Form */}
					{contentType && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
						>
							{/* Header with gradient */}
							<div className={`px-8 py-6 ${contentType === 'post' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'}`}>
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
										{contentType === 'post' ? (
											<ImageIcon className="w-6 h-6 text-white" />
										) : (
											<Video className="w-6 h-6 text-white" />
										)}
									</div>
									<div>
										<h1 className="text-2xl font-bold text-white">
											{id ? 'Edit' : 'Create'} {contentType === 'post' ? 'Post' : 'Reel'}
										</h1>
										<p className="text-white/80 text-sm">
											{contentType === 'post' ? 'Share your photos with the world' : 'Create engaging short videos'}
										</p>
									</div>
								</div>
							</div>

							<form onSubmit={handleSubmit} className="p-8 space-y-6">
								{/* Media Upload */}
								{contentType === 'post' ? (
									<>
										{/* Multiple Images Upload */}
										<div>
											<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
												Photos {imagePreviews.length > 0 && `(${imagePreviews.length}/10)`}
											</label>

											{imagePreviews.length > 0 ? (
												<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
													{imagePreviews.map((preview, index) => (
														<motion.div
															key={index}
															initial={{ opacity: 0, scale: 0.8 }}
															animate={{ opacity: 1, scale: 1 }}
															className="relative aspect-square rounded-xl overflow-hidden group"
														>
															<img
																src={preview}
																alt={`Preview ${index + 1}`}
																className="w-full h-full object-cover"
															/>
															<button
																type="button"
																onClick={() => removeImage(index)}
																className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
															>
																<X size={16} />
															</button>
														</motion.div>
													))}

													{/* Add More Button */}
													{imagePreviews.length < 10 && (
														<label className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors group">
															<div className="text-center">
																<Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
																<span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-500">Add More</span>
															</div>
															<input
																type="file"
																accept="image/*"
																multiple
																onChange={handleImageUpload}
																className="hidden"
															/>
														</label>
													)}
												</div>
											) : (
												<div
													onDrop={(e) => handleDrop(e, 'image')}
													onDragOver={handleDragOver}
													className="relative h-64 bg-gray-50 dark:bg-zinc-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
												>
													<label className="flex flex-col items-center justify-center h-full cursor-pointer">
														<Upload className="w-12 h-12 text-gray-400 mb-3" />
														<span className="text-gray-600 dark:text-gray-400 font-medium">
															Click to upload or drag and drop
														</span>
														<span className="text-sm text-gray-500 dark:text-gray-500 mt-1">
															PNG, JPG, GIF up to 10 images
														</span>
														<input
															type="file"
															accept="image/*"
															multiple
															onChange={handleImageUpload}
															className="hidden"
														/>
													</label>
												</div>
											)}
										</div>
									</>
								) : (
									<>
										{/* Video Upload */}
										<div>
											<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
												Video
											</label>
											{videoPreview ? (
												<div className="relative aspect-[9/16] max-w-sm mx-auto rounded-xl overflow-hidden group">
													<video
														src={formData.video instanceof File ? videoPreview : formData.video}
														className="w-full h-full object-cover"
														controls
													/>
													<button
														type="button"
														onClick={() => {
															setFormData({ ...formData, video: null });
															setVideoPreview(null);
														}}
														className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
													>
														<X size={16} />
													</button>
												</div>
											) : (
												<div
													onDrop={(e) => handleDrop(e, 'video')}
													onDragOver={handleDragOver}
													className="relative h-64 bg-gray-50 dark:bg-zinc-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
												>
													<label className="flex flex-col items-center justify-center h-full cursor-pointer">
														<Video className="w-12 h-12 text-gray-400 mb-3" />
														<span className="text-gray-600 dark:text-gray-400 font-medium">
															Click to upload or drag and drop
														</span>
														<span className="text-sm text-gray-500 dark:text-gray-500 mt-1">
															MP4, MOV, AVI, WebM • Max 60s • Under 100MB
														</span>
														<input
															type="file"
															accept="video/*"
															onChange={handleVideoUpload}
															className="hidden"
														/>
													</label>
												</div>
											)}
										</div>
									</>
								)}

								{/* Title */}
								<div>
									<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
										Title
									</label>
									<input
										type="text"
										placeholder={`Give your ${contentType} a title...`}
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
										required
										className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl border-2 border-gray-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
									/>
								</div>

								{/* Content */}
								<div>
									<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
										Caption
									</label>
									<textarea
										placeholder="Write your caption..."
										value={formData.content}
										onChange={(e) => setFormData({ ...formData, content: e.target.value })}
										required
										rows={4}
										className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl border-2 border-gray-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors resize-none scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent"
									/>
								</div>

								{/* Visibility Toggle */}
								<div>
									<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
										Visibility
									</label>
									<div className="relative inline-flex p-1 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
										<div
											className={`absolute h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-lg bg-white dark:bg-zinc-700 shadow-sm transition-all duration-300 ${formData.visibility === "public" ? "translate-x-0" : "translate-x-full"}`}
										></div>
										{["Public", "Private"].map((option) => (
											<button
												key={option}
												type="button"
												onClick={() => setFormData({ ...formData, visibility: option.toLowerCase() })}
												className={`relative z-10 px-6 py-2 text-sm font-medium rounded-lg transition-colors ${formData.visibility === option.toLowerCase()
													? "text-gray-900 dark:text-white"
													: "text-gray-500 dark:text-gray-400"
													}`}
											>
												{option}
											</button>
										))}
									</div>
								</div>

								{/* Upload Progress */}
								{uploadProgress > 0 && uploadProgress < 100 && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
									>
										<div className="flex items-center gap-3 mb-2">
											<Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
											<span className="text-sm font-medium text-blue-900 dark:text-blue-100">
												Uploading... {uploadProgress}%
											</span>
										</div>
										<div className="w-full h-2 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
											<motion.div
												className="h-full bg-blue-600 dark:bg-blue-400"
												initial={{ width: 0 }}
												animate={{ width: `${uploadProgress}%` }}
												transition={{ duration: 0.3 }}
											/>
										</div>
									</motion.div>
								)}

								{/* Submit Button */}
								<button
									type="submit"
									disabled={loading || (contentType === 'post' ? formData.images.length === 0 : !formData.video)}
									className={`w-full px-6 py-4 ${contentType === 'post'
										? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
										: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
										} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2`}
								>
									{loading ? (
										<>
											<Loader2 className="w-5 h-5 animate-spin" />
											{uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Processing...'}
										</>
									) : (
										<>
											<Check className="w-5 h-5" />
											{id ? 'Update' : 'Publish'} {contentType === 'post' ? 'Post' : 'Reel'}
										</>
									)}
								</button>
							</form>
						</motion.div>
					)}
				</motion.div>

				<Toast
					message={error}
					type="error"
					onClose={() => setError("")}
				/>
			</div>
		</div>
	);
};

export default PostForm;