import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {showEmoji && (
        <div className="absolute bottom-full right-0 mb-2">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
      
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje"
            className="flex-1 border-0 focus:ring-0 text-sm"
            disabled={isLoading}
          />
          
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <Smile className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}