import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Edit2, Trash2, Loader2, MoreVertical, Heart } from "lucide-react";
import commentService from "../../appwrite/commentService";
import commentLikeService from "../../appwrite/commentLikeService";
import { useSelector } from "react-redux";
import ProfileAvatar from "./ProfileAvatar";
import userInfoService from "../../appwrite/userInfoService";
import UsernameDisplay from "./UsernameDisplay";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";
import { notifyComment } from "../../helpers/notificationHelpers";

/**
 * Enhanced CommentsSection
 * - Improved like button UX (optimistic + in-flight lock + animation)
 * - Enter to submit (Shift+Enter for newline)
 * - Better action layout, accessibility, micro-interactions
 */

const CommentsSection = ({ postId, postOwnerId, isOpen, onClose, onCommentCountChange }) => {
    const userData = useSelector((state) => state.userData);
    const [usersData, setUsersData] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [likeCounts, setLikeCounts] = useState({});
    const [likedComments, setLikedComments] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [replies, setReplies] = useState({});
    const [loadingReplies, setLoadingReplies] = useState({});
    const [pendingLikes, setPendingLikes] = useState({}); // NEW: track in-flight like/unlike per comment
    const commentsEndRef = useRef(null);
    const inputRef = useRef(null);
    const [notification, setNotification] = useState({ message: "", type: "" });
    const navigate = useNavigate();

    const COMMENTS_LIMIT = 20;
    const MAX_COMMENT_LENGTH = 500;

    useEffect(() => {
        if (isOpen && postId) loadComments(true);
    }, [isOpen, postId]);

    useEffect(() => {
        if (isOpen && inputRef.current && !replyingTo) inputRef.current.focus();
    }, [isOpen, replyingTo]);

    /* ---------- Loading & likes ---------- */
    const loadComments = async (reset = false) => {
        if (isLoading) return;
        setIsLoading(true);
        const currentOffset = reset ? 0 : offset;

        try {
            const result = await commentService.getPostComments({
                postId,
                limit: COMMENTS_LIMIT,
                offset: currentOffset
            });

            if (result.error) throw new Error(result.error);

            const userIds = [...new Set(result.comments.map(c => c.userId))];
            const userDataPromises = userIds.map(userId => userInfoService.getUserInfo(userId));
            const userDataResults = await Promise.all(userDataPromises);

            const dataMap = reset ? {} : { ...usersData };
            userDataResults.forEach((r, i) => {
                if (!r.error) dataMap[userIds[i]] = r.userInfo;
            });

            if (reset) setComments(result.comments);
            else setComments(prev => [...prev, ...result.comments]);

            setUsersData(dataMap);
            setHasMore(result.hasMore);
            setOffset(currentOffset + result.comments.length);

            await loadCommentLikes(result.comments.map(c => c.$id));

            if (onCommentCountChange) onCommentCountChange(result.total);
        } catch (error) {
            console.error("Failed to load comments:", error);
            setNotification({ message: "Failed to load comments", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const loadCommentLikes = async (commentIds) => {
        if (!commentIds || commentIds.length === 0) return;
        try {
            const { likeCounts: counts } = await commentLikeService.getBatchCommentLikes(commentIds);
            setLikeCounts(prev => ({ ...prev, ...counts }));

            if (userData?.$id) {
                const { likedComments: liked } = await commentLikeService.getBatchUserLikes(commentIds, userData.$id);
                setLikedComments(prev => ({ ...prev, ...liked }));
            }
        } catch (error) {
            console.error("Failed to load likes:", error);
        }
    };

    /* ---------- Like handling (optimistic + per-comment in-flight lock) ---------- */
    const handleLikeComment = useCallback(async (commentId, commentOwnerId) => {
        if (!userData?.$id) {
            setNotification({ message: "Please login to like comments", type: "error" });
            return;
        }

        // If a like/unlike is already in progress for this comment, ignore extra clicks.
        if (pendingLikes[commentId]) return;

        const currentlyLiked = !!likedComments[commentId];

        // Optimistic update
        setLikedComments(prev => ({ ...prev, [commentId]: !currentlyLiked }));
        setLikeCounts(prev => ({
            ...prev,
            [commentId]: (prev[commentId] || 0) + (currentlyLiked ? -1 : 1)
        }));
        setPendingLikes(prev => ({ ...prev, [commentId]: true }));

        try {
            if (currentlyLiked) {
                const res = await commentLikeService.unlikeComment({ commentId, userId: userData.$id });
                if (res.error) throw new Error(res.error);
            } else {
                const res = await commentLikeService.likeComment({ commentId, userId: userData.$id, commentOwnerId });
                if (res.error) throw new Error(res.error);
            }
            // success -> clear pending
            setPendingLikes(prev => {
                const copy = { ...prev };
                delete copy[commentId];
                return copy;
            });
        } catch (error) {
            // revert optimistic update on error
            setLikedComments(prev => ({ ...prev, [commentId]: currentlyLiked }));
            setLikeCounts(prev => ({
                ...prev,
                [commentId]: (prev[commentId] || 0) + (currentlyLiked ? 1 : -1)
            }));
            setPendingLikes(prev => {
                const copy = { ...prev };
                delete copy[commentId];
                return copy;
            });

            setNotification({ message: error.message || "Failed to update like", type: "error" });
        }
    }, [likedComments, pendingLikes, userData]);

    /* ---------- Add comment/reply (kept mostly same) ---------- */
    const submitComment = async () => {
        // helper for programmatic submit (Enter key)
        if (!userData?.$id) {
            setNotification({ message: "Please login to comment", type: "error" });
            return;
        }
        const trimmed = newComment.trim();
        if (!trimmed) return;
        if (trimmed.length > MAX_COMMENT_LENGTH) {
            setNotification({ message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`, type: "error" });
            return;
        }
        setIsSubmitting(true);

        try {
            const { userInfo } = await userInfoService.getUserInfo(userData.$id);
            const currentUser = userInfo?.username;

            const result = await commentService.createComment({
                userId: userData.$id,
                username: currentUser,
                postId,
                comment: trimmed,
                parentCommentId: replyingTo
            });

            if (result.error) throw new Error(result.error);

            if (replyingTo) {
                setReplies(prev => ({
                    ...prev,
                    [replyingTo]: [result.comment, ...(prev[replyingTo] || [])]
                }));

                setComments(prev => prev.map(c =>
                    c.$id === replyingTo ? { ...c, replyCount: (c.replyCount || 0) + 1 } : c
                ));
            } else {
                setComments(prev => [result.comment, ...prev]);
            }

            setNewComment("");
            setReplyingTo(null);

            if (!replyingTo && onCommentCountChange) onCommentCountChange(comments.length + 1);

            if (postOwnerId) {
                await notifyComment({ postOwnerId, actorId: userData.$id, postId, commentText: trimmed });
            }

            setNotification({ message: replyingTo ? "Reply added" : "Comment added", type: "success" });
        } catch (error) {
            console.error("Failed to add comment:", error);
            setNotification({ message: error.message || "Failed to add comment", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddComment = async (e) => {
        e?.preventDefault?.();
        await submitComment();
    };

    /* ---------- Replies, edit, delete (kept same) ---------- */
    const loadReplies = async (commentId) => {
        if (loadingReplies[commentId]) return;
        setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
        try {
            const result = await commentService.getCommentReplies({ commentId, limit: 50 });
            if (result.error) throw new Error(result.error);

            setReplies(prev => ({ ...prev, [commentId]: result.comments }));

            const userIds = [...new Set(result.comments.map(r => r.userId))];
            const userDataPromises = userIds.map(userId => userInfoService.getUserInfo(userId));
            const userDataResults = await Promise.all(userDataPromises);

            const dataMap = { ...usersData };
            userDataResults.forEach((res, idx) => {
                if (!res.error) dataMap[userIds[idx]] = res.userInfo;
            });
            setUsersData(dataMap);

            await loadCommentLikes(result.comments.map(r => r.$id));

            setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
        } catch (error) {
            console.error("Failed to load replies:", error);
            setNotification({ message: "Failed to load replies", type: "error" });
        } finally {
            setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
        }
    };

    const toggleReplies = (commentId) => {
        if (expandedReplies[commentId]) setExpandedReplies(prev => ({ ...prev, [commentId]: false }));
        else {
            if (!replies[commentId]) loadReplies(commentId);
            else setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editingCommentText.trim()) {
            setNotification({ message: "Comment cannot be empty", type: "error" });
            return;
        }
        if (editingCommentText.length > MAX_COMMENT_LENGTH) {
            setNotification({ message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`, type: "error" });
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await commentService.updateComment({
                commentId,
                userId: userData.$id,
                comment: editingCommentText.trim()
            });
            if (result.error) throw new Error(result.error);

            setComments(prev => prev.map(c => c.$id === commentId ? result.comment : c));
            Object.keys(replies).forEach(parentId => {
                setReplies(prev => ({
                    ...prev,
                    [parentId]: prev[parentId]?.map(r => r.$id === commentId ? result.comment : r)
                }));
            });

            setEditingCommentId(null);
            setEditingCommentText("");
            setNotification({ message: "Comment updated", type: "success" });
        } catch (error) {
            console.error("Failed to update comment:", error);
            setNotification({ message: error.message || "Failed to update comment", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId, parentCommentId = null) => {
        setIsSubmitting(true);
        try {
            const result = await commentService.deleteComment({ commentId, userId: userData.$id });
            if (result.error) throw new Error(result.error);

            if (parentCommentId) {
                setReplies(prev => ({ ...prev, [parentCommentId]: prev[parentCommentId]?.filter(r => r.$id !== commentId) }));
                setComments(prev => prev.map(c => c.$id === parentCommentId ? { ...c, replyCount: Math.max((c.replyCount || 0) - 1, 0) } : c));
            } else {
                setComments(prev => prev.filter(c => c.$id !== commentId));
                if (onCommentCountChange) onCommentCountChange(comments.length - 1);
            }

            setNotification({ message: "Comment deleted", type: "success" });
        } catch (error) {
            console.error("Failed to delete comment:", error);
            setNotification({ message: error.message || "Failed to delete comment", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.$id);
        setEditingCommentText(comment.comment);
        setOpenMenuId(null);
    };
    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditingCommentText("");
    };
    const canModifyComment = (comment) => {
        return userData?.$id && (comment.userId === userData.$id || postOwnerId === userData.$id);
    };

    const handleUserClick = (username) => {
        navigate(`/profile/${username}`);
        onClose();
    };

    const startReply = (commentId, username) => {
        setReplyingTo(commentId);
        setNewComment(`@${username} `);
        // focus next tick
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setNewComment("");
    };

    /* ---------- Render single comment ---------- */
    const renderComment = (comment, isReply = false, parentCommentId = null) => {
        const userInfo = usersData[comment.userId];
        const isPostOwner = comment.userId === postOwnerId;
        const likeCount = likeCounts[comment.$id] || 0;
        const isLiked = !!likedComments[comment.$id];
        const hasReplies = comment.replyCount > 0;
        const commentReplies = replies[comment.$id] || [];
        const isExpanded = expandedReplies[comment.$id];
        const inFlight = !!pendingLikes[comment.$id];

        return (
            <div key={comment.$id} className={isReply ? "ml-10" : ""}>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex gap-3">
                    <div onClick={() => handleUserClick(userInfo?.username)} className="flex-shrink-0 cursor-pointer">
                        <ProfileAvatar profileId={comment.userId} size="sm" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span onClick={() => handleUserClick(userInfo?.username)} className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer break-words">
                                        {userInfo?.username || <UsernameDisplay id={comment.userId} />}
                                    </span>
                                    {isPostOwner && (
                                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                            Author
                                        </span>
                                    )}
                                    <span className="text-[11px] ml-2 text-gray-500 dark:text-gray-400">
                                        {new Date(comment.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {editingCommentId === comment.$id ? (
                                    <div className="mt-2 space-y-2">
                                        <textarea
                                            value={editingCommentText}
                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white resize-none transition-all duration-300"
                                            rows="3"
                                            maxLength={MAX_COMMENT_LENGTH}
                                            disabled={isSubmitting}
                                        />
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEditComment(comment.$id)} disabled={isSubmitting} className="px-3 py-1 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                                                Save
                                            </button>
                                            <button onClick={cancelEditing} disabled={isSubmitting} className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                Cancel
                                            </button>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-auto">
                                                {editingCommentText.length}/{MAX_COMMENT_LENGTH}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        <p className="text-sm text-gray-800 dark:text-gray-200 break-words pr-2">
                                            {comment.comment}
                                        </p>

                                        {/* Action row: right-aligned like + count and left-aligned reply */}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-4">
                                                {!isReply && (
                                                    <button
                                                        onClick={() => startReply(comment.$id, userInfo?.username)}
                                                        className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                    >
                                                        Reply
                                                    </button>
                                                )}

                                                {/* View Replies toggle */}
                                                {!isReply && hasReplies && (
                                                    <button
                                                        onClick={() => toggleReplies(comment.$id)}
                                                        disabled={loadingReplies[comment.$id]}
                                                        className="text-xs font-medium text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                                                        aria-expanded={isExpanded}
                                                        title={`${isExpanded ? 'Hide' : 'View'} replies`}
                                                    >
                                                        {loadingReplies[comment.$id] ? <Loader2 className="w-3 h-3 animate-spin" /> : (isExpanded ? 'Hide' : 'View')}{' '}
                                                        <span className="ml-1 text-xs">{comment.replyCount}</span>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Like button cluster (right side) */}
                                                <div className="flex items-center gap-1">
                                                    <motion.button
                                                        onClick={() => handleLikeComment(comment.$id, comment.userId)}
                                                        disabled={inFlight}
                                                        aria-pressed={isLiked}
                                                        aria-label={isLiked ? "Unlike" : "Like"}
                                                        title={isLiked ? "Unlike" : "Like"}
                                                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-all ${inFlight ? 'opacity-70 cursor-wait' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'} `}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <motion.span
                                                            key={isLiked ? "liked" : "unliked"}
                                                            initial={{ scale: 0.9, opacity: 0.6 }}
                                                            animate={{ scale: isLiked ? 1.12 : 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-500 dark:text-gray-400'}`} />
                                                        </motion.span>

                                                        {likeCount > 0 && (
                                                            <span className={`text-xs ${isLiked ? 'text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                {likeCount}
                                                            </span>
                                                        )}
                                                    </motion.button>

                                                    {/* More menu */}
                                                    {canModifyComment(comment) && (
                                                        <div className="relative">
                                                            <button onClick={() => setOpenMenuId(openMenuId === comment.$id ? null : comment.$id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
                                                                <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                            </button>

                                                            {openMenuId === comment.$id && (
                                                                <div className="absolute right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-md z-20 overflow-hidden">
                                                                    <ul className="text-sm text-gray-700 dark:text-gray-300">
                                                                        {comment.userId === userData?.$id && (
                                                                            <li>
                                                                                <button onClick={() => { startEditing(comment); setOpenMenuId(null); }} className="flex items-center gap-1.5 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">
                                                                                    <Edit2 className="w-3.5 h-3.5" /> <span className="text-xs">Edit</span>
                                                                                </button>
                                                                            </li>
                                                                        )}
                                                                        <li>
                                                                            <button onClick={() => { handleDeleteComment(comment.$id, parentCommentId); setOpenMenuId(null); }} className="flex items-center gap-1.5 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-rose-500">
                                                                                <Trash2 className="w-3.5 h-3.5" /> <span className="text-xs">Delete</span>
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Replies */}
                        {!isReply && isExpanded && commentReplies.length > 0 && (
                            <div className="mt-3 space-y-3">
                                {commentReplies.map(reply => renderComment(reply, true, comment.$id))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    };

    if (!isOpen) return null;

    /* ---------- keyboard handling for input: Enter submits, Shift+Enter newline ---------- */
    const onInputKeyDown = (e) => {
        // avoid interfering when composing with IME
        if (e.isComposing) return;
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isSubmitting && newComment.trim().length > 0) {
                submitComment();
            }
        }
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 h-full" onClick={onClose}>
                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="w-full md:max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-2xl shadow-xl flex flex-col max-h-[calc(100vh-1rem)] md:max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none overscroll-contain">
                        {comments.length === 0 && !isLoading ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Be the first to comment!</div>
                        ) : (
                            comments.map((comment) => renderComment(comment))
                        )}

                        {!userData?.$id && (
                            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Please login to add comments</p>
                            </div>
                        )}

                        {hasMore && (
                            <button onClick={() => loadComments()} disabled={isLoading} className="w-full py-2 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors disabled:opacity-50">
                                {isLoading ? "Loading..." : "Load more comments"}
                            </button>
                        )}

                        {isLoading && comments.length === 0 && (
                            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                        )}

                        <div ref={commentsEndRef} />
                    </div>

                    {userData?.$id && (
                        <form onSubmit={handleAddComment} className="sticky bottom-0 z-10 p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                            {replyingTo && (
                                <div className="mb-2 flex items-center justify-between shadow-sm border border-gray-100 dark:border-zinc-800 px-3 py-2 rounded-lg">
                                    <span className="text-[13px] text-gray-600 dark:text-gray-400">Replying to comment</span>
                                    <button onClick={cancelReply} type="button" className="text-xs font-medium text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500">Cancel</button>
                                </div>
                            )}

                            <div className="flex gap-3 items-end">
                                <div className="flex-1">
                                    <div className="flex items-end gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={onInputKeyDown} // NEW: key handling
                                            placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
                                            className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300"
                                            maxLength={MAX_COMMENT_LENGTH}
                                            disabled={isSubmitting}
                                            aria-label="Add a comment"
                                        />
                                        <button type="submit" disabled={!newComment.trim() || isSubmitting} className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send comment">
                                            {isSubmitting ? (<Loader2 className="w-5 h-5 animate-spin" />) : (<Send className="w-5 h-5" />)}
                                        </button>
                                    </div>

                                    {newComment.length > 0 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                                            {newComment.length}/{MAX_COMMENT_LENGTH}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}

                    <Toast message={notification.message} type={notification.type} duration={1500} onClose={() => setNotification({ message: "", type: "" })} />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommentsSection;