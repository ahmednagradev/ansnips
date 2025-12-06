import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Client } from 'appwrite';
import config from '../config/config';

export const useRealtime = () => {
    const userData = useSelector((state) => state.userData);
    const clientRef = useRef(null);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        if (!userData?.$id) {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            return;
        }

        if (!clientRef.current) {
            clientRef.current = new Client()
                .setEndpoint(config.appwriteEndpoint)
                .setProject(config.appwriteProjectId);
        }

        const initConnection = async () => {
            try {
                const channel = `databases.${config.appwriteDatabaseId}.collections.${config.appwriteChatRoomsCollectionId}.documents`;

                // if (!unsubscribeRef.current) {
                    unsubscribeRef.current = clientRef.current.subscribe(channel, (response) => {
                        // Handle realtime updates
                    });
                // }

            } catch (error) {
                console.error('Realtime error:', error);
            }
        };

        initConnection();

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [userData?.$id]);

    return { client: clientRef.current };
};