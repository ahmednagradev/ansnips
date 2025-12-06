import React from "react";

const PostSkeleton = () => {
    return (
        <div className="mb-6 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm animate-pulse">
            {/* Header */}
            <div className="p-4 pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
                    <div className="flex flex-col gap-1">
                        <div className="w-24 h-3 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Image Section */}
            <div className="w-full h-80 bg-gray-200 dark:bg-zinc-800" />

            {/* Title + Content */}
            <div className="px-4 py-3 space-y-2">
                <div className="w-32 h-3 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                <div className="w-5/6 h-2 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-4 pb-4 pt-1">
                <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                    <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                    <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                </div>
                <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full" />
            </div>
        </div>
    );
};

export default PostSkeleton;
