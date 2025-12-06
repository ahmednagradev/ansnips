import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from 'appwrite';
import config from '../config/config';
import messageService from '../appwrite/messageService';
import chatRoomService from '../appwrite/chatRoomService';
import bucketService from '../appwrite/bucketService';

/**
 * useConversation Hook
 * Manages real-time chat functionality with Appwrite Realtime
 * Handles messages, chat rooms, and WebSocket connections
 * 
 * @param {string} chatRoomId - ID of the chat room
 * @param {string} currentUserId - ID of the current user
 */
export const useConversation = (chatRoomId, currentUserId) => {
    const [messages, setMessages] = useState([]);
    const [chatRoom, setChatRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    
    const unsubscribeRef = useRef(null);
    const clientRef = useRef(null);
    const MESSAGES_LIMIT = 50;

    /**
     * Initialize Appwrite client for Realtime
     */
    useEffect(() => {
        if (!clientRef.current) {
            clientRef.current = new Client()
                .setEndpoint(config.appwriteEndpoint)
                .setProject(config.appwriteProjectId);
        }
    }, []);

    /**
     * Load initial messages and chat room data
     */
    useEffect(() => {
        if (!chatRoomId || !currentUserId) return;

        const loadInitialData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Load chat room details
                const roomResult = await chatRoomService.getChatRoom(chatRoomId);
                if (roomResult.error) throw new Error(roomResult.error);
                setChatRoom(roomResult.chatRoom);

                // Load messages
                const messagesResult = await messageService.getChatMessages({
                    chatRoomId,
                    limit: MESSAGES_LIMIT,
                    offset: 0
                });

                if (messagesResult.error) throw new Error(messagesResult.error);

                setMessages(messagesResult.messages);
                setHasMore(messagesResult.hasMore);
                setOffset(messagesResult.messages.length);

                // Mark all messages as read
                await messageService.markAllAsRead({ 
                    chatRoomId, 
                    userId: currentUserId 
                });

                // Update chat room unread count
                await chatRoomService.markChatAsRead({ 
                    chatRoomId, 
                    userId: currentUserId 
                });

            } catch (err) {
                console.error("Failed to load chat data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [chatRoomId, currentUserId]);

    /**
     * Subscribe to real-time updates for new messages
     * Uses Appwrite Realtime WebSocket connection
     */
    useEffect(() => {
        if (!chatRoomId || !clientRef.current) return;

        const subscribeToMessages = async () => {
            try {
                // Subscribe to messages collection for this chat room
                const channelName = `databases.${config.appwriteDatabaseId}.collections.${config.appwriteMessagesCollectionId}.documents`;

                unsubscribeRef.current = clientRef.current.subscribe(
                    channelName,
                    (response) => {
                        const payload = response.payload;
                        
                        // Only process messages for this chat room
                        if (payload.chatRoomId !== chatRoomId) return;

                        // Handle different event types
                        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                            // New message created
                            setMessages(prev => {
                                // Prevent duplicates
                                if (prev.some(msg => msg.$id === payload.$id)) {
                                    return prev;
                                }
                                return [...prev, payload];
                            });

                            // Mark as read if not sent by current user
                            if (payload.senderId !== currentUserId) {
                                messageService.markAsRead(payload.$id);
                                chatRoomService.markChatAsRead({ 
                                    chatRoomId, 
                                    userId: currentUserId 
                                });
                            }
                        } else if (response.events.includes('databases.*.collections.*.documents.*.update')) {
                            // Message updated (e.g., marked as read)
                            setMessages(prev => 
                                prev.map(msg => 
                                    msg.$id === payload.$id ? payload : msg
                                )
                            );
                        } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
                            // Message deleted
                            setMessages(prev => 
                                prev.filter(msg => msg.$id !== payload.$id)
                            );
                        }
                    }
                );

            } catch (err) {
                console.error("Failed to subscribe to messages:", err);
                setError("Failed to establish real-time connection");
            }
        };

        subscribeToMessages();

        // Cleanup subscription on unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [chatRoomId, currentUserId]);

    /**
     * Load more messages (pagination)
     */
    const loadMoreMessages = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const result = await messageService.getChatMessages({
                chatRoomId,
                limit: MESSAGES_LIMIT,
                offset
            });

            if (result.error) throw new Error(result.error);

            // Prepend older messages
            setMessages(prev => [...result.messages, ...prev]);
            setHasMore(result.hasMore);
            setOffset(prev => prev + result.messages.length);

        } catch (err) {
            console.error("Failed to load more messages:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [chatRoomId, offset, loading, hasMore]);

    /**
     * Send a new message (text and/or image)
     * @param {string} messageText - Text content of the message
     * @param {File} imageFile - Image file to upload (optional)
     */
    const sendMessage = useCallback(async (messageText, imageFile = null) => {
        if ((!messageText?.trim() && !imageFile) || sending) return;

        setSending(true);
        setError(null);

        try {
            let imageId = null;

            // Upload image if provided
            if (imageFile) {
                const uploadResult = await bucketService.createFile({ file: imageFile });
                if (uploadResult.error) {
                    throw new Error(uploadResult.error);
                }
                imageId = uploadResult.file.$id;
            }

            // Send message
            const result = await messageService.sendMessage({
                chatRoomId,
                senderId: currentUserId,
                message: messageText || "",
                imageId
            });

            if (result.error) {
                // If message failed but image was uploaded, delete the image
                if (imageId) {
                    await bucketService.deleteFile({ fileId: imageId });
                }
                throw new Error(result.error);
            }

            // Update chat room with last message info
            // if (chatRoom) {
            //     await chatRoomService.updateLastMessage({
            //         chatRoomId,
            //         lastMessage: messageText || "📷 Image",
            //         senderId: currentUserId,
            //         participants: chatRoom.participants
            //     });
            // }

            return { success: true };

        } catch (err) {
            console.error("Failed to send message:", err);
            setError(err.message);
            return { error: err.message };
        } finally {
            setSending(false);
        }
    }, [chatRoomId, currentUserId, chatRoom, sending]);

    /**
     * Delete a message
     * @param {string} messageId - ID of the message to delete
     */
    const deleteMessage = useCallback(async (messageId) => {
        try {
            const result = await messageService.deleteMessage({
                messageId,
                userId: currentUserId
            });

            if (result.error) throw new Error(result.error);

            // Optimistically remove from UI (Realtime will sync)
            setMessages(prev => prev.filter(msg => msg.$id !== messageId));

            return { success: true };

        } catch (err) {
            console.error("Failed to delete message:", err);
            setError(err.message);
            return { error: err.message };
        }
    }, [currentUserId]);

    return {
        messages,
        chatRoom,
        loading,
        sending,
        error,
        hasMore,
        sendMessage,
        deleteMessage,
        loadMoreMessages,
        setError
    };
};