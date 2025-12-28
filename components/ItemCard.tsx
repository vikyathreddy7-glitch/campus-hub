
import React, { useState } from 'react';
import { MarketplaceItem, ItemStatus, ItemType, User } from '../types';

interface ItemCardProps {
  item: MarketplaceItem;
  onUpdateStatus: (itemId: string, status: ItemStatus, recovery?: any) => void;
  onMessage: () => void;
  onViewDetail?: () => void;
  currentUser: User;
  onAddToCart?: (item: MarketplaceItem) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onUpdateStatus, onMessage, onViewDetail, currentUser, onAddToCart }) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState({ name: '', rollId: '' });
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const isOwner = item.posterId === currentUser.id;

  const handleSold = () => {
    onUpdateStatus(item.id, ItemStatus.SOLD);
  };

  const handleRecoveredSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (recoveryForm.rollId.length !== 9) {
      setRecoveryError('Roll ID must be 9 characters.');
      return;
    }

    onUpdateStatus(item.id, ItemStatus.RECOVERED, {
      receiverName: recoveryForm.name,
      collegeId: recoveryForm.rollId.toUpperCase(),
      date: new Date().toISOString()
    });
    setIsRecovering(false);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 cursor-pointer" onClick={onViewDetail}>
        <img 
          src={item.imageUrl} 
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm ${
            item.type === ItemType.MARKETPLACE 
              ? 'bg-blue-600 text-white' 
              : item.type === ItemType.LOST 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
          }`}>
            {item.type}
          </span>
          {item.location && (
            <span className="px-3 py-1 bg-black/30 backdrop-blur-md text-white rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-2 h-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {item.location}
            </span>
          )}
        </div>
        {item.type === ItemType.MARKETPLACE && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white">
            <p className="text-xs font-black text-gray-900 tracking-tight">₹{item.price}</p>
          </div>
        )}
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-black text-gray-900 text-base leading-tight mb-1 truncate">{item.title}</h3>
        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">{item.category}</p>
        
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-grow font-medium">
          {item.description}
        </p>

        <div className="flex items-center gap-3 mb-5 pt-4 border-t border-gray-50">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-black border border-blue-100 overflow-hidden">
            {item.posterAvatarUrl ? (
              <img src={item.posterAvatarUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              item.posterName.charAt(0)
            )}
          </div>
          <div className="flex-grow min-w-0">
            <p className="font-bold text-gray-900 text-[11px] truncate leading-none mb-1">{item.posterName}</p>
            <p className="text-gray-400 text-[9px] font-bold uppercase">{item.posterCollegeId}</p>
          </div>
        </div>

        {isRecovering ? (
          <form onSubmit={handleRecoveredSubmit} className="space-y-2 animate-in slide-in-from-bottom-2 duration-200">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Receiver Details</p>
            <input 
              required
              className="w-full text-xs p-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-1 focus:ring-green-200 text-black font-bold"
              placeholder="Full Name"
              value={recoveryForm.name}
              onChange={e => setRecoveryForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="relative">
              <input 
                required
                maxLength={9}
                className={`w-full text-xs p-3 bg-gray-50 border ${recoveryError ? 'border-red-200' : 'border-none'} rounded-xl outline-none focus:ring-1 focus:ring-green-200 uppercase text-black font-bold`}
                placeholder="Roll ID (e.g. 121CS0001)"
                value={recoveryForm.rollId}
                onChange={e => setRecoveryForm(prev => ({ ...prev, rollId: e.target.value.toUpperCase() }))}
              />
              {recoveryError && <p className="text-[8px] font-black text-red-500 uppercase mt-1 ml-1">{recoveryError}</p>}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-600 text-white text-xs py-2.5 rounded-xl font-black shadow-lg shadow-green-100">Complete Exchange</button>
              <button type="button" onClick={() => { setIsRecovering(false); setRecoveryError(null); }} className="px-4 bg-gray-100 text-gray-400 text-xs py-2.5 rounded-xl font-black">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2 mt-auto">
            <button 
              onClick={onViewDetail}
              className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-[#2D4A8A] hover:bg-blue-50 flex items-center justify-center transition-all border border-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </button>
            {isOwner ? (
              <button 
                onClick={item.type === ItemType.MARKETPLACE ? handleSold : () => setIsRecovering(true)}
                className="flex-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-100"
              >
                {item.type === ItemType.MARKETPLACE ? 'Mark Sold' : 'Recovered'}
              </button>
            ) : (
              <button 
                onClick={onMessage}
                className="flex-1 bg-[#2D4A8A] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-[#1a2d55] shadow-lg shadow-blue-50 transition-all flex items-center justify-center gap-2"
              >
                Message
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
