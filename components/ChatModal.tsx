
import React, { useState, useEffect, useRef } from 'react';
import { Message, User, ChatThread } from '../types';

interface ChatModalProps {
  otherUserId: string;
  otherUser?: ChatThread;
  messages: Message[];
  onClose: () => void;
  onSend: (text: string) => void;
  currentUser: User;
}

const ChatModal: React.FC<ChatModalProps> = ({ otherUser, messages, onClose, onSend, currentUser }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSend(inputText);
    setInputText('');
  };

  const name = otherUser?.otherUserName || 'Chat';
  const roll = otherUser?.otherUserRollNumber || '';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg h-[90vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold overflow-hidden">
               {otherUser?.otherUserAvatar ? <img src={otherUser.otherUserAvatar} className="w-full h-full object-cover" /> : name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-none">{name}</h3>
              <p className="text-[10px] text-blue-500 font-black uppercase mt-1 tracking-wider">{roll}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
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
          ))}
          {/* Invisible element to anchor the scroll */}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
          <input 
            className="flex-grow p-3 bg-gray-100 border-none rounded-2xl text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Type your message..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button type="submit" className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
