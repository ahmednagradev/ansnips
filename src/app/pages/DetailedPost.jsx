import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, MoreVertical } from 'lucide-react';
import { useSelector } from 'react-redux';

import postService from '../../appwrite/postService';
import userInfoService from '../../appwrite/userInfoService';
import bucketService from '../../appwrite/bucketService';

import Toast from '../components/Toast';
import Loader from '../components/Loader';
import ConfirmationModal from '../components/ConfirmationModal';

import ProfileAvatar from '../components/ProfileAvatar';
import FollowButton from '../components/FollowButton';

import LikeButton from '../components/post_actions/LikeButton';
import CommentButton from '../components/post_actions/CommentButton';
import ShareButton from '../components/post_actions/ShareButton';
import SaveButton from '../components/post_actions/SaveButton';

import LikesModal from '../components/LikesModal';
import CommentsSection from '../components/CommentsSection';
import ImageCarousel from '../components/ImageCarousel';
import MenuButton from '../components/post_actions/MenuButton';

const DetailedPost = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const userData = useSelector(state => state.userData);

	const [post, setPost] = useState(null);
	const [author, setAuthor] = useState(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [unauthorized, setUnauthorized] = useState(false);

	// Delete flow
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Three-dot menu
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	// Likes modal
	const [showLikesModal, setShowLikesModal] = useState(false);

	// Comments
	const [commentsOpen, setCommentsOpen] = useState(false);
	const [commentsCount, setCommentsCount] = useState(0);

	useEffect(() => {
		fetchPost();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const fetchPost = async () => {
		setLoading(true);
		try {
			const { post, error } = await postService.getPost(id);

			if (error) {
				setError(error);
				setLoading(false);
				return;
			}

			// Privacy check
			if (post.visibility === 'private' && post.userId !== userData?.$id) {
				setUnauthorized(true);
				setLoading(false);
				return;
			}

			setPost(post);

			// Fetch author
			if (post.userId) {
				try {
					const { userInfo } = await userInfoService.getUserInfo(post.userId);
					setAuthor(userInfo);
				} catch (err) {
					console.error('Failed to fetch author details:', err);
				}
			}
		} catch (err) {
			console.error(err);
			setError('Failed to load post');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		setLoading(true);
		const { error } = await postService.deletePost({ postId: post.$id, userId: post.userId });
		if (error) {
			setError(error);
			setLoading(false);
			return;
		}
		navigate(-1);
	};

	// Comments handlers
	const openComments = () => setCommentsOpen(true);
	const closeComments = () => setCommentsOpen(false);
	const handleCommentCountChange = (newCount) => setCommentsCount(newCount);

	// Save button callback
	const handleSaveChange = (isSaved) => {
		// Optional: handle save state changes
	};

	// Get image URLs
	const getImageUrls = () => {
		if (!post) return [];

		if (post.images && Array.isArray(post.images)) {
			return post.images.map((id) => bucketService.getFileDownload({ fileId: id }).preview);
		} else if (post.featuredImage) {
			return [bucketService.getFileDownload({ fileId: post.featuredImage }).preview];
		}
		return [];
	};

	if (loading) return <Loader />;

	if (unauthorized) {
		return (
			<div className="container max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-8 md:py-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg p-8 text-center"
				>
					<div className="flex flex-col items-center justify-center gap-4">
						<div className="w-16 h-16 rounded-full border-2 border-rose-500 dark:border-rose-400 flex items-center justify-center">
							<Lock className="w-8 h-8 text-rose-500 dark:text-rose-400" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							Private Post
						</h1>
						<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
							This post is private and only visible to its author.
						</p>
						<button
							onClick={() => navigate('/home')}
							className="mt-4 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
						>
							Back to Home
						</button>
					</div>
				</motion.div>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="container max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-8 md:py-12">
				<div className="text-center">
					<p className="text-gray-600 dark:text-gray-400">Post not found</p>
					<button
						onClick={() => navigate('/home')}
						className="mt-4 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
					>
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	const imageUrls = getImageUrls();

	return (
		<div className="container max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-8 md:py-12">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md">

					{/* Visibility badge (if owner) */}
					{post?.userId === userData?.$id && (
						<div className="absolute z-10 top-2 left-4 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-200/70 dark:bg-blue-800/70 text-gray-800 dark:text-gray-200 mt-0.5">
							{post.visibility === 'public' ? (
								<span className='font-semibold'>Public</span>
							) : (
								<span className='font-semibold'>Private</span>
							)}
						</div>
					)}

					{/* Image Section */}
					{imageUrls.length > 0 && (
						<div className="w-full relative bg-zinc-50 dark:bg-zinc-950">
							<ImageCarousel images={imageUrls} alt={post.title} />
						</div>
					)}

					{/* Content */}
					<div className="p-4 md:p-6">
						{/* Title */}
						{post.title && (
							<div className="mb-4">
								<h1 className="text-xl font-semibold text-gray-900 dark:text-white">
									{post.title}
								</h1>
							</div>
						)}

						{/* Author row with 3-dot menu */}
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-6">
								{author && (
									<Link
										to={`/profile/${author?.username}`}
										className="flex items-center gap-2 text-[15px] font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all"
										onClick={(e) => e.stopPropagation()}
									>
										<ProfileAvatar profileId={post?.userId} />
										<span>{author?.username}</span>
									</Link>
								)}
								{userData && post?.userId !== userData?.$id && (
									<FollowButton targetUserId={post?.userId} />
								)}
							</div>

							{/* Three-dot menu (Edit/Delete) */}
							<MenuButton
								postId={post?.$id}
								ownerId={post?.userId}
								userId={userData?.$id}
								onDelete={handleDelete}
							/>
						</div>

						{/* Post content */}
						<div className="prose dark:prose-invert max-w-none">
							<p className="text-[15px] text-gray-800 dark:text-gray-200 mb-6 whitespace-pre-line">
								{post?.content}
							</p>
						</div>

						{/* Footer: actions + date */}
						<div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700">
							<div className="flex items-center justify-between">
								{/* Left - actions */}
								<div className="flex items-center gap-4">
									<LikeButton
										post={post}
										initialLikesCount={post?.likesCount ?? 0}
										onCountClick={() => setShowLikesModal(true)}
									/>

									<CommentButton
										postId={post?.$id}
										onClick={openComments}
										commentsCount={commentsCount || post?.commentsCount || 0}
									/>

									<ShareButton
										postId={post?.$id}
										title={post?.title}
										content={post?.content}
									/>

									<SaveButton
										postId={post?.$id}
										onSaveChange={handleSaveChange}
									/>
								</div>

								{/* Right - date */}
								<p className="text-sm text-gray-500 dark:text-gray-400">
									<span className="sm:hidden">{new Date(post?.$createdAt).toLocaleDateString()}</span>
									<span className="hidden sm:inline">Posted on {new Date(post?.$createdAt).toLocaleDateString()}</span>
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Likes modal */}
				<LikesModal
					postId={post?.$id}
					isOpen={showLikesModal}
					onClose={() => setShowLikesModal(false)}
				/>

				{/* Comments section */}
				<CommentsSection
					postId={post?.$id}
					postOwnerId={post?.userId}
					isOpen={commentsOpen}
					onClose={closeComments}
					onCommentCountChange={handleCommentCountChange}
				/>

			</motion.div>

			<Toast message={error} onClose={() => setError("")} />
		</div>
	);
};

export default DetailedPost;