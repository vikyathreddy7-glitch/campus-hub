
import React, { useState } from 'react';
import { MarketplaceItem, Message, User } from '../types';

interface ChatModalProps {
  itemId: string;
  item: MarketplaceItem;
  messages: Message[];
  onClose: () => void;
  onSend: (itemId: string, text: string) => void;
  currentUser: User;
}

const ChatModal: React.FC<ChatModalProps> = ({ item, messages, onClose, onSend, currentUser }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSend(item.id, inputText);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg h-[90vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img src={item.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
            <div>
              <h3 className="font-bold text-gray-900 leading-none">{item.posterName}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">Item: {item.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Start a conversation</h4>
              <p className="text-sm text-gray-500">Ask about availability, location for pickup, or negotiate price.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                  msg.senderId === currentUser.id 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
          <input 
            className="flex-grow p-3 bg-gray-100 border-none rounded-2xl text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Type your message..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button 
            type="submit"
            className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-100 transition-all flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
