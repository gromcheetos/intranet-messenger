import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { apiClient, ChannelMember } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface ChannelMembersProps {
    roomId: string;
    onClose: () => void;
}

export default function ChannelMembers({ roomId, onClose }: ChannelMembersProps) {
    const [members, setMembers] = useState<ChannelMember[]>([]);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteUsername, setInviteUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        loadMembers();
    }, [roomId]);

    const loadMembers = async () => {
        try {
            const memberList = await apiClient.getChannelMembers(roomId);
            setMembers(memberList);
            setError('');
        } catch (err) {
            setError('Failed to load members');
            console.error('Failed to load members:', err);
        }
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteUsername.trim() || loading) return;

        setLoading(true);
        setError('');

        try {
            const newMember = await apiClient.inviteUserToChannel(roomId, inviteUsername.trim());
            setMembers([...members, newMember]);
            setInviteUsername('');
            setShowInviteForm(false);
        } catch (err) {
            setError('Failed to invite user. User may not exist or already in channel.');
            console.error('Failed to invite user:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string, username: string) => {
        if (!window.confirm(`Remove ${username} from channel?`)) return;

        try {
            await apiClient.removeUserFromChannel(roomId, userId);
            setMembers(members.filter(m => m.userId !== userId));
            setError('');
        } catch (err) {
            setError('Failed to remove member');
            console.error('Failed to remove member:', err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Channel Members</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {members.length > 0 ? (
                            members.map((member) => (
                                <div
                                    key={member.userId}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{member.memberNm || member.userId }</p>
                                        <p className="text-xs text-gray-500">
                                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {user?.userId !== member.userId && (
                                        <button
                                            onClick={() => handleRemoveMember(member.userId, member.memberNm)}
                                            className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded transition"
                                            title="Remove member">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">No members yet</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 p-4">
                    {showInviteForm ? (
                        <form onSubmit={handleInviteUser} className="space-y-2">
                            <input
                                type="text"
                                placeholder="Enter username to invite"
                                value={inviteUsername}
                                onChange={(e) => setInviteUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus/>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50">
                                    Invite
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowInviteForm(false)}
                                    className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-medium rounded-lg transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowInviteForm(true)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
                            <UserPlus className="w-4 h-4" />
                            Invite Member
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
