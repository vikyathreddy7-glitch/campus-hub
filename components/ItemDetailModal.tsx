
import React, { useState } from 'react';
import { MarketplaceItem, ItemType, User, Order } from '../types';

interface ItemDetailModalProps {
  item: MarketplaceItem;
  onClose: () => void;
  onMessage: () => void;
  onCheckout?: (order: Order) => void;
  currentUser: User;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onMessage, onCheckout, currentUser }) => {
  const [claimMode, setClaimMode] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    fullName: currentUser.name,
    rollNumber: currentUser.collegeId,
    gmail: currentUser.email || '',
    eventDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMarketplace = item.type === ItemType.MARKETPLACE;
  const isOwner = item.posterId === currentUser.id;

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (buyerInfo.rollNumber.length !== 9) {
      setError('Roll Number must be exactly 9 characters.');
      return;
    }

    if (!onCheckout) return;

    setIsSubmitting(true);

    const orderRecord: Order = {
      full_name: buyerInfo.fullName,
      roll_number: buyerInfo.rollNumber.toUpperCase(),
      price: item.price,
      location: item.location || 'Campus',
      description: item.description,
      title: item.title,
      gmail: buyerInfo.gmail,
      event_date: buyerInfo.eventDate
    };

    // Perform local save
    onCheckout(orderRecord);
    
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="relative h-80 flex-shrink-0 bg-gray-100">
        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="absolute top-6 right-6 px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest">
          {item.category}
        </div>
      </div>

      <div className="flex-grow bg-white -mt-8 rounded-t-[2.5rem] p-8 shadow-2xl relative z-10 space-y-8 pb-24">
        {claimMode ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <header className="mb-8">
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Claim Request</h2>
               <p className="text-sm font-bold text-gray-500">Provide final information for the claim record.</p>
             </header>

             <form onSubmit={handleFinalSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100 uppercase tracking-widest">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                    <input 
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none shadow-sm"
                      value={buyerInfo.fullName}
                      onChange={e => setBuyerInfo({...buyerInfo, fullName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex justify-between">
                      <span>Roll Number</span>
                      <span className={buyerInfo.rollNumber.length === 9 ? 'text-green-500' : 'text-gray-300'}>{buyerInfo.rollNumber.length}/9</span>
                    </label>
                    <input 
                      required
                      maxLength={9}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none shadow-sm uppercase"
                      value={buyerInfo.rollNumber}
                      onChange={e => setBuyerInfo({...buyerInfo, rollNumber: e.target.value.toUpperCase()})}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Gmail</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none shadow-sm"
                      value={buyerInfo.gmail}
                      onChange={e => setBuyerInfo({...buyerInfo, gmail: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date</label>
                    <input 
                      required
                      type="date"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none shadow-sm"
                      value={buyerInfo.eventDate}
                      onChange={e => setBuyerInfo({...buyerInfo, eventDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Summary</p>
                  <p className="text-base font-black text-gray-900 leading-none">{item.title}</p>
                  <p className="text-xl font-black text-blue-600">
                    {isMarketplace ? `₹ ${item.price}` : 'FREE / CLAIM'}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-[#2D4A8A] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Save Request'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setClaimMode(false)}
                    className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-[2rem] font-black text-sm active:scale-95 transition-all"
                  >
                    Back
                  </button>
                </div>
             </form>
          </div>
        ) : (
          <>
            <header>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{item.title}</h1>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  item.type === ItemType.MARKETPLACE ? 'bg-blue-50 text-blue-600' : 
                  item.type === ItemType.LOST ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {item.type}
                </div>
              </div>
              <div className="flex items-center justify-between">
                {isMarketplace ? (
                  <p className="text-2xl font-black text-blue-600 tracking-tighter">
                    ₹ {item.price}
                  </p>
                ) : item.location ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-bold uppercase tracking-wide">
                      {item.type === ItemType.LOST ? 'Last seen at: ' : 'Found at: '} 
                      <span className="text-gray-900">{item.location}</span>
                    </span>
                  </div>
                ) : null}
              </div>
            </header>

            <section>
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                {item.description || "No detailed description provided by the poster."}
              </p>
            </section>

            <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Poster Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-black border-2 border-white shadow-sm overflow-hidden">
                   {item.posterAvatarUrl ? (
                     <img src={item.posterAvatarUrl} className="w-full h-full object-cover" alt="" />
                   ) : (
                     item.posterName.charAt(0)
                   )}
                </div>
                <div>
                  <p className="text-base font-black text-gray-900 leading-none mb-1">{item.posterName}</p>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">ID: {item.posterCollegeId}</p>
                  <p className="text-[10px] font-bold text-blue-500 mt-1">Verified NITR Member</p>
                </div>
              </div>
            </section>

            <div className="pt-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-4">
                {!isOwner && (
                  <>
                    {!isMarketplace && (
                       <button 
                        onClick={() => setClaimMode(true)}
                        className="flex-1 bg-[#2D4A8A] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        Claim Item
                      </button>
                    )}
                    <button 
                      onClick={onMessage}
                      className="flex-1 bg-white text-[#2D4A8A] py-5 rounded-[2rem] font-black text-lg border-2 border-blue-50 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Message {isMarketplace ? 'Seller' : 'Finder'}
                    </button>
                  </>
                )}
                {isOwner && (
                   <button className="flex-grow bg-gray-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-gray-100 active:scale-95 transition-all">
                      Manage Listing
                   </button>
                )}
              </div>
              
              <button 
                type="button"
                className="w-full bg-red-50 text-red-600 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report Item
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemDetailModal;
