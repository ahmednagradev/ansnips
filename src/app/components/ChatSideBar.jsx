import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Trash2, Edit2, Check, X as XIcon, MoreVertical } from 'lucide-react';
import { useSelector } from 'react-redux';
import chatService from '../../appwrite/chatService';
import ConfirmationModal from './ConfirmationModal';

const ChatSideBar = ({ isOpen, onClose, onLoadConversation }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null); // Track which session to delete
    const userData = useSelector(state => state.userData);
    const [menuOpen, setMenuOpen] = useState(null); // For opening and closing action menu

    // Load saved sessions when sidebar opens
    useEffect(() => {
        if (isOpen && userData?.$id) {
            loadSessions();
        }
    }, [isOpen, userData]);

    // Close action menu if clicked outside
    useEffect(() => {
        const close = () => setMenuOpen(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    // Fetch all saved sessions
    const loadSessions = async () => {
        setLoading(true);
        const { sessions: fetchedSessions, error } = await chatService.getChatSessions(userData.$id);
        if (!error) setSessions(fetchedSessions || []);
        setLoading(false);
    };

    // Load selected conversation into chat
    const handleLoadConversation = (session) => {
        try {
            const messages = JSON.parse(session.chat);
            onLoadConversation(messages, session.title);
            onClose();
        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    };

    // Delete a conversation after confirmation
    const handleDelete = async (sessionId, e) => {
        e.stopPropagation();
        const { error } = await chatService.deleteChatSession(sessionId);
        if (!error) setSessions(prev => prev.filter(s => s.$id !== sessionId));
        setDeleteTarget(null); // Close modal after delete
    };

    // Start editing a title
    const handleStartEdit = (session, e) => {
        e.stopPropagation();
        setEditingId(session.$id);
        setEditTitle(session.title);
    };

    // Save edited title
    const handleSaveEdit = async (sessionId, e) => {
        e?.stopPropagation();
        if (!editTitle.trim()) return;
        const { error } = await chatService.updateChatSession(sessionId, { title: editTitle.trim() });
        if (!error) {
            setSessions(prev => prev.map(s =>
                s.$id === sessionId ? { ...s, title: editTitle.trim() } : s
            ));
        }
        setEditingId(null);
        setEditTitle('');
    };

    // Cancel editing
    const handleCancelEdit = (e) => {
        e?.stopPropagation();
        setEditingId(null);
        setEditTitle('');
    };

    // Format session timestamps
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffInHours < 48) return 'Yesterday';
        if (diffInHours < 168) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between h-16 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="font-semibold px-4 text-zinc-900 dark:text-zinc-50">
                                Saved Conversations
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1.5 mx-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <X size={18} className="text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-2 h-2 bg-blue-600 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare size={48} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        No saved conversations yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.$id}
                                            onClick={() => handleLoadConversation(session)}
                                            className="group relative p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                                        >
                                            {editingId === session.$id ? (
                                                // Edit mode
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        maxLength={50}
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveEdit(session.$id, e);
                                                            if (e.key === 'Escape') handleCancelEdit(e);
                                                        }}
                                                        className="flex-1 px-2 py-1 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-blue-500 rounded focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={(e) => handleSaveEdit(session.$id, e)}
                                                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded"
                                                    >
                                                        <XIcon size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-start gap-2">
                                                        <MessageSquare size={16} className="mt-1 flex-shrink-0 text-zinc-400" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm max-w-[calc(100%_-_50px)] font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                                {session.title}
                                                            </p>
                                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                                {formatDate(session.$updatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Action Menu */}
                                                    <div
                                                        className="absolute right-2 top-2"
                                                        onClick={(e) => e.stopPropagation()} // Prevent loading chat on menu click
                                                    >
                                                        <div className="relative">
                                                            {/* Three-dot button */}
                                                            <button
                                                                onClick={() =>
                                                                    setMenuOpen((prev) => (prev === session.$id ? null : session.$id))
                                                                }
                                                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                            >
                                                                <MoreVertical size={16} className="text-zinc-600 dark:text-zinc-400" />
                                                            </button>

                                                            {/* Dropdown menu */}
                                                            <AnimatePresence>
                                                                {menuOpen === session.$id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                        transition={{ duration: 0.15 }}
                                                                        className="absolute right-0 mt-1 w-30 bg-white dark:bg-zinc-900 shadow-lg rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50"
                                                                    >
                                                                        <button
                                                                            onClick={(e) => handleStartEdit(session, e)}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                                                                        >
                                                                            <Edit2 size={14} />
                                                                            Rename
                                                                        </button>

                                                                        <button
                                                                            onClick={() => setDeleteTarget(session)}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm dark:text-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-left"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                            Delete
                                                                        </button>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>

                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                                Saved conversations are read-only
                            </p>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={(e) => handleDelete(deleteTarget.$id, e)}
                title="Delete Conversation"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="red" // Red scheme for delete
            />
        </>
    );
};

export default ChatSideBar;
