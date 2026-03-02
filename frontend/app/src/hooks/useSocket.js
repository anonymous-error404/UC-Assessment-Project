import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8080';

export function useSocket(eventHandlers) {
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });

        // Register event handlers
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            socketRef.current.on(event, handler);
        });

        return () => {
            socketRef.current.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Connect once on mount

    return socketRef;
}
