import React, {createContext, useContext, useState, useEffect, useCallback, useRef} from 'react';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserMessageDTO} from "@/lib/definition";

const WS_BASE_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL || "ws://your-default-websocket-url.com";

interface MessageHandlers {
    onEndpointStateChange?: (message: UserMessageDTO) => void;
    onAuthSuccess?: (message: UserMessageDTO) => void;
    onAuthFailure?: (message: UserMessageDTO) => void;
}

interface WebSocketContextType {
    sendMessage: (message: string) => void;
    lastMessage: MessageEvent | null;
    readyState: ReadyState;
    isAuthenticated: boolean;
    registerHandlers: (id: string, handlers: MessageHandlers) => void;
    unregisterHandlers: (id: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const handlersRef = useRef<Map<string, MessageHandlers>>(new Map());

    const {sendMessage, lastMessage, readyState} = useWebSocket(WS_BASE_URL, {
        shouldReconnect: () => true,
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

    const registerHandlers = useCallback((id: string, handlers: MessageHandlers) => {
        handlersRef.current.set(id, handlers);
    }, []);

    const unregisterHandlers = useCallback((id: string) => {
        handlersRef.current.delete(id);
    }, []);

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const data: UserMessageDTO = JSON.parse(lastMessage.data);

                if (data.type === 'auth_success') {
                    console.log('WebSocket authenticated successfully.');
                    setIsAuthenticated(true);
                    // Notify all registered handlers
                    handlersRef.current.forEach((handlers) => {
                        if (handlers.onAuthSuccess) {
                            handlers.onAuthSuccess(data);
                        }
                    });
                }

                if (data.type === 'auth_failure') {
                    console.error('WebSocket authentication failed:', data.message);
                    setIsAuthenticated(false);
                    handlersRef.current.forEach((handlers) => {
                        if (handlers.onAuthFailure) {
                            handlers.onAuthFailure(data);
                        }
                    })
                }

                if (data.type === 'endpoint_state') {
                    console.log('Received endpoint state change:', data.payload);
                    // Notify all registered handlers
                    handlersRef.current.forEach((handlers) => {
                        if (handlers.onEndpointStateChange) {
                            handlers.onEndpointStateChange(data);
                        }
                    });
                }
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        }
    }, [lastMessage]);

    return (
        <WebSocketContext.Provider
            value={{
                sendMessage,
                lastMessage,
                readyState,
                isAuthenticated,
                registerHandlers,
                unregisterHandlers
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export const useApiSocket = (handlers?: MessageHandlers) => {
    const context = useContext(WebSocketContext);
    const handlerIdRef = useRef<string>(`handler-${Math.random().toString(36).substring(2, 12)}`);

    if (!context) {
        throw new Error('useApiSocket must be used within a WebSocketProvider');
    }

    useEffect(() => {
        if (handlers) {
            context.registerHandlers(handlerIdRef.current, handlers);
        }

        return () => {
            context.unregisterHandlers(handlerIdRef.current);
        };
    }, [handlers, context]);

    return {
        sendMessage: context.sendMessage,
        lastMessage: context.lastMessage,
        readyState: context.readyState,
        isAuthenticated: context.isAuthenticated
    };
};
