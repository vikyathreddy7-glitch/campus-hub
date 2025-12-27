
import React, { useState, useRef } from 'react';
import { ItemType, MarketplaceItem, ItemStatus, User } from '../types';
import { MARKETPLACE_CATEGORIES, LOST_FOUND_CATEGORIES } from '../constants';
import { geminiService } from '../services/geminiService';

interface UploadModalProps {
  onClose: () => void;
  onAdd: (item: MarketplaceItem) => void;
  type: ItemType;
  currentUser: User;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onAdd, type: initialType, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '', 
    condition: 'Good',
    type: initialType
  });
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = formData.type === ItemType.MARKETPLACE 
    ? MARKETPLACE_CATEGORIES.filter(c => c !== 'All')
    : LOST_FOUND_CATEGORIES.filter(c => c !== 'All');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        setIsAnalyzing(true);
        const analysis = await geminiService.analyzeItemImage(base64);
        if (analysis) {
          setFormData(prev => ({
            ...prev,
            title: analysis.title,
            description: analysis.description,
            category: categories.find(c => c.toLowerCase().includes(analysis.category.toLowerCase())) || categories[categories.length - 1]
          }));
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !formData.category) return;

    // Fix: Use a valid UUID instead of Math.random string to satisfy database constraints
    const newItem: MarketplaceItem = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      price: formData.type === ItemType.MARKETPLACE ? Number(formData.price) : 0,
      category: formData.category,
      location: formData.type !== ItemType.MARKETPLACE ? formData.location : undefined,
      imageUrl: image,
      posterId: currentUser.id,
      posterName: currentUser.name,
      posterCollegeId: currentUser.collegeId,
      posterAvatarUrl: currentUser.avatarUrl,
      createdAt: new Date().toISOString(),
      status: ItemStatus.ACTIVE,
      type: formData.type
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#F8FAFC] animate-in slide-in-from-bottom duration-300">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Post New Listing</h2>
        </div>
        <button onClick={() => setFormData(prev => ({...prev, title: '', description: '', price: '', category: '', location: ''}))} className="text-blue-600 text-sm font-bold">Clear</button>
      </header>

      <div className="flex-grow overflow-y-auto px-6 pb-24">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
          <button 
            type="button" 
            onClick={() => setFormData(p => ({...p, type: ItemType.LOST}))}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${formData.type === ItemType.LOST ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
          >
            Lost
          </button>
          <button 
            type="button" 
            onClick={() => setFormData(p => ({...p, type: ItemType.MARKETPLACE}))}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${formData.type === ItemType.MARKETPLACE ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
          >
            Sell
          </button>
          <button 
            type="button" 
            onClick={() => setFormData(p => ({...p, type: ItemType.FOUND}))}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${formData.type === ItemType.FOUND ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
          >
            Found
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Item Title</label>
            <input 
              required
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
              placeholder="What are you posting?"
              value={formData.title}
              onChange={e => setFormData(p => ({...p, title: e.target.value}))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
              <select 
                required
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-5 text-xs font-bold text-black focus:outline-none transition-all shadow-sm appearance-none"
                value={formData.category}
                onChange={e => setFormData(p => ({...p, category: e.target.value}))}
              >
                <option value="">Select</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {formData.type === ItemType.MARKETPLACE ? (
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Price (₹)</label>
                <input 
                  type="number" 
                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none shadow-sm"
                  value={formData.price}
                  onChange={e => setFormData(p => ({...p, price: e.target.value}))}
                />
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                  {formData.type === ItemType.LOST ? 'Last Seen At' : 'Found At'}
                </label>
                <input 
                  required
                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-5 text-sm font-bold text-black focus:outline-none shadow-sm"
                  placeholder="Location..."
                  value={formData.location}
                  onChange={e => setFormData(p => ({...p, location: e.target.value}))}
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Description</label>
            <textarea 
              rows={4}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-5 text-sm font-medium text-black focus:outline-none shadow-sm resize-none"
              placeholder="Add some details..."
              value={formData.description}
              onChange={e => setFormData(p => ({...p, description: e.target.value}))}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Photo</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[1.5/1] bg-white border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative shadow-sm`}
            >
              {image ? (
                <>
                  <img src={image} className="w-full h-full object-cover" alt="" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-black text-blue-600">Smart Analyzing...</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <span className="text-3xl mb-2 block">📸</span>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Item Photo</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-[#2D4A8A] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-50 active:scale-95 transition-all text-lg"
          >
            Post Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
