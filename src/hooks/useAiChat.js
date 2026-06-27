import { useState, useCallback, useRef } from 'react';

const RATE_LIMIT = {
    maxRequests: 25,
    timeWindow: 60000,
    requests: [],
};

export const useAiChat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [streamingText, setStreamingText] = useState('');

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

    const sendMessage = useCallback(async (userMessage) => {
        if (!userMessage || !userMessage.trim()) return;

        if (!checkRateLimit()) {
            throw new Error('Rate limit exceeded. Please wait a moment.');
        }

        const trimmedUserMessage = userMessage.trim();

        // 1. Snapshot the CURRENT stable history before modifying the state array
        let currentHistorySnapshot = [];
        setMessages((prev) => {
            currentHistorySnapshot = [...prev];
            // Instantly append user message to UI view
            return [...prev, { type: 'sent', text: trimmedUserMessage }];
        });

        setLoading(true);
        setError(null);
        setStreamingText('');
        streamingAbortRef.current = false;
        abortControllerRef.current = new AbortController();

        try {
            // 2. Post the existing history array and new message string directly to the Vercel backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: currentHistorySnapshot, 
                    newMessage: trimmedUserMessage  
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `API Server Error: ${response.statusText}`);
            }

            // 3. Process the stream data live
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let accumulatedResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done || streamingAbortRef.current) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    const cleanedLine = line.replace(/^data: /, '').trim();
                    if (!cleanedLine || cleanedLine === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(cleanedLine);
                        const token = parsed.choices[0]?.delta?.content || '';
                        accumulatedResponse += token;

                        // Stream updates smoothly to UI
                        setStreamingText(accumulatedResponse);
                    } catch (e) {
                        // Ignore chunk parsing boundaries split errors cleanly
                    }
                }
            }

            // 4. Commit the finished blocks back to state arrays securely
            if (accumulatedResponse.trim() && !streamingAbortRef.current) {
                setMessages((prev) => [...prev, { type: 'received', text: accumulatedResponse.trim() }]);
            }
            setStreamingText('');
            return accumulatedResponse;

        } catch (err) {
            if (err.name === 'AbortError') {
                setError('Generation stopped');
            } else {
                console.error('AI Chat Error:', err);
                setError(err.message || 'Failed to get response.');
            }
            throw err;
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [checkRateLimit]);

    const clearChat = useCallback(() => {
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
        setMessages,
    };
};