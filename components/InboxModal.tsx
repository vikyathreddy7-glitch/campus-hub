
import React, { useState, useMemo } from 'react';
import { ChatThread } from '../types';

interface InboxModalProps {
  threads: ChatThread[];
  onClose: () => void;
  onSelectThread: (itemId: string) => void;
}

const InboxModal: React.FC<InboxModalProps> = ({ threads, onClose, onSelectThread }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const query = searchQuery.toLowerCase();
    return threads.filter(thread => {
      const lastMsg = thread.messages[0];
      return (
        thread.itemTitle.toLowerCase().includes(query) ||
        lastMsg.senderName.toLowerCase().includes(query)
      );
    });
  }, [threads, searchQuery]);

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl h-[90vh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Messages</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Campus Inbox</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* New Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by item or sender..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto bg-gray-50/30">
          {filteredThreads.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredThreads.map(thread => {
                const lastMsg = thread.messages[0];
                const lastDate = new Date(lastMsg.timestamp);
                const timeString = lastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <button 
                    key={thread.itemId}
                    onClick={() => onSelectThread(thread.itemId)}
                    className="w-full p-6 flex gap-4 hover:bg-white transition-colors text-left group"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                        {thread.itemImageUrl ? (
                          <img src={thread.itemImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-blue-600 border-2 border-white flex items-center justify-center shadow-sm">
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                         </svg>
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-gray-900 truncate tracking-tight">{thread.itemTitle}</h4>
                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">{timeString}</span>
                      </div>
                      <p className="text-xs font-bold text-blue-600 mb-1">{lastMsg.senderName}</p>
                      <p className="text-sm text-gray-500 line-clamp-1 leading-snug">{lastMsg.text}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-6">
                {searchQuery ? '🔎' : '💬'}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                {searchQuery ? 'No Results' : 'Inbox is Empty'}
              </h3>
              <p className="text-sm font-bold text-gray-500 max-w-xs mx-auto">
                {searchQuery 
                  ? `No conversations found for "${searchQuery}".`
                  : 'When you message sellers or finders, your conversations will appear here.'}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white border-t border-gray-100">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
             Only verified NITR community members can message you.
           </p>
        </div>
      </div>
    </div>
  );
};

export default InboxModal;
