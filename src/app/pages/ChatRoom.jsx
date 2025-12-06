import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    Send,
    Image as ImageIcon,
    X,
    Loader2,
    Trash2,
    Check,
    CheckCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useConversation } from "../../hooks/useConversation";
import bucketService from "../../appwrite/bucketService";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import ConfirmationModal from "../components/ConfirmationModal";

const ChatRoom = () => {
    const { chatRoomId } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.userData);

    const {
        messages,
        chatRoom,
        loading,
        sending,
        error: hookError,
        hasMore,
        sendMessage,
        deleteMessage,
        loadMoreMessages,
        setError: setHookError,
    } = useConversation(chatRoomId, userData?.$id);

    const [messageText, setMessageText] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (hookError) {
            setNotification({ message: hookError, type: "error" });
            setHookError(null);
        }
    }, [hookError, setHookError]);

    useEffect(() => {
        if (isAtBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isAtBottom]);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const threshold = 100;
        setIsAtBottom(
            container.scrollHeight - container.scrollTop - container.clientHeight <
            threshold
        );

        if (container.scrollTop === 0 && hasMore && !loading) {
            loadMoreMessages();
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (
            !file ||
            !file.type.startsWith("image/") ||
            file.size > 5 * 1024 * 1024
        ) {
            setNotification({
                message: !file ? "No file selected" : "Image must be less than 5MB",
                type: "error",
            });
            return;
        }

        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() && !selectedImage) return;

        const result = await sendMessage(messageText.trim(), selectedImage);
        if (result?.error) {
            setNotification({ message: result.error, type: "error" });
        } else {
            setMessageText("");
            handleRemoveImage();
            if (textareaRef.current) textareaRef.current.style.height = "auto";
        }
    };

    const handleDeleteMessage = async (messageId) => {
        const result = await deleteMessage(messageId);
        setNotification({
            message: result?.error || "Message deleted",
            type: result?.error ? "error" : "success",
        });
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [messageText]);

    if (loading && messages.length === 0) return <Loader />;

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent"
            >
                {/* Load more indicator */}
                {hasMore && (
                    <div className="text-center py-2">
                        <button
                            onClick={loadMoreMessages}
                            disabled={loading}
                            className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                        >
                            {loading ? "Loading..." : "Load more messages"}
                        </button>
                    </div>
                )}

                {/* Messages */}
                <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((message, index) => {
                        const isOwnMessage = message.senderId === userData.$id;

                        const currentDate = new Date(message.$createdAt);
                        const prevDate =
                            index > 0 ? new Date(messages[index - 1].$createdAt) : null;

                        // Helper function for day difference
                        const isDifferentDay =
                            !prevDate ||
                            currentDate.toDateString() !== prevDate.toDateString();

                        // Format date label like WhatsApp
                        const getDateLabel = (date) => {
                            const today = new Date();
                            const yesterday = new Date();
                            yesterday.setDate(today.getDate() - 1);

                            if (date.toDateString() === today.toDateString()) return "Today";
                            if (date.toDateString() === yesterday.toDateString())
                                return "Yesterday";
                            return date.toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year:
                                    today.getFullYear() !== date.getFullYear()
                                        ? "numeric"
                                        : undefined,
                            });
                        };

                        return (
                            <div key={message.$id}>
                                {/* Date Divider */}
                                {isDifferentDay && (
                                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-4">
                                        {getDateLabel(currentDate)}
                                    </div>
                                )}

                                {/* Message bubble */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"
                                        } mb-2`}
                                >
                                    <div
                                        className={`group relative max-w-[70%] flex flex-col ${isOwnMessage ? "items-end" : "items-start"
                                            }`}
                                    >
                                        {/* Message Bubble */}
                                        <div
                                            className={`px-4 py-2 rounded-2xl transition-all duration-300 backdrop-blur-lg shadow-md border select-text
                                                ${isOwnMessage
                                                    ? "bg-gradient-to-br from-blue-400/20 to-blue-600/10 border-blue-300/30 text-gray-900 dark:text-gray-100 rounded-br-md shadow-blue-200/40 dark:shadow-blue-900/30"
                                                    : "bg-gradient-to-br from-zinc-200/40 to-zinc-100/10 dark:from-zinc-800/40 dark:to-zinc-900/10 border-zinc-300/40 dark:border-zinc-700/40 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-gray-300/30 dark:shadow-zinc-900/40"
                                                }`}
                                        >
                                            {/* Image (optional) */}
                                            {message.imageId && (
                                                <img
                                                    src={
                                                        bucketService.getFileDownload({
                                                            fileId: message.imageId,
                                                        }).preview
                                                    }
                                                    alt="Message attachment"
                                                    className="rounded-xl max-w-xs w-full h-auto object-cover mb-2 cursor-pointer border border-white/10 shadow-md shadow-black/10 transition-transform duration-300 hover:scale-[1.015] hover:shadow-lg hover:shadow-black/20"
                                                    onClick={() =>
                                                        window.open(
                                                            bucketService.getFileDownload({
                                                                fileId: message.imageId,
                                                            }).preview,
                                                            "_blank"
                                                        )
                                                    }
                                                    loading="lazy"
                                                />
                                            )}

                                            {/* Message + time + ticks inline */}
                                            <div className="flex flex-wrap">
                                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                    {message.message}
                                                </p>

                                                <div className="flex items-center justify-end w-full gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                                    <span>
                                                        {new Date(message.$createdAt).toLocaleTimeString(
                                                            "en-US",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            }
                                                        )}
                                                    </span>
                                                    {isOwnMessage &&
                                                        (message.isRead ? (
                                                            <CheckCheck
                                                                size={12}
                                                                className="stroke-[2] text-blue-500 dark:text-blue-400"
                                                            />
                                                        ) : (
                                                            <Check size={12} className="stroke-[2]" />
                                                        ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete button */}
                                        {isOwnMessage && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteTarget(message); // Open delete modal for this message only
                                                }}
                                                className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-200/70 dark:hover:bg-zinc-800/70 rounded-full"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 px-4 py-3">
                <div className="max-w-4xl mx-auto">
                    {imagePreview && (
                        <div className="mb-3 relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-32 rounded-lg border border-gray-200 dark:border-zinc-800"
                            />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sending}
                            className="p-2.5 border-t border-r border-gray-200 dark:border-zinc-700 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <textarea
                            ref={textareaRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Message..."
                            disabled={sending}
                            rows={1}
                            className="flex-1 resize-none bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all duration-300 scrollbar-none"
                            style={{ minHeight: "40px", maxHeight: "120px" }}
                        />
                        <button
                            type="submit"
                            disabled={(!messageText.trim() && !selectedImage) || sending}
                            className="p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => handleDeleteMessage(deleteTarget.$id)}
                title="Delete Message"
                message="Are you sure you want to delete this message? This cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="red"
            />

            <Toast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: "", type: "" })}
            />
        </div>
    );
};

export default ChatRoom;
