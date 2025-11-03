import { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserMessageDTO} from "@/lib/definition";

const WS_BASE_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL || "ws://your-default-websocket-url.com";

export const useApiSocket = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const { sendMessage, lastMessage, readyState } = useWebSocket(WS_BASE_URL, {
        shouldReconnect: () => false,
        onOpen: async () => {
            console.log('WebSocket connection established. Authenticating...');
            const token = await AsyncStorage.getItem("user-token");

            if (token) {
                const authMessage: UserMessageDTO = {
                    type: "user_auth",
                    payload: {
                        token: token
                    }
                };
                sendMessage(JSON.stringify(authMessage));
            } else {
                console.warn("No token found, WebSocket cannot authenticate.");
            }
        },
        onClose: () => {
            console.log('WebSocket connection closed.');
            setIsAuthenticated(false);
        },
        onError: (event) => {
            console.error('WebSocket error:', event);
        }
    });

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const data: UserMessageDTO = JSON.parse(lastMessage.data);

                if (data.type === 'auth_success') {
                    console.log('WebSocket authenticated successfully.');
                    setIsAuthenticated(true);
                }

                if (data.type === 'endpoint_state') {
                    console.log('Received endpoint state change:', data.payload);
                }

            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        }
    }, [lastMessage]);

    return {
        sendMessage,
        lastMessage,
        readyState,
        isAuthenticated
    };
};
