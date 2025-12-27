
import React, { useState } from 'react';
import { MarketplaceItem, ItemStatus, ItemType, User } from '../types';
import { MARKETPLACE_CATEGORIES } from '../constants';
import ItemCard from './ItemCard';
import UploadModal from './UploadModal';

interface MarketplaceProps {
  items: MarketplaceItem[];
  onAddItem: (item: MarketplaceItem) => void;
  onUpdateStatus: (itemId: string, status: ItemStatus) => void;
  onOpenChat: (itemId: string) => void;
  onViewDetail: (itemId: string) => void;
  currentUser: User;
}

const Marketplace: React.FC<MarketplaceProps> = ({ items, onAddItem, onUpdateStatus, onOpenChat, onViewDetail, currentUser }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredItems = items.filter(item => {
    const isCategoryMatch = activeCategory === 'All' || item.category === activeCategory;
    const isSearchMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = item.status === ItemStatus.ACTIVE;
    return isCategoryMatch && isSearchMatch && isActive;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-6 pt-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Marketplace</h1>
          <p className="text-gray-500 text-sm md:text-base">Safe peer-to-peer trading for the NITR community.</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 text-sm md:text-base active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Post Listing
        </button>
      </div>

      <div className="px-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search items by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 shadow-sm transition-all"
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

      <div className="flex overflow-x-auto pb-4 -mx-4 px-10 md:mx-0 md:px-0 scrollbar-hide space-x-2">
        {MARKETPLACE_CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-xs md:text-sm font-bold transition-all border ${
              activeCategory === category
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-50'
                : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 min-h-[200px]">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onUpdateStatus={onUpdateStatus}
              onMessage={() => onOpenChat(item.id)}
              onViewDetail={() => onViewDetail(item.id)}
              currentUser={currentUser}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm opacity-60">
            <p className="text-4xl mb-2">🔍</p>
            <p className="font-black text-gray-900 uppercase tracking-widest text-sm">No items found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or category.</p>
          </div>
        )}
      </div>

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)}
          onAdd={onAddItem}
          type={ItemType.MARKETPLACE}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default Marketplace;
