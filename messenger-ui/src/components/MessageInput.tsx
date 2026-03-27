import { useState } from 'react';
import { Send } from 'lucide-react';
import { apiClient } from '../lib/api';
import { sendRoomMessage } from '../lib/chatSocket';

interface MessageInputProps {
  roomId: string;
  onMessageSent?: () => void;
}

export default function MessageInput({ roomId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      setSending(true);
      sendRoomMessage(roomId, content.trim());
      setContent('');
      onMessageSent?.();

    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          style={{ minHeight: '42px', maxHeight: '120px' }}/>
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
