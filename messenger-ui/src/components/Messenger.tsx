import { useState, useEffect, useRef } from 'react';
import { Hash, Users } from 'lucide-react';
import { apiClient, Message, ChatRoom, User} from '../lib/api';
import ChannelList from './Rooms';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';
import ChannelMembers from './Members';
import { connectSocket, disconnectSocket, subscribeRoom } from '../lib/chatSocket';

export default function Messenger() {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [showOnlineUsers, setShowOnlineUsers] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showChannelMembers, setShowChannelMembers] = useState(false);
    const subscriptionRef = useRef<any>(null);
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        connectSocket(() => {
            setSocketConnected(true);
        });

        return () => {
            disconnectSocket();
            setSocketConnected(false);
        };
    }, []);

    useEffect(() => {
        if (!selectedRoom || !socketConnected) return;

        loadChannel();
        loadMessages();
        loadOnlineUsers();

        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
        }

        subscriptionRef.current = subscribeRoom(selectedRoom, (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
        });

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        };
    }, [selectedRoom, socketConnected]);

    const loadChannel = async () => {
        if (!selectedRoom) return;

        try {
            const response = await apiClient.getChatRooms();
            const channel = response.data?.find(c => c.roomId === selectedRoom);
            if (channel) {
                setCurrentRoom(channel);
            }
        } catch (error) {
            console.error('Failed to load channel:', error);
        }
    };

    const loadMessages = async () => {
        if (!selectedRoom) return;

        setLoadingMessages(true);
        try {
            const message = await apiClient.getMessages(selectedRoom);

            if (message.length > 0) {

                setMessages(message);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const loadOnlineUsers = async () => {
        try {
            const users = await apiClient.getOnlineUsers();
            setOnlineUsers(users);
        } catch (error) {
            console.error('Failed to load online users:', error);
        }
    };

    const handleMessageSent = () => {
        loadMessages();
    };

    return (
        <div className="flex h-screen bg-white">
            <ChannelList
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}/>
            <div className="flex-1 flex flex-col">
                {currentRoom ? (
                    <>
                        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                                <Hash className="w-5 h-5 text-gray-600" />
                                <div>
                                    <h1 className="font-semibold text-lg text-gray-900">
                                        {currentRoom.title}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowChannelMembers(true)}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    title="Channel members">
                                    <Users className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    title="Online users">
                                    <Users className="w-5 h-5" />
                                    <span className="text-sm font-medium">{onlineUsers.length} online</span>
                                </button>
                            </div>
                        </div>

                        <MessageList messages={messages} />
                        {selectedRoom && (
                            <MessageInput roomId={selectedRoom} onMessageSent={handleMessageSent} />
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <Hash className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>Select a channel to start messaging</p>
                        </div>
                    </div>
                )}
            </div>

            {showOnlineUsers && (
                <OnlineUsers users={onlineUsers} onClose={() => setShowOnlineUsers(false)} />
            )}

            {showChannelMembers && selectedRoom && (
                <ChannelMembers
                    roomId={selectedRoom}
                    onClose={() => setShowChannelMembers(false)}/>
            )}
        </div>
    );
}
