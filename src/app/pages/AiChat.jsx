import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Copy, Check, RotateCcw, Sparkles, Square, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAiChat } from '../../hooks/useAiChat';
import Toast from '../components/Toast';
import SaveChatButton from '../components/SaveChatButton';
import ChatSidebar from '../components/ChatSidebar';
import { useLocation } from 'react-router-dom';

const AiChat = () => {
    const [input, setInput] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [showSideBar, setShowSideBar] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [currentTitle, setCurrentTitle] = useState('');

    // For iframe of this page
    const location = useLocation();
    const isEmbed = new URLSearchParams(location.search).get("embed") === "true";
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const theme = params.get("theme");
        if (theme) {
            if (theme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    }, []);

    const textareaRef = useRef(null);

    const { messages, loading, error, streamingText, sendMessage, clearChat, stopGeneration, setMessages } = useAiChat();

    // Show errors
    useEffect(() => {
        if (error) {
            setNotification({ message: error, type: 'error' });
        }
    }, [error]);

    // Auto-resize textarea
    useEffect(() => {
        textareaRef.current?.focus();
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [input]);

    // Handle message submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || isReadOnly) return;

        try {
            await sendMessage(input);
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            textareaRef.current?.focus();
        } catch (err) {
            setNotification({
                message: err.message || 'Failed to send message',
                type: 'error'
            });
        }
    };

    // Handle save success
    const handleSaveSuccess = (message, type = 'success') => {
        setNotification({ message, type });
    };

    // Load saved conversation (read-only mode)
    const handleLoadConversation = (loadedMessages, title) => {
        setMessages(loadedMessages);
        setCurrentTitle(title);
        setIsReadOnly(true);
        setNotification({
            message: 'Loaded saved conversation (read-only)',
            type: 'info'
        });
    };

    // Clear chat (exit read-only mode)
    const handleClearChat = () => {
        clearChat();
        setIsReadOnly(false);
        setCurrentTitle('');
    };

    // Copy code to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Markdown components
    const MarkdownComponents = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isMultiLine = codeString.includes('\n');
            const shouldRenderBlock = match || isMultiLine;

            if (!inline && shouldRenderBlock) {
                return (
                    <div className="my-4 rounded-xl overflow-hidden border border-zinc-800 dark:border-zinc-700 group max-w-full">
                        <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 dark:bg-zinc-900">
                            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                {match ? match[1] : 'code'}
                            </span>
                            <button
                                onClick={() => copyToClipboard(codeString)}
                                className="transition-colors duration-200 p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
                                title="Copy code"
                            >
                                {copiedCode === codeString ? (
                                    <Check size={14} className="text-green-400" />
                                ) : (
                                    <Copy size={14} className="text-zinc-400" />
                                )}
                            </button>
                        </div>
                        <div className="overflow-x-auto max-w-full">
                            {match ? (
                                <SyntaxHighlighter
                                    language={match[1]}
                                    style={materialDark}
                                    customStyle={{
                                        margin: 0,
                                        padding: '1rem',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.5',
                                        maxWidth: '100%',
                                        overflowX: 'auto',
                                    }}
                                    showLineNumbers={codeString.split('\n').length > 3}
                                    wrapLongLines={false}
                                    className="scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent"
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            ) : (
                                <pre className="bg-zinc-900 dark:bg-black text-zinc-100 p-4 overflow-x-auto text-sm max-w-full">
                                    <code className="whitespace-pre">{codeString}</code>
                                </pre>
                            )}
                        </div>
                    </div>
                );
            }

            return (
                <code
                    className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[14px] bg-zinc-100 dark:bg-zinc-800/70 text-blue-600 dark:text-blue-400 break-words"
                    {...props}
                >
                    {children}
                </code>
            );
        },
        h1: ({ children }) => <h1 className="text-3xl font-bold mt-6 mb-4 text-zinc-900 dark:text-zinc-50">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-semibold mt-5 mb-3 text-zinc-900 dark:text-zinc-50">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-50">{children}</h3>,
        h4: ({ children }) => <h4 className="text-lg font-medium mt-3 mb-2 text-zinc-900 dark:text-zinc-50">{children}</h4>,
        p: ({ children }) => <p className="mb-3 leading-relaxed text-zinc-800 dark:text-zinc-100">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-3 ml-4 space-y-1 text-zinc-800 dark:text-zinc-100">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 ml-4 space-y-1 text-zinc-800 dark:text-zinc-100">{children}</ol>,
        strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-50">{children}</strong>,
        em: ({ children }) => <em className="italic text-zinc-800 dark:text-zinc-200">{children}</em>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 my-3 italic text-zinc-700 dark:text-zinc-300">{children}</blockquote>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-words">{children}</a>,
    };

    return (
        <div className={`flex flex-col ${isEmbed ? "min-h-screen h-full" : "min-h-[calc(100vh-64px)]"}`}>
            {/* Sidebar */}
            <ChatSidebar
                onClick={() => setShowSideBar((prev) => !prev)}
                isOpen={showSideBar}
                onClose={() => setShowSideBar(false)}
                onLoadConversation={handleLoadConversation}
            />

            {/* Top controls */}
            <div className="sticky top-0 px-4 sm:px-6 lg:px-8 pt-6 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => setShowSideBar(true)}
                        disabled={showSideBar}
                        className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:active:scale-100"
                        title="Saved conversations"
                    >
                        <Menu size={16} />
                    </button>

                    <SaveChatButton
                        disabled={messages.length === 0 || isReadOnly}
                        messages={messages}
                        onSaveSuccess={handleSaveSuccess}
                        handleClearChat={handleClearChat}
                    />
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto pt-6 pb-8">
                    {/* Welcome screen */}
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center py-[14vh]"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-400 rounded-2xl shadow-2xl shadow-blue-500/25 mb-4"
                            >
                                <Sparkles size={32} className="text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                                How can I help you today?
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
                                Ask me anything - from coding help to creative writing, I'm here to assist you.
                            </p>
                        </motion.div>
                    )}

                    {/* Messages */}
                    <div className="space-y-4 ">
                        <AnimatePresence mode="popLayout">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex justify-start"
                                >
                                    <div className={message.type === 'sent'
                                        ? 'px-4 py-2 rounded-2xl transition-all duration-300 backdrop-blur-lg shadow-md border select-text bg-gradient-to-br from-blue-400/20 to-blue-600/10 border-blue-300/30 text-gray-900 dark:text-gray-100 rounded-tl-md shadow-blue-200/40 dark:shadow-blue-900/30'
                                        : 'text-zinc-800 dark:text-zinc-200 max-w-full min-w-0'
                                    }>
                                        {message.type === 'sent' ? (
                                            <p className="text-[16px] leading-relaxed whitespace-pre-wrap break-words">
                                                {message.text}
                                            </p>
                                        ) : (
                                            <div className="text-[16px] prose prose-sm dark:prose-invert max-w-full min-w-0 prose-pre:p-0 prose-pre:m-0 overflow-hidden">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                                    {message.text}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Streaming response */}
                        {streamingText && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                                <div className="text-zinc-800 dark:text-zinc-100 max-w-full min-w-0">
                                    <div className="text-[16px] prose prose-sm dark:prose-invert max-w-full min-w-0 prose-pre:p-0 prose-pre:m-0 overflow-hidden">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                            {streamingText}
                                        </ReactMarkdown>
                                        <motion.span
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="inline-block w-0.5 h-5 bg-blue-600 dark:bg-blue-400 ml-1 align-middle"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Loading indicator */}
                        {loading && !streamingText && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="flex gap-1.5 px-5 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl rounded-tl-md">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full"
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                    </div>
                </div>
            </div>

            {/* Input area */}
            <div className="sticky bottom-0 px-4 sm:px-6 lg:px-8 py-2 bg-white dark:bg-black">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-300/50 dark:border-zinc-700/50 hover:border-zinc-400 dark:hover:border-zinc-600 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:ring-blue-500/20 rounded-2xl shadow-xl shadow-zinc-200/30 dark:shadow-zinc-900/30 transition-all duration-200">
                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder={isReadOnly ? currentTitle : "Message AI assistant..."}
                            disabled={loading || isReadOnly}
                            rows={1}
                            className="w-full resize-none bg-transparent px-4 pb-2 pt-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none disabled:opacity-50 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent overscroll-contain"
                        // style={{ minHeight: '43px', maxHeight: '150px' }}
                        />

                        {/* Control buttons */}
                        <div className="px-3 pb-2 flex items-center justify-between">
                            <button
                                onClick={handleClearChat}
                                disabled={loading}
                                title="New chat"
                                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 ease-out disabled:opacity-50 disabled:shadow-none disabled:scale-100"
                            >
                                <RotateCcw size={17} strokeWidth={2} />
                            </button>


                            <p className="flex-1 text-center text-xs text-zinc-400 dark:text-zinc-600 mx-4 select-none">
                                AI can make mistakes. Verify important information.
                            </p>

                            {loading ? (
                                <button
                                    onClick={stopGeneration}
                                    className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white  rounded-lg transition-all duration-200 shadow-md hover:scale-105 active:scale-95"
                                    title="Stop generation"
                                >
                                    <Square size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!input.trim() || isReadOnly}
                                    className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 text-white disabled:text-zinc-500 rounded-lg transition-all duration-200 shadow-md hover:scale-105 active:scale-95 disabled:shadow-none disabled:hover:scale-100"
                                    title="Send message (Enter)"
                                >
                                    <Send size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Toast message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
        </div>
    );
};

export default AiChat;