import { useEffect, useState } from "react";
import userInfoService from "../../appwrite/userInfoService";

/**
 * UsernameDisplay Component
 * Fetches and displays username for a given user ID.
 */

const UsernameDisplay = ({ id, className = "" }) => {
    const [username, setUsername] = useState(<div className="w-16 h-5 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />);

    useEffect(() => {
        if (!id) return;

        const fetchUsername = async () => {
            try {
                const result = await userInfoService.getUsername(id);
                setUsername(result?.username || "Unknown");
            } catch {
                setUsername("Unknown");
            }
        };

        fetchUsername();
    }, [id]);

    return (
        <span className={`font-medium text-gray-900 dark:text-gray-100 ${className}`}>
            {username}
        </span>
    );
};

export default UsernameDisplay;
