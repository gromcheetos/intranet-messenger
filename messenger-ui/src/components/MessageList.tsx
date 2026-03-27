import { useEffect, useRef } from 'react';
import { Message, User } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);
  const currentUserId = user?.userId;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="flex items-center justify-center my-4">
            <div className="bg-slate-200 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
              {date}
            </div>
          </div>

          {dateMessages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUserId;
            const showAvatar = index === 0 || dateMessages[index - 1].senderId !== message.senderId;
            const senderName = message.member?.memberNm || message.senderId;

            return (
              <div
                key={message.messageId}
                className={`flex gap-3 ${showAvatar ? 'mt-4' : 'mt-1'} ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                {showAvatar ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${
                    isOwnMessage ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-slate-500 to-slate-600'
                  }`}>
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-8 flex-shrink-0"></div>
                )}

                <div className={`flex-1 ${isOwnMessage ? 'flex flex-col items-end' : ''}`}>
                  {showAvatar && (
                    <div className={`flex items-baseline gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      <span className="font-medium text-sm text-gray-900">
                        {senderName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={`inline-block px-4 py-2 rounded-2xl max-w-xl break-words ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-gray-900 rounded-tl-sm'
                  }`}>
                    {message.content}
                  </div>
                  {!showAvatar && (
                    <span className={`text-xs text-gray-400 mt-0.5 ${isOwnMessage ? 'text-right' : ''}`}>
                      {formatTime(message.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
