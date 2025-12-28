
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceItem, User, ItemStatus, ItemType, Order, Report } from '../types';

interface ItemDetailModalProps {
  item: MarketplaceItem;
  onClose: () => void;
  onMessage: () => void;
  onCheckout: (order: Order) => Promise<void>;
  onReport: (report: Report) => Promise<void>;
  currentUser: User;
  onAddToCart?: (item: MarketplaceItem) => void;
  onUpdateStatus?: (itemId: string, status: ItemStatus, recovery?: any) => void;
  onUpdateItem?: (id: string, updates: Partial<MarketplaceItem>) => Promise<void>;
  onDeleteListing?: (id: string) => Promise<void>;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onMessage, onCheckout, onReport, currentUser, onAddToCart, onUpdateStatus, onUpdateItem, onDeleteListing }) => {
  const navigate = useNavigate();
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState({ name: '', rollId: '' });
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: item.title,
    description: item.description,
    price: item.price.toString(),
    location: item.location || ''
  });

  const isOwner = item.posterId === currentUser.id;

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setIsSubmitting(true);
    try {
      const report: Report = {
        item_id: item.id,
        reporter_id: currentUser.id,
        reporter_name: currentUser.name,
        reporter_roll: currentUser.collegeId,
        reason: reportReason,
        item_title: item.title,
        poster_id: item.posterId,
        item_type: item.type
      };
      await onReport(report);
      setReportSuccess(true);
      setTimeout(() => {
        setIsReporting(false);
        setReportSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = (status: ItemStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(item.id, status);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!onDeleteListing) return;
    if (!window.confirm('Are you sure you want to permanently delete this listing? It will be removed from the marketplace for everyone.')) return;
    
    setIsSubmitting(true);
    try {
      await onDeleteListing(item.id);
      onClose();
    } catch (err) {
      alert('Failed to delete listing. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoveredSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    if (recoveryForm.rollId.length !== 9) {
      setRecoveryError('Roll ID must be 9 characters.');
      return;
    }
    if (onUpdateStatus) {
      onUpdateStatus(item.id, ItemStatus.RECOVERED, {
        receiverName: recoveryForm.name,
        collegeId: recoveryForm.rollId.toUpperCase(),
        date: new Date().toISOString()
      });
      onClose();
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateItem) return;
    setIsSubmitting(true);
    try {
      await onUpdateItem(item.id, {
        title: editForm.title,
        description: editForm.description,
        price: Number(editForm.price),
        location: editForm.location
      });
      setIsEditingMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdited = item.updatedAt && 
                   new Date(item.updatedAt).getTime() > new Date(item.createdAt).getTime() + 1000;

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
              {item.location && !isEditingMode && (
                <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl">
                  {item.location}
                </span>
              )}
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            {isEditingMode ? (
              <form onSubmit={handleSaveEdit} className="space-y-6 animate-in fade-in duration-300">
                 <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Editing Listing</span>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Title</label>
                       <input 
                         required
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none shadow-sm"
                         value={editForm.title}
                         onChange={e => setEditForm({...editForm, title: e.target.value})}
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       {item.type === ItemType.MARKETPLACE ? (
                         <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Price (₹)</label>
                            <input 
                              type="number"
                              required
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none shadow-sm"
                              value={editForm.price}
                              onChange={e => setEditForm({...editForm, price: e.target.value})}
                            />
                         </div>
                       ) : (
                         <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Location</label>
                            <input 
                              required
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none shadow-sm"
                              value={editForm.location}
                              onChange={e => setEditForm({...editForm, location: e.target.value})}
                            />
                         </div>
                       )}
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Description</label>
                       <textarea 
                         rows={4}
                         required
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-sm font-medium text-black focus:outline-none shadow-sm resize-none"
                         value={editForm.description}
                         onChange={e => setEditForm({...editForm, description: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingMode(false)}
                      className="px-8 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                 </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{item.title}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{item.category}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200" />
                      <span className="text-xs font-bold text-gray-400">Posted {new Date(item.createdAt).toLocaleDateString()}</span>
                      {isEdited && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span className="text-xs font-bold text-blue-400 italic">Edited {new Date(item.updatedAt!).toLocaleDateString()}</span>
                        </>
                      )}
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

                {isOwner ? (
                  <div className="space-y-4">
                    {isRecovering ? (
                      <form onSubmit={handleRecoveredSubmit} className="p-6 bg-green-50/50 border border-green-100 rounded-[2rem] space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1 text-center">Record Recovery Details</p>
                        <div className="space-y-3">
                          <input 
                            required
                            className="w-full text-xs p-4 bg-white border border-green-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-200 text-black font-bold shadow-sm"
                            placeholder="Claimant's Full Name"
                            value={recoveryForm.name}
                            onChange={e => setRecoveryForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                          <div className="relative">
                            <input 
                              required
                              maxLength={9}
                              className={`w-full text-xs p-4 bg-white border ${recoveryError ? 'border-red-200' : 'border-green-100'} rounded-2xl outline-none focus:ring-2 focus:ring-green-200 uppercase text-black font-bold shadow-sm`}
                              placeholder="Roll ID (e.g. 121CS0001)"
                              value={recoveryForm.rollId}
                              onChange={e => setRecoveryForm(prev => ({ ...prev, rollId: e.target.value.toUpperCase() }))}
                            />
                            {recoveryError && <p className="text-[9px] font-black text-red-500 uppercase mt-1 ml-1">{recoveryError}</p>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="flex-1 bg-green-600 text-white text-xs py-4 rounded-2xl font-black shadow-lg shadow-green-100 uppercase tracking-widest">Complete Record</button>
                          <button type="button" onClick={() => { setIsRecovering(false); setRecoveryError(null); }} className="px-6 bg-white text-gray-400 text-xs py-4 rounded-2xl font-black uppercase tracking-widest border border-gray-100">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => item.type === ItemType.MARKETPLACE ? handleStatusUpdate(ItemStatus.SOLD) : setIsRecovering(true)}
                          className="w-full bg-green-600 text-white font-black py-5 rounded-[2rem] text-sm uppercase tracking-widest shadow-xl shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {item.type === ItemType.MARKETPLACE ? 'Mark as Sold' : item.type === ItemType.LOST ? 'Recovered' : 'Exchanged'}
                        </button>
                        
                        <div className="flex gap-3">
                           <button 
                             onClick={() => setIsEditingMode(true)}
                             className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 py-4 rounded-2xl text-center transition-all group"
                           >
                             <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:scale-105 transition-transform">Edit Item</p>
                           </button>
                           <button 
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="flex-1 bg-red-50 text-red-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center"
                          >
                            {isSubmitting ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" /> : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : isReporting ? (
                  <form onSubmit={handleReport} className="p-6 bg-red-50/50 border border-red-100 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    {reportSuccess ? (
                      <div className="py-8 text-center space-y-4 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase">Report Received</p>
                          <p className="text-xs font-bold text-gray-400 mt-1">Our moderators will review this listing shortly.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 block">Report this item</label>
                          <textarea 
                            required
                            rows={3}
                            className="w-full bg-white border border-red-100 rounded-2xl py-4 px-5 text-sm font-medium text-black focus:outline-none focus:ring-4 focus:ring-red-50 transition-all shadow-sm resize-none"
                            placeholder="Why are you reporting this?..."
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
                      </>
                    )}
                  </form>
                ) : (
                  <div className="flex flex-col gap-4">
                    {item.type === ItemType.MARKETPLACE && (
                      <button 
                        onClick={() => { onAddToCart?.(item); onClose(); }}
                        className="w-full bg-white border-2 border-gray-900 text-gray-900 font-black py-5 rounded-[2rem] text-sm uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                      >
                        Add to Watchlist
                      </button>
                    )}
                    <button 
                      onClick={() => setIsReporting(true)}
                      className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors self-center"
                    >
                      Report Listing
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
