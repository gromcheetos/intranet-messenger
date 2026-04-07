import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const wsUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/ws`
    : 'http://localhost:8085/hk/ws';

let stompClient: Client | null = null;

export function connectSocket(onConnect?: () => void) {
    if (stompClient?.active) return stompClient;

    stompClient = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 0,
        debug: (msg) => console.log('[STOMP]', msg),
    });

    stompClient.onConnect = () => {
        console.log('Connected to websocket');
        onConnect?.();
    };

    stompClient.onWebSocketError = (event) => {
        console.error('WebSocket error:', event);
    };

    stompClient.onWebSocketClose = (event) => {
        console.log('WebSocket closed:', event);
    };


    stompClient.onStompError = (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        console.error(frame.body);
    };

    stompClient.activate();
    return stompClient;
}

export function disconnectSocket() {
    stompClient?.deactivate();
    stompClient = null;
}

export function subscribeRoom(roomId: string, callback: (message: any) => void
): StompSubscription | null {
    if (!stompClient || !stompClient.connected){
        console.log('subscribeRoom skipped: not connected yet');
        return null;
    }
    console.log('subscribing to room', roomId);
    return stompClient.subscribe(`/topic/chat/room/${roomId}`, (message: IMessage) => {
        console.log('received raw socket message', message.body);
        callback(JSON.parse(message.body));
    });
}

export function sendRoomMessage(roomId: string, content: string) {
    if (!stompClient || !stompClient.connected) return;

    stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ roomId, content }),
    });
}