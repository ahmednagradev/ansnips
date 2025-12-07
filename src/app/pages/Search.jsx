import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, Clock, TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import userInfoService from "../../appwrite/userInfoService";
import ProfileAvatar from "../components/ProfileAvatar";

/**
 * Search Page - Instagram Style
 * Features: Recent searches, real-time search, trending (optional)
 * Stores recent searches in localStorage
 */
const Search = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [id, setId] = useState("")

    const RECENT_SEARCHES_KEY = "recent_searches";
    const MAX_RECENT = 10;

    // Load all users and recent searches on mount
    useEffect(() => {
        loadAllUsers();
        loadRecentSearches();
    }, []);

    // Load all users for search
    const loadAllUsers = async () => {
        try {
            const { usernames, error } = await userInfoService.getAllUsernames();
            if (!error) {
                setAllUsers(usernames);
            }
        } catch (error) {
            console.error("Failed to load users:", error);
        }
    };

    // Load recent searches from localStorage
    const loadRecentSearches = () => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Failed to load recent searches:", error);
        }
    };

    // Save to recent searches
    const addToRecentSearches = (user) => {
        try {
            const updated = [
                user,
                ...recentSearches.filter(item => item.$id !== user.$id)
            ].slice(0, MAX_RECENT);

            setRecentSearches(updated);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error("Failed to save recent search:", error);
        }
    };

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    };

    // Remove single recent search
    const removeRecentSearch = (userId) => {
        const updated = recentSearches.filter(item => item.$id !== userId);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    };

    // Perform search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(() => {
            const filtered = allUsers.filter(user =>
                user.username.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, allUsers]);

    // Navigate to profile
    const handleSelectUser = (user) => {
        addToRecentSearches(user);
        navigate(`/profile/${user.username}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Header with Search Bar */}
                <div className="sticky top-0 bg-gray-50 dark:bg-zinc-950 pb-4 z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <div className="flex-1 relative">
                            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search users..."
                                autoFocus
                                className="w-full pl-12 pr-10 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white placeholder-gray-500 transition-all duration-300"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                >
                                    {isSearching ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    ) : (
                                        <X className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Results */}
                {query ? (
                    <div className="space-y-2">
                        {results.length === 0 ? (
                            <div className="text-center py-36">
                                <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    {isSearching ? "Searching..." : "No results found"}
                                </p>
                            </div>
                        ) : (
                            results.map((user) => (
                                <motion.button
                                    key={user.$id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleSelectUser(user)}
                                    className="w-full flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-800"
                                >
                                    <ProfileAvatar
                                        profileId={user?.$id}
                                        size="md"
                                    />
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {user.username}
                                        </p>
                                        {user.bio && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 w-full line-clamp-1">
                                                {user.bio}
                                            </p>
                                        )}
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </div>
                ) : (
                    /* Recent Searches */
                    <div>
                        {recentSearches.length > 0 && (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Recent
                                    </h2>
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                    >
                                        Clear all
                                    </button>
                                </div>

                                <div className="space-y-2 mb-8">
                                    <AnimatePresence>
                                        {recentSearches.map((user) => (
                                            <motion.div
                                                key={user.$id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800"
                                            >
                                                <button
                                                    onClick={() => handleSelectUser(user)}
                                                    className="flex-1 flex items-center gap-3 text-left"
                                                >
                                                    <ProfileAvatar
                                                        profileId={user?.$id}
                                                        size="md"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {user.username}
                                                        </p>
                                                        {user.bio && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 w-full line-clamp-1">
                                                                {user.bio}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => removeRecentSearch(user.$id)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}

                        {/* Empty State */}
                        {recentSearches.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-40"
                            >
                                
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Search for users
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Find people by their username
                                </p>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;