import { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import chatRoomService from "../../appwrite/chatRoomService";
import Loader from "../components/Loader";
import ProfileAvatar from "../components/ProfileAvatar";
import userInfoService from "../../appwrite/userInfoService";

const ChatSection = () => {
    const navigate = useNavigate();
    const userData = useSelector((state) => state.userData);

    const [chatRooms, setChatRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCache, setUserCache] = useState({});
    const [showSearch, setShowSearch] = useState(false);

    const fetchChatRooms = useCallback(async () => {
        if (!userData?.$id) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await chatRoomService.getUserChatRooms({
                userId: userData.$id,
                limit: 100,
            });

            if (result.error) throw new Error(result.error);

            const rooms = result.chatRooms;

            const cache = {};
            await Promise.all(
                rooms.map(async (room) => {
                    const otherUserId = room.participants.find(
                        (id) => id !== userData.$id
                    );
                    if (otherUserId && !cache[otherUserId]) {
                        try {
                            const { userInfo } = await userInfoService.getUserInfo(
                                otherUserId
                            );
                            cache[otherUserId] = userInfo.name || "Unknown User";
                        } catch {
                            cache[otherUserId] = "Unknown User";
                        }
                    }
                })
            );

            setChatRooms(rooms);
            setUserCache(cache);
        } catch (err) {
            console.error("ChatSection error:", err);
            setError(err.message || "Failed to load chat rooms");
        } finally {
            setIsLoading(false);
        }
    }, [userData?.$id]);

    useEffect(() => {
        fetchChatRooms();
    }, [fetchChatRooms]);

    const filteredRooms = useMemo(() => {
        if (!searchTerm.trim()) return chatRooms;

        const lower = searchTerm.toLowerCase();
        return chatRooms.filter((room) => {
            const otherUserId = room.participants.find((id) => id !== userData.$id);
            const name = userCache[otherUserId || ""];
            return name?.toLowerCase().includes(lower);
        });
    }, [searchTerm, chatRooms, userCache, userData.$id]);

    const getUnreadCount = (chatRoom) => {
        const unread = JSON.parse(chatRoom.unreadCount || "{}");
        return unread[userData.$id] || 0;
    };

    const handleChatClick = (chatRoomId) => {
        navigate(`/chat/${chatRoomId}`);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 48) return "Yesterday";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    if (isLoading) return <Loader />;

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Failed to load chats
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchChatRooms}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        aria-label="Retry loading chats"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );

    if (chatRooms.length === 0)
        return (
            <div className="min-h-screen">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <MessageCircle className="w-7 h-7 text-blue-500 dark:text-blue-400" />{" "}
                            Messages
                        </h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-zinc-800"
                    >
                        <MessageCircle className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                            No messages yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start a conversation by visiting someone's profile and clicking
                            “Message”
                        </p>
                        <button
                            onClick={() => navigate("/home")}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            aria-label="Explore posts"
                        >
                            Explore Posts
                        </button>
                    </motion.div>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <MessageCircle className="w-7 h-7 text-blue-500 dark:text-blue-400" />
                            Messages
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowSearch((prev) => !prev)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                        aria-label="Toggle search"
                    >
                        <Search
                            className={`w-5 h-5 transition-colors ${showSearch
                                    ? "text-blue-500 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                        />
                    </button>
                </div>

                <motion.div
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    className="flex flex-col space-y-4"
                >
                    <AnimatePresence mode="popLayout">
                        {showSearch && (
                            <motion.div
                                key="searchbar"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                            >
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search chats..."
                                    className="w-full pl-10 pr-5 py-2.5 text-[14px] bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                                    aria-label="Search chats"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Chat Rooms List */}
                    <motion.div
                        layout
                        transition={{ duration: 0.4 }}
                        className="space-y-2"
                    >
                        {filteredRooms.length === 0 ? (
                            <div className="text-center py-12 font-medium text-gray-500 dark:text-gray-400">
                                No chats found
                            </div>
                        ) : (
                            filteredRooms.map((room, index) => {
                                const unreadCount = getUnreadCount(room);
                                const otherUserId = room.participants.find(
                                    (id) => id !== userData.$id
                                );

                                const statusText =
                                    unreadCount > 0
                                        ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""
                                        }`
                                        : "No new messages";

                                return (
                                    <motion.button
                                        key={room.$id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.04, duration: 0.3 }}
                                        onClick={() => handleChatClick(room.$id)}
                                        className={`w-full flex items-start justify-between px-4 py-3 transition-all rounded-lg hover:scale-[1.010]
                                            ${unreadCount > 0
                                                ? "bg-gradient-to-br from-blue-300/60 to-gray-100 dark:from-blue-900/60 dark:to-zinc-900 border-b border-blue-300/60 dark:border-blue-900/60"
                                                : "bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800"
                                            }`}
                                        aria-label={`Open chat with ${userCache[otherUserId || ""] || "Unknown User"
                                            }`}
                                    >
                                        <div className="flex w-full items-center gap-4">
                                            <div className="relative flex-shrink-0">
                                                <ProfileAvatar
                                                    profileId={otherUserId || ""}
                                                    size="md"
                                                />
                                                {unreadCount > 0 && (
                                                    <div className="absolute -bottom-1 -right-1 min-w-[20px] h-5 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1.5">
                                                        {unreadCount > 9 ? "9+" : unreadCount}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h3
                                                        className={`leading-snug ${unreadCount > 0 ? "font-semibold" : "font-medium"
                                                            } text-gray-900 dark:text-gray-100`}
                                                    >
                                                        {userCache[otherUserId || ""] || "Unknown User"}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                                                        {formatTime(room?.lastMessageTime)}
                                                    </span>
                                                </div>
                                                <p className="text-sm mt-0.5 line-clamp-2 text-gray-600 dark:text-gray-400 font-normal">
                                                    {statusText}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ChatSection;
