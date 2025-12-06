import { useLocation } from "react-router-dom";
import { useState } from "react";
import AiChatIframe from "../components/AiChatIframe";
import { Sparkles } from "lucide-react";

const Container = ({ children, isEmbed }) => {
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const location = useLocation();

    // Show AI assistant button on following pages
    const assistantButtonPages = ['/profile', '/post', '/postform', '/settings']

    const shouldShowAssistantButton = assistantButtonPages.some((page) =>
        location.pathname.startsWith(page)
    )

    return (
        <section className="relative min-h-screen flex flex-col bg-white dark:bg-black">
            <div className="relative flex-grow flex flex-col">
                {!isAssistantOpen && shouldShowAssistantButton && (
                    <button
                        type="button"
                        title="Open ai assistant"
                        onClick={() => setIsAssistantOpen(true)}
                        className="fixed bottom-5 right-5 z-40 text-sm font-semibold p-1.5 bg-zinc-200 text-blue-600 dark:bg-zinc-900 dark:text-blue-400 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-lg hover:scale-115 transition-all duration-200"
                    >
                        <Sparkles size={16} />
                    </button>
                )}

                <main className={`flex-grow w-full ${isEmbed ? "pt-0" : "pt-18 md:pt-16"}`}>
                    {children}
                </main>
            </div>

            <AiChatIframe
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
            />
        </section>
    );
};

export default Container;
