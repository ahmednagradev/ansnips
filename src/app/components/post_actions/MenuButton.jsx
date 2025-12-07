import { useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import ConfirmationModal from "../ConfirmationModal";
import { useNavigate } from "react-router-dom";
import useOutsideClick from "../../../hooks/useOutsideClick";
import { motion } from "framer-motion";

const MenuButton = ({ postId, ownerId, userId, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const menuRef = useRef(null);
    const navigate = useNavigate();

    useOutsideClick(menuRef, () => setMenuOpen(false));

    const handleDeleteConfirm = async () => {
        await onDelete(postId);  // Parent handles actual delete API
        setShowDeleteModal(false);
        setMenuOpen(false);
    };

    return (
        <div className="flex relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>

            {ownerId === userId && (
                <motion.button
                    onClick={() => setMenuOpen((p) => !p)}
                    whileTap={{ scale: 0.9 }}
                    aria-label="More options"
                >
                    <MoreVertical className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" />
                </motion.button>
            )}

            {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 shadow-lg rounded-lg border border-gray-200 dark:border-zinc-700 z-50">
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            navigate(`/postform/${postId}`);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-t-lg transition"
                    >
                        Edit Post
                    </button>

                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            setShowDeleteModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-b-lg transition"
                    >
                        Delete Post
                    </button>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="red"
            />
        </div>
    );
};

export default MenuButton;
