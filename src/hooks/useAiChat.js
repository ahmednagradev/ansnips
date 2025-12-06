import { useState, useCallback, useRef } from 'react';
import config from '../config/config';

const API_KEY = config.geminiApiKey;
const API_URL = config.geminiApiEndpoint;

const RATE_LIMIT = {
    maxRequests: 10,
    timeWindow: 60000,
    requests: [],
};

export const useAiChat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [streamingText, setStreamingText] = useState('');
    const [conversationHistory, setConversationHistory] = useState([]);

    const abortControllerRef = useRef(null);
    const streamingAbortRef = useRef(false);

    const checkRateLimit = useCallback(() => {
        const now = Date.now();
        RATE_LIMIT.requests = RATE_LIMIT.requests.filter(
            (time) => now - time < RATE_LIMIT.timeWindow
        );

        if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests) {
            return false;
        }

        RATE_LIMIT.requests.push(now);
        return true;
    }, []);

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        streamingAbortRef.current = true;
        setLoading(false);
        setStreamingText('');
    }, []);

    const sendMessage = useCallback(
        async (userMessage) => {
            if (!checkRateLimit()) {
                throw new Error('Rate limit exceeded. Please wait a moment.');
            }

            setMessages((prev) => [...prev, { type: 'sent', text: userMessage }]);
            setLoading(true);
            setError(null);
            setStreamingText('');
            streamingAbortRef.current = false;
            abortControllerRef.current = new AbortController();

            try {
                const systemInstruction = {
                    role: 'user',
                    parts: [
                        {
                            text: `You are a helpful assistant. Keep responses concise and to the point. Always wrap code in proper markdown code blocks with language tags (javascript, python, etc.). Use inline code with single backticks only for short variable names or commands within sentences.`,
                        },
                    ],
                };

                const conversationWithInstruction =
                    conversationHistory.length === 0
                        ? [systemInstruction]
                        : conversationHistory;

                const newHistory = [
                    ...conversationWithInstruction,
                    { role: 'user', parts: [{ text: userMessage }] },
                ];

                const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: newHistory }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }

                const data = await response.json();
                const aiResponse = data.candidates[0].content.parts[0].text;

                // Stream word by word
                let displayedText = '';
                const words = aiResponse.split(' ');

                for (let i = 0; i < words.length; i++) {
                    if (streamingAbortRef.current) {
                        if (displayedText.trim()) {
                            setMessages((prev) => [
                                ...prev,
                                { type: 'received', text: displayedText },
                            ]);
                            setConversationHistory([
                                ...conversationWithInstruction,
                                { role: 'user', parts: [{ text: userMessage }] },
                                { role: 'model', parts: [{ text: displayedText }] },
                            ]);
                        }
                        return;
                    }

                    displayedText += (i > 0 ? ' ' : '') + words[i];
                    setStreamingText(displayedText);
                    await new Promise((resolve) => setTimeout(resolve, 20));
                }

                setConversationHistory([
                    ...conversationWithInstruction,
                    { role: 'user', parts: [{ text: userMessage }] },
                    { role: 'model', parts: [{ text: aiResponse }] },
                ]);

                setMessages((prev) => [...prev, { type: 'received', text: aiResponse }]);
                setStreamingText('');

                return aiResponse;
            } catch (error) {
                if (error.name === 'AbortError') {
                    setError('Generation stopped');
                } else {
                    setError(error.message);
                }
                throw error;
            } finally {
                setLoading(false);
                abortControllerRef.current = null;
            }
        },
        [conversationHistory, checkRateLimit]
    );

    const clearChat = useCallback(() => {
        setConversationHistory([]);
        setMessages([]);
        setStreamingText('');
        setError(null);
        setLoading(false);
        streamingAbortRef.current = false;
    }, []);

    return {
        messages,
        loading,
        error,
        streamingText,
        sendMessage,
        clearChat,
        stopGeneration,
        setMessages, // Export for loading saved conversations
    };
};
