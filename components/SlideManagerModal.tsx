
import React, { useState, useRef, useEffect } from 'react';
import { CarouselSlide } from '../types';
import { supabaseService } from '../services/supabaseService';

interface SlideManagerModalProps {
  slides: CarouselSlide[];
  onClose: () => void;
  onRefresh: () => void;
  initialView?: 'list' | 'form';
}

const SlideManagerModal: React.FC<SlideManagerModalProps> = ({ slides, onClose, onRefresh, initialView = 'list' }) => {
  const [view, setView] = useState<'list' | 'form'>(initialView);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    footer: '',
    icon: '✨',
    image: null as string | null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Helper to ensure we always have a string
   */
  const toStr = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val === '[object Object]' ? '' : val;
    return String(val) === '[object Object]' ? '' : String(val);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (slide: CarouselSlide) => {
    if (slide.id.startsWith('featured') || slide.id.startsWith('default') || slide.id.startsWith('error')) {
      alert("System slides cannot be modified here.");
      return;
    }
    setEditingSlideId(slide.id);
    setFormData({
      title: toStr(slide.title),
      subtitle: toStr(slide.subtitle),
      footer: toStr(slide.footer),
      icon: toStr(slide.icon),
      image: toStr(slide.image_url)
    });
    setView('form');
  };

  const startAdd = () => {
    setEditingSlideId(null);
    setFormData({ title: '', subtitle: '', footer: '', icon: '✨', image: null });
    setView('form');
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image || !formData.title) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        title: toStr(formData.title),
        subtitle: toStr(formData.subtitle),
        footer: toStr(formData.footer),
        icon: toStr(formData.icon),
        image_url: toStr(formData.image),
        accent: 'indigo'
      };

      if (editingSlideId) {
        await supabaseService.updateCarouselSlide(editingSlideId, payload as any);
      } else {
        await supabaseService.addCarouselSlide({
          ...payload,
          order_index: slides.length + 1
        } as any);
      }
      
      setIsSuccess(true);
      // Wait a moment for success animation then trigger refresh/close
      setTimeout(() => {
        onRefresh();
      }, 1000);
      
    } catch (err) {
      console.error(err);
      alert("Failed to save slide. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('featured') || id.startsWith('default') || id.startsWith('error')) {
      alert("System slides cannot be deleted.");
      return;
    }
    if (!confirm('Permanently remove this slide?')) return;
    await supabaseService.deleteCarouselSlide(id);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[3rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        <header className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {view === 'form' ? (editingSlideId ? 'Edit Slide' : 'New Slide') : 'Carousel Manager'}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Customize Hub Branding</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="p-8 flex-grow overflow-y-auto space-y-8 bg-gray-50/20">
          {view === 'form' ? (
            isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl shadow-green-100">
                  🎉
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Published to Hub!</h3>
                <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Updating Homepage Carousel...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSlide} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video w-full rounded-3xl bg-gray-50 border-2 border-dashed border-indigo-100 overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-all group relative shadow-inner"
                >
                  {formData.image ? (
                    <>
                      <img src={formData.image} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="bg-white/90 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-xl">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">🖼️</span>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Select High-Res Slide Image</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Hero Title</label>
                    <input 
                      required
                      placeholder="e.g. Welcome to NITR"
                      className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Description Subtitle</label>
                    <input 
                      placeholder="Briefly describe the update or feature..."
                      className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
                      value={formData.subtitle}
                      onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Badge / Footer Text</label>
                      <input 
                        placeholder="e.g. New Update"
                        className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
                        value={formData.footer}
                        onChange={e => setFormData({ ...formData, footer: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Status Icon (Emoji)</label>
                      <input 
                        placeholder="e.g. ✨"
                        className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
                        value={formData.icon}
                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 text-white font-black py-4.5 rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      'Publish to Hub'
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setView('list')}
                    className="px-8 bg-gray-100 text-gray-500 font-black py-4.5 rounded-2xl uppercase text-xs tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-4 pb-12">
              <button 
                onClick={startAdd}
                className="w-full py-8 border-2 border-dashed border-indigo-100 rounded-[2.5rem] flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 transition-all group bg-white shadow-sm"
              >
                <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">➕</span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Add New Image Slide</p>
              </button>

              <div className="grid gap-4">
                {slides.map(slide => {
                  const isSystem = slide.id.startsWith('featured') || slide.id.startsWith('default') || slide.id.startsWith('error');
                  return (
                    <div key={slide.id} className="bg-white border border-gray-100 rounded-[2rem] p-4 flex gap-4 items-center shadow-sm hover:border-indigo-100 transition-all">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 shadow-inner">
                        <img src={slide.image_url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{slide.icon}</span>
                          <h4 className="font-black text-gray-900 text-sm truncate tracking-tight">{slide.title}</h4>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold truncate tracking-wide">{slide.subtitle || 'No subtitle'}</p>
                      </div>
                      <div className="flex gap-2.5">
                        <button 
                          onClick={() => !isSystem && startEdit(slide)}
                          className={`w-11 h-11 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm ${isSystem ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Edit Slide"
                          disabled={isSystem}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button 
                          onClick={() => !isSystem && handleDelete(slide.id)}
                          className={`w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm ${isSystem ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Delete Slide"
                          disabled={isSystem}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlideManagerModal;
