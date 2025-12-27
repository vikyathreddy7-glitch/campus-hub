
import React, { useState } from 'react';
import { MarketplaceItem, ItemStatus, ItemType, User } from '../types';
import ItemCard from './ItemCard';
import HistoryView from './HistoryView';

interface LostAndFoundProps {
  items: MarketplaceItem[];
  onUpdateStatus: (itemId: string, status: ItemStatus, recovery?: any) => void;
  onOpenChat: (itemId: string) => void;
  onViewDetail: (itemId: string) => void;
  currentUser: User;
}

const LostAndFound: React.FC<LostAndFoundProps> = ({ items, onUpdateStatus, onOpenChat, onViewDetail, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const matchesSearch = (item: MarketplaceItem) => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase());

  const activeItems = items.filter(item => 
    item.type !== ItemType.MARKETPLACE && 
    item.status === ItemStatus.ACTIVE &&
    matchesSearch(item)
  );

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

  const recoveredItems = items.filter(item => {
    if (item.status !== ItemStatus.RECOVERED || !item.recoveryRecord?.date) return false;
    if (!matchesSearch(item)) return false;
    const recoveryDate = new Date(item.recoveryRecord.date);
    return recoveryDate >= sevenDaysAgo;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-6 pt-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Lost & Found</h1>
          <p className="text-gray-500 text-sm md:text-base">Safe returns within the NITR campus.</p>
        </div>
      </div>

      <div className="px-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search reports by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 shadow-sm transition-all"
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

      <div className="px-6 flex gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border ${
            activeTab === 'active' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-50' 
              : 'bg-white text-gray-400 border-gray-100'
          }`}
        >
          Active ({activeItems.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border ${
            activeTab === 'history' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-50' 
              : 'bg-white text-gray-400 border-gray-100'
          }`}
        >
          Recent Returns ({recoveredItems.length})
        </button>
      </div>

      <div className="px-6">
        {activeTab === 'active' ? (
          <div className="space-y-6">
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-blue-800 text-[10px] md:text-xs flex gap-3 font-bold uppercase tracking-wide">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active reports stay listed until recovered.
            </div>

            {activeItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {activeItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onUpdateStatus={onUpdateStatus}
                    onMessage={() => onOpenChat(item.id)}
                    onViewDetail={() => onViewDetail(item.id)}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  {searchQuery ? '🔎' : '✨'}
                </div>
                <p className="text-gray-500 font-black text-sm uppercase tracking-widest">
                  {searchQuery ? 'No Matching Reports' : 'No Active Reports'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery ? 'Try searching for something else.' : 'Everything seems to be found!'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl text-orange-800 text-[10px] md:text-xs flex gap-3 font-bold uppercase tracking-wide">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Exchange records are kept for only 7 days for community privacy.
            </div>
            <HistoryView items={recoveredItems} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LostAndFound;
