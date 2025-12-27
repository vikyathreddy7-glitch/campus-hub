
import React, { useState } from 'react';
import { User, Order, MarketplaceItem } from '../types';

interface CheckoutModalProps {
  user: User;
  items: MarketplaceItem[];
  onClose: () => void;
  onConfirm: (order: Order) => Promise<void>;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ user, items, onClose, onConfirm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalAmount = items.reduce((acc, item) => acc + item.price, 0);
  const itemsTitles = items.map(i => i.title).join(', ');

  const [formData, setFormData] = useState({
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const order: Order = {
      full_name: user.name,
      roll_number: user.collegeId,
      price: totalAmount,
      location: 'Campus Pickup (To be coordinated)',
      description: `Purchase of: ${itemsTitles}`,
      title: itemsTitles.substring(0, 255), // Truncate if too long for DB title field
      gmail: user.email,
      event_date: new Date().toISOString(),
      message: formData.message || 'No additional message'
    };

    try {
      await onConfirm(order);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[3rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-8 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Confirm Order</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Order Summary & Confirmation</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex-grow overflow-y-auto space-y-6">
          <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Name</p>
                <p className="font-bold text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Roll ID</p>
                <p className="font-bold text-gray-900 uppercase">{user.collegeId}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                <p className="font-bold text-gray-900">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Details</h3>
            <div className="max-h-32 overflow-y-auto pr-2 space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 truncate max-w-[70%]">{item.title}</span>
                  <span className="font-black text-gray-900">₹{item.price}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total Amount</span>
              <span className="text-2xl font-black text-blue-600 tracking-tighter">₹{totalAmount}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Message to Seller(s)</label>
            <textarea 
              rows={3}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm font-medium text-black focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm resize-none"
              placeholder="Add a note about pickup time or specific questions..."
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#2D4A8A] text-white font-black py-5 rounded-[2rem] text-lg uppercase tracking-widest shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Confirm & Place Order'
              )}
            </button>
            <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-4">
              Your order data will be securely stored in NITR Hub DB
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
