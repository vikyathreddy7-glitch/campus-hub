
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceItem, ItemStatus, ItemType } from '../types';

interface MyListingsProps {
  items: MarketplaceItem[];
  onDelete: (id: string) => Promise<void>;
}

const MyListings: React.FC<MyListingsProps> = ({ items, onDelete }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const activeItems = items.filter(i => i.status === ItemStatus.ACTIVE);
  const historyItems = items.filter(i => i.status === ItemStatus.SOLD || i.status === ItemStatus.RECOVERED);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently remove this listing from everywhere?')) return;
    setIsDeleting(id);
    try {
      await onDelete(id);
    } catch (err) {
      alert('Failed to remove listing. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] flex flex-col pb-24">
      <header className="px-6 pt-10 pb-6 sticky top-0 bg-[#FAF9FF] z-10">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Listings</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your campus items</p>
          </div>
        </div>

        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'active' ? 'bg-[#2D4A8A] text-white shadow-lg' : 'text-gray-400'
            }`}
          >
            Active ({activeItems.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-[#2D4A8A] text-white shadow-lg' : 'text-gray-400'
            }`}
          >
            History ({historyItems.length})
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
                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                         item.type === ItemType.MARKETPLACE ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                       }`}>
                         {item.type}
                       </span>
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Listed {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting === item.id}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isDeleting === item.id ? (
                      <div className="w-3 h-3 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    Remove Listing
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon="📦" message="No active listings" submessage="Items you are selling or searching for will appear here." />
          )
        ) : (
          historyItems.length > 0 ? (
            historyItems.map(item => (
              <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 p-4 shadow-sm flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
                   <img src={item.imageUrl} className="w-full h-full object-cover grayscale" alt="" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white border-2 border-white px-2 py-1 rounded-lg uppercase rotate-[-12deg]">
                        {item.status}
                      </span>
                   </div>
                </div>
                <div className="flex-grow min-w-0 flex flex-col justify-between py-1">
                   <div>
                     <h3 className="font-black text-gray-900 text-sm truncate">{item.title}</h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                       {item.status === ItemStatus.SOLD ? `Sold for ₹${item.price}` : `Recovered at ${item.recoveryRecord?.location || 'Campus'}`}
                     </p>
                   </div>
                   <button 
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting === item.id}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-400 text-[10px] font-black uppercase py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                   >
                    {isDeleting === item.id ? (
                      <div className="w-3 h-3 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                    ) : (
                      'Wipe Record'
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon="📂" message="No history yet" submessage="Successfully sold or recovered items will be listed here." />
          )
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ icon: string, message: string, submessage: string }> = ({ icon, message, submessage }) => (
  <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center px-8">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-black text-gray-900 mb-2">{message}</h3>
    <p className="text-sm font-bold text-gray-500 max-w-xs mx-auto">{submessage}</p>
  </div>
);

export default MyListings;
