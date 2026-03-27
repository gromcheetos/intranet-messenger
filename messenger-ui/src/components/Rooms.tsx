import { useEffect, useState } from 'react';
import { Hash, Plus, LogOut, MoreVertical, CreditCard as Edit2, Trash2, X, Check } from 'lucide-react';
import { apiClient, ChatRoom, PageInfo } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface ChannelListProps {
    selectedRoom: string | null;
    onSelectRoom: (roomId: string) => void;
}

export default function ChannelList({ selectedRoom, onSelectRoom }: ChannelListProps) {
    const [channels, setChannels] = useState<ChatRoom[]>([]);
    const [page, setPage] = useState<PageInfo | null>(null);
    const [showNewChannel, setShowNewChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [loading, setLoading] = useState(false);
    const { signOut, user } = useAuth();
    const [searchValue, setSearchValue] = useState<string>("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadChannels();
    }, []);

    const loadChannels = async () => {
        try {
            const response = await apiClient.getChatRooms();
            if (response.data) {
                setChannels(response.data);
                if (response.data.length > 0 && !selectedRoom) {
                    onSelectRoom(response.data[0].roomId);
                }
            }
        } catch (error) {
            console.error('Failed to load channels:', error);
        }
    };

    const handleCreateChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelName.trim() || loading) return;

        setLoading(true);
        try {
            const newRoom = await apiClient.createChatRoom(
                newChannelName.trim());
            setChannels([...channels, newRoom]);
            setNewChannelName('');
            setShowNewChannel(false);
            onSelectRoom(newRoom.roomId);
        } catch (error) {
            console.error('Failed to create channel:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleStartEdit = (channel: ChatRoom) => {
        setEditingId(channel.roomId);
        setEditName(channel.title);
        setOpenMenuId(null);
    };

    const handleSaveEdit = async (channelId: string) => {
        if (!editName.trim()) return;

        try {
            const updated = await apiClient.updateChatRoom(channelId, editName.trim());
            setChannels(channels.map(c => c.roomId === channelId ? updated : c));
            setEditingId(null);
            setEditName('');
            await loadChannels();
        } catch (error) {
            console.error('Failed to update channel:', error);
        }
    };

    const handleDeleteChannel = async (channelId: string) => {
        if (!window.confirm('Are you sure you want to delete this channel?')) return;

        try {
            await apiClient.deleteChatRoom(channelId);
            const remaining = channels.filter(c => c.roomId !== channelId);
            setChannels(remaining);
            setOpenMenuId(null);
            if (selectedRoom === channelId && remaining.length > 0) {
                onSelectRoom(remaining[0].roomId);
            }
        } catch (error) {
            console.error('Failed to delete channel:', error);
        }
    };

    return (
        <div className="w-64 bg-slate-800 flex flex-col h-full">
            <div className="p-4 border-b border-slate-700">
                <h2 className="text-white font-bold text-lg">Channels</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {channels.map((channel) => (
                        <div key={channel.roomId} className="relative group">
                            {editingId === channel.roomId ? (
                                <div className="px-2 py-2 bg-slate-700 rounded-lg space-y-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-2 py-1 bg-slate-600 text-white text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Channel name"
                                        autoFocus/>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleSaveEdit(channel.roomId)}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition">
                                            <Check className="w-3 h-3" />
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition">
                                            <X className="w-3 h-3" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => onSelectRoom(channel.roomId)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition ${
                                            selectedRoom === channel.roomId
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                        }`}>
                                        <Hash className="w-4 h-4" />
                                        <span className="truncate">{channel.title}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === channel.roomId ? null : channel.roomId);
                                            }}
                                            className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </button>
                                    {openMenuId === channel.roomId && (
                                        <div className="absolute right-0 top-full mt-1 bg-slate-700 rounded-lg shadow-lg z-10 min-w-max">
                                            <button
                                                onClick={() => handleStartEdit(channel)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-600 transition text-sm rounded-t-lg">
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteChannel(channel.roomId)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-600 transition text-sm rounded-b-lg">
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {showNewChannel ? (
                    <form onSubmit={handleCreateChannel} className="p-3 bg-slate-700 m-2 rounded-lg">
                        <input
                            type="text"
                            placeholder="Channel name"
                            value={newChannelName}
                            onChange={(e) => setNewChannelName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-600 text-white rounded mb-2 outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus/>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewChannel(false)}
                                className="flex-1 bg-slate-600 text-white px-3 py-1.5 rounded text-sm hover:bg-slate-500">
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setShowNewChannel(true)}
                        className="w-full flex items-center gap-2 px-5 py-2 text-slate-300 hover:text-white transition">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">New Channel</span>
                    </button>
                )}
            </div>

            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user?.userId.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">{user?.userId}</div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-slate-400">Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                        title="Sign out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
