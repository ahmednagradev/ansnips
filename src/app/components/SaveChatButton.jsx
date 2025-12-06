import { useState } from 'react';
import { Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import chatService from '../../appwrite/chatService';
import { ID } from 'appwrite';

const SaveChatButton = ({ messages, disabled, onSaveSuccess, handleClearChat }) => {
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const userData = useSelector(state => state.userData);

    // Handle save button click
    const handleSaveClick = () => {
        if (messages.length === 0) return;

        // Generate default title from first user message
        const firstUserMessage = messages.find(m => m.type === 'sent');
        const defaultTitle = firstUserMessage
            ? firstUserMessage.text.slice(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '')
            : 'Untitled Conversation';

        setTitle(defaultTitle);
        setShowModal(true);
    };

    // Save conversation to database
    const handleSave = async () => {
        if (!title.trim() || !userData?.$id) return;

        setSaving(true);

        try {
            const sessionId = ID.unique();

            // Save chat session
            const { session, error } = await chatService.createChatSession({
                sessionId,
                userId: userData.$id,
                title: title.trim(),
                chat: JSON.stringify(messages) // Store messages as JSON string
            });

            if (error) {
                throw new Error(error);
            }

            // Success - close modal and notify parent
            setShowModal(false);
            setTitle('');
            onSaveSuccess?.('Conversation saved successfully!');

        } catch (error) {
            onSaveSuccess?.(error.message, 'error');
        } finally {
            handleClearChat();
            setSaving(false);
        }
    };

    return (
        <>
            {/* Save Button */}
            <button
                onClick={handleSaveClick}
                disabled={disabled}
                className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 ease-out disabled:opacity-50 disabled:shadow-none disabled:scale-100"
                title="Save conversation"
            >
                <Save size={16} />
            </button>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !saving && setShowModal(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0"
                        >
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-full max-w-md">
                                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                                    Save Conversation
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                    Give your conversation a name. Saved conversations are read-only.
                                </p>

                                {/* Input */}
                                <input
                                    type="text"
                                    maxLength={50}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !saving) handleSave();
                                        if (e.key === 'Escape') setShowModal(false);
                                    }}
                                    placeholder="Conversation title..."
                                    disabled={saving}
                                    autoFocus
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                />

                                {/* Buttons */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        disabled={saving}
                                        className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!title.trim() || saving}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 text-white disabled:text-zinc-500 rounded-lg transition-all shadow-md disabled:shadow-none"
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default SaveChatButton;