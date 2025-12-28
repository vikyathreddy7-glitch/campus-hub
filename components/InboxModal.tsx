
import React, { useState, useMemo } from 'react';
import { ChatThread } from '../types';

interface InboxModalProps {
  threads: ChatThread[];
  onClose: () => void;
  onSelectThread: (otherUserId: string) => void;
}

const InboxModal: React.FC<InboxModalProps> = ({ threads, onClose, onSelectThread }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const query = searchQuery.toLowerCase();
    return threads.filter(thread => 
      thread.otherUserName.toLowerCase().includes(query) ||
      thread.otherUserRollNumber.toLowerCase().includes(query)
    );
  }, [threads, searchQuery]);

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl h-[90vh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Direct Messages</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Campus Community Chat</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-black focus:outline-none transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto bg-gray-50/30">
          {filteredThreads.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredThreads.map(thread => {
                const lastMsg = thread.messages[thread.messages.length - 1];
                const lastDate = new Date(lastMsg.timestamp);
                return (
                  <button 
                    key={thread.otherUserId}
                    onClick={() => onSelectThread(thread.otherUserId)}
                    className="w-full p-6 flex gap-4 hover:bg-white transition-colors text-left"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#5B7CB8] flex items-center justify-center text-white font-black text-xl border border-blue-100 flex-shrink-0 overflow-hidden shadow-sm">
                      {thread.otherUserAvatar ? <img src={thread.otherUserAvatar} className="w-full h-full object-cover" /> : thread.otherUserName.charAt(0)}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-black text-gray-900 truncate tracking-tight text-base">{thread.otherUserName}</h4>
                        <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap ml-2 bg-gray-100 px-2 py-1 rounded-md">
                          {lastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-widest">{thread.otherUserRollNumber}</p>
                      <p className="text-sm text-gray-500 line-clamp-1 leading-snug font-medium">
                        {lastMsg.senderId === thread.otherUserId ? '' : 'You: '}{lastMsg.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
              <span className="text-5xl mb-6">💬</span>
              <h3 className="text-xl font-black text-gray-900 mb-2">No conversations</h3>
              <p className="text-sm font-bold text-gray-500">Search for items in the market and message students to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxModal;
