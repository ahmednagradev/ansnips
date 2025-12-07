import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import DarkModeButton from "./DarkModeButton";
// import LogoutButton from "./LogoutButton";
import { useSelector } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import ChatButton from "./ChatButton";
import NotificationButton from "./NotificationButton";
import ProfileAvatar from "./ProfileAvatar";  // For chat page
import userInfoService from "../../appwrite/userInfoService";
import { useConversation } from "../../hooks/useConversation";

const Navbar = () => {
    const [otherUserName, setOtherUserName] = useState("");
    const [otherUserUsername, setOtherUserUsername] = useState("");
    const [otherUserId, setOtherUserId] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const authStatus = useSelector((state) => state?.authStatus);
    const userData = useSelector((state) => state?.userData);
    const location = useLocation();
    const navigate = useNavigate();

    // Detect chat route only once per navigation
    const pathname = location.pathname;
    const isChatPage = pathname.startsWith("/chat/");
    const chatRoomId = isChatPage ? pathname.split("/chat/")[1] : null;

    // Fetch chatRoom only when chatRoomId is valid
    const { chatRoom } = useConversation(chatRoomId, userData?.$id);

    // Get userId and name for chat
    useEffect(() => {
        if (!isChatPage) return;
        if (!chatRoom) return;
        // Find other participant
        const otherId = chatRoom.participants?.find(
            (id) => id !== userData?.$id
        );
        if (!otherId) return;
        // Update only when needed
        setOtherUserId(otherId);

        userInfoService.getUserInfo(otherId).then(({ userInfo }) => {
            setOtherUserName(userInfo?.name || "Unknown");
            setOtherUserUsername(userInfo?.username || "@unknown");
        });
    }, [isChatPage, chatRoom]);


    // const navItems = [
    //     { name: "Discover", href: "/home", active: authStatus },
    //     { name: "Profile", href: `/profile/${username}`, active: authStatus },
    //     { name: "Assistant", href: "/assistant", active: authStatus },
    // ];

    // Handle scroll behavior to show/hide navbar
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsVisible(lastScrollY > currentScrollY || currentScrollY < 100);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMenuOpen && !e.target.closest('nav')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    // Load the name of other user

    return (
        <header>
            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: isVisible ? 0 : -100 }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-gray-50/80 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* LEFT SIDE — Dynamic */}
                        {isChatPage ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate("/chat")}
                                    className="py-2 pr-1 md:pr-2 hover:scale-110 transition-all"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                </button>

                                <ProfileAvatar profileId={otherUserId} size="md" />

                                <div>
                                    <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                                        {otherUserName}
                                    </h2>

                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                        @{otherUserUsername}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <NavLink to="/home" className="flex items-center">
                                <h2
                                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent select-none"
                                >
                                    ansnips
                                </h2>
                            </NavLink>
                        )}

                        {/* Desktop Links */}
                        <div className="hidden md:flex space-x-7">
                            {/* {navItems.map(
                                (item) =>
                                    item.active && (
                                        <NavLink
                                            key={item.name}
                                            to={item.href}
                                            className={({ isActive }) =>
                                                `relative text-[15px] font-medium transition-colors ${isActive
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    {item.name}
                                                    {isActive && (
                                                        <motion.span
                                                            layoutId="navbar-underline"
                                                            className="absolute bottom-[-6px] left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    )
                            )} */}
                        </div>

                        {/* Right buttons */}
                        <div className="flex items-center gap-4">
                            {authStatus && !isChatPage && <ChatButton />}
                            {authStatus && !isChatPage && <NotificationButton />}

                            <DarkModeButton />
                            {/* {authStatus && (
                                <LogoutButton className="hidden md:block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-300 transform hover:-translate-y-0.5" />
                            )}
                            {authStatus && (
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                                >
                                    <Menu size={22} />
                                </button>
                            )} */}
                        </div>
                    </div>
                </div>

                {/* <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden border-t border-gray-200 dark:border-zinc-800 overflow-hidden"
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navItems.map((item) => (
                                    item.active && (
                                        <NavLink
                                            to={item.href}
                                            key={item.name}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={({ isActive }) =>
                                                `block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${isActive
                                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800"
                                                }`
                                            }
                                        >
                                            {item.name}
                                        </NavLink>
                                    )
                                ))}
                                {authStatus && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="border-t border-gray-200 dark:border-zinc-800 pt-4 mt-4"
                                    >
                                        <LogoutButton className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white rounded-md text-base font-medium transition-all duration-300" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence> */}
            </motion.nav>
        </header>
    );
};

export default Navbar;