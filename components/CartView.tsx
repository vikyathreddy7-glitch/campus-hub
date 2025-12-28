
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceItem } from '../types';

interface CartViewProps {
  cartItems: MarketplaceItem[];
  onRemoveItem: (id: string) => void;
  onOpenChat: (id: string) => void;
  onViewDetail: (id: string) => void;
}

const CartView: React.FC<CartViewProps> = ({ cartItems, onRemoveItem, onOpenChat, onViewDetail }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9FF] animate-in fade-in duration-300 flex flex-col">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-[#FAF9FF] z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Saved Items</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Your Watchlist</p>
          </div>
        </div>
      </header>

      <div className="px-6 flex-grow pb-32 space-y-4 overflow-y-auto">
        {cartItems.length > 0 ? (
          cartItems.map(item => (
            <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 p-4 shadow-sm flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
              <div 
                className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => onViewDetail(item.id)}
              >
                <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-grow min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-gray-900 text-sm truncate pr-2">{item.title}</h3>
                    <p className="text-blue-600 font-black text-sm whitespace-nowrap">₹{item.price}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{item.category}</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onOpenChat(item.id)}
                    className="flex-grow bg-[#2D4A8A] text-white text-[10px] font-black uppercase py-2 rounded-xl shadow-sm"
                  >
                    Contact Seller
                  </button>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center transition-colors hover:bg-red-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-6">
              🔖
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Watchlist is empty</h3>
            <p className="text-sm font-bold text-gray-500 max-w-xs text-center mx-auto">
              Save items you're interested in by adding them to your watchlist.
            </p>
            <button 
              onClick={() => navigate('/marketplace')}
              className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              Start Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartView;
