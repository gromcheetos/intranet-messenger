import { X } from 'lucide-react';
import { User } from '../lib/api';

interface OnlineUsersProps {
  users: User[];
  onClose: () => void;
}

export default function OnlineUsers({ users, onClose }: OnlineUsersProps) {
  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        <h2 className="font-semibold text-gray-900">Online Users</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.userNm.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {user.userId}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
