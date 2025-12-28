
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceItem, ItemStatus, ItemType, User } from '../types';

interface MyListingsProps {
  items: MarketplaceItem[];
  onDelete: (id: string) => Promise<void>;
  onRestore?: (id: string) => Promise<void>;
  onPermanentDelete?: (id: string) => Promise<void>;
  onViewDetail?: (id: string) => void;
  currentUser: User;
}

const MyListings: React.FC<MyListingsProps> = ({ items, onViewDetail }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const activeItems = items.filter(i => i.status === ItemStatus.ACTIVE);
  const historyItems = items.filter(i => 
    i.status === ItemStatus.SOLD || 
    i.status === ItemStatus.RECOVERED
  );

  return (
    <div className="min-h-screen bg-[#FAF9FF] flex flex-col pb-24">
      <header className="px-6 pt-10 pb-6 sticky top-0 bg-[#FAF9FF] z-10">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Listings</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your campus items</p>
          </div>
        </div>

        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('active')} 
            className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeTab === 'active' ? 'bg-[#2D4A8A] text-white shadow-lg' : 'text-gray-400'}`}
          >
            Active ({activeItems.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-[#2D4A8A] text-white shadow-lg' : 'text-gray-400'}`}
          >
            Exchanges ({historyItems.length})
          </button>
        </div>
      </header>

      <div className="px-6 flex-grow space-y-4">
        {activeTab === 'active' ? (
          activeItems.length > 0 ? (
            activeItems.map(item => (
              <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 p-4 shadow-sm flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-grow min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${item.type === ItemType.MARKETPLACE ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                         {item.type}
                       </span>
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Listed {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onViewDetail?.(item.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-50"
                    >
                      Edit Listing
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : <EmptyState icon="📦" message="No active listings" submessage="Items you are selling or searching for will appear here." />
        ) : (
          historyItems.length > 0 ? (
            historyItems.map(item => (
              <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 p-4 shadow-sm flex gap-4 opacity-75">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
                   <img src={item.imageUrl} className="w-full h-full object-cover grayscale" alt="" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white border-2 border-white px-2 py-1 rounded-lg uppercase rotate-[-12deg]">
                        {item.status}
                      </span>
                   </div>
                </div>
                <div className="flex-grow min-w-0 flex flex-col justify-center py-1">
                   <h3 className="font-black text-gray-900 text-sm truncate">{item.title}</h3>
                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                     {item.status === ItemStatus.SOLD ? `Sold for ₹${item.price}` : 'Recovered'}
                   </p>
                </div>
              </div>
            ))
          ) : <EmptyState icon="📂" message="No exchange history" submessage="Successfully sold or recovered items will be listed here." />
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ icon: string, message: string, submessage: string }> = ({ icon, message, submessage }) => (
  <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center px-8">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-6">{icon}</div>
    <h3 className="text-xl font-black text-gray-900 mb-2">{message}</h3>
    <p className="text-sm font-bold text-gray-500 max-w-xs mx-auto">{submessage}</p>
  </div>
);

export default MyListings;
