
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

const ItemCard: React.FC<ItemCardProps> = ({ item, onUpdateStatus, onMessage, onViewDetail, currentUser }) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState({ name: '', rollId: '' });
  const isOwner = item.posterId === currentUser.id;

  return (
    <div className="bg-white rounded-[2.5rem] border border-indigo-50/50 overflow-hidden premium-shadow group hover:translate-y-[-4px] transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={onViewDetail}>
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em] shadow-xl backdrop-blur-md border border-white/30 text-white ${
            item.type === ItemType.MARKETPLACE ? 'bg-indigo-600/80' : 'bg-rose-500/80'
          }`}>
            {item.type}
          </span>
        </div>

        {item.type === ItemType.MARKETPLACE && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white">
            <p className="text-[13px] font-black text-slate-900 tracking-tighter">₹{item.price}</p>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-black text-slate-800 text-base leading-tight truncate mb-1">{item.title}</h3>
        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-5">{item.category}</p>
        
        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px] overflow-hidden border border-indigo-100">
            {item.posterAvatarUrl ? <img src={item.posterAvatarUrl} className="w-full h-full object-cover" /> : item.posterName.charAt(0)}
          </div>
          <div className="flex-grow min-w-0">
            <p className="font-black text-slate-700 text-[10px] truncate leading-none mb-1">{item.posterName}</p>
            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-tight">{item.posterCollegeId}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onViewDetail} className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center transition-all border border-indigo-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <button 
            onClick={isOwner ? () => onUpdateStatus(item.id, ItemStatus.SOLD) : onMessage}
            className={`flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest py-3 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isOwner ? 'bg-slate-900 text-white shadow-slate-100' : 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-indigo-100'
            }`}
          >
            {isOwner ? 'Mark Closed' : 'Contact Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
