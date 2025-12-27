
import React, { useState } from 'react';
import { MarketplaceItem, User, ItemStatus, ItemType, Order } from '../types';

interface ItemDetailModalProps {
  item: MarketplaceItem;
  onClose: () => void;
  onMessage: () => void;
  onCheckout: (order: Order) => Promise<void>;
  currentUser: User;
  onAddToCart?: (item: MarketplaceItem) => void;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onMessage, onCheckout, currentUser, onAddToCart }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = item.posterId === currentUser.id;

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setIsSubmitting(true);
    try {
      const order: Order = {
        full_name: currentUser.name,
        roll_number: currentUser.collegeId,
        price: item.price,
        location: item.location || 'N/A',
        description: reportReason,
        title: item.title,
        gmail: currentUser.email,
        event_date: new Date().toISOString(),
        message: `Report for item ${item.id}`
      };
      await onCheckout(order);
      setIsReporting(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[3rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="absolute top-6 right-6 z-20">
          <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-lg rounded-full flex items-center justify-center text-white transition-all shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          <div className="relative aspect-video sm:aspect-[16/9] w-full bg-gray-100">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6 flex flex-wrap gap-3">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl backdrop-blur-md ${
                item.type === ItemType.MARKETPLACE ? 'bg-blue-600/80 text-white' : 'bg-red-50/80 text-white'
              }`}>
                {item.type}
              </span>
              {item.location && (
                <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl">
                  {item.location}
                </span>
              )}
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{item.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{item.category}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-200" />
                  <span className="text-xs font-bold text-gray-400">Posted {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {item.type === ItemType.MARKETPLACE && (
                <div className="text-right">
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Price</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{item.price}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Item Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl border border-blue-100 overflow-hidden shadow-sm">
                  {item.posterAvatarUrl ? (
                    <img src={item.posterAvatarUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    item.posterName.charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Posted By</p>
                  <p className="font-black text-gray-900 text-base leading-none">{item.posterName}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase mt-1 tracking-wider">{item.posterCollegeId}</p>
                </div>
              </div>
              {!isOwner && (
                <button onClick={onMessage} className="px-6 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-100">
                  Message
                </button>
              )}
            </div>

            {isReporting ? (
              <form onSubmit={handleReport} className="p-6 bg-red-50/50 border border-red-100 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div>
                  <label className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 block">Report this item</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-white border border-red-100 rounded-2xl py-4 px-5 text-sm font-medium text-black focus:outline-none focus:ring-4 focus:ring-red-50 transition-all shadow-sm resize-none"
                    placeholder="Why are you reporting this? (Scam, inappropriate, duplicate...)"
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Report'}
                  </button>
                  <button type="button" onClick={() => setIsReporting(false)} className="px-6 bg-white text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl border border-gray-100">Cancel</button>
                </div>
              </form>
            ) : (
              !isOwner && (
                <div className="flex flex-col gap-4">
                  {item.type === ItemType.MARKETPLACE && (
                    <button 
                      onClick={() => { onAddToCart?.(item); onClose(); }}
                      className="w-full bg-white border-2 border-gray-900 text-gray-900 font-black py-5 rounded-[2rem] text-sm uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Add to Cart
                    </button>
                  )}
                  <button 
                    onClick={() => setIsReporting(true)}
                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors self-center"
                  >
                    Report Listing
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
