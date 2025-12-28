
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MarketplaceItem, ItemType, ItemStatus, User, CarouselSlide } from '../types';

interface HomeProps {
  items: MarketplaceItem[];
  carouselSlides: CarouselSlide[];
  onOpenChat: (id: string) => void;
  onViewDetail: (id: string) => void;
  currentUser: User;
  onRefreshSlides?: () => void;
}

const Home: React.FC<HomeProps> = ({ items, carouselSlides, onOpenChat, onViewDetail, currentUser }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlidesCount, setPrevSlidesCount] = useState(carouselSlides.length);

  // Auto-rotation effect
  useEffect(() => {
    if (carouselSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  // Jump to the new slide when one is added (from other potential sources)
  useEffect(() => {
    if (carouselSlides.length > prevSlidesCount) {
      setCurrentSlide(carouselSlides.length - 1);
    }
    setPrevSlidesCount(carouselSlides.length);
  }, [carouselSlides.length, prevSlidesCount]);

  const recentItems = useMemo(() => items.filter(i => i.status === ItemStatus.ACTIVE).slice(0, 4), [items]);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="px-4 py-4 md:px-6 md:py-6 relative">
        <div className="relative overflow-hidden rounded-[2.5rem] premium-shadow h-[400px] md:h-[500px] bg-slate-900 shadow-2xl shadow-indigo-100/30 group/carousel">
          
          {carouselSlides.length > 0 ? (
            carouselSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                }`}
              >
                <img 
                  src={slide.image_url} 
                  className="w-full h-full object-cover brightness-[0.85]" 
                  alt={slide.title} 
                />
                
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <div className="absolute top-12 left-8 md:top-16 md:left-12 z-20 max-w-[85%] md:max-w-[60%] space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2 animate-in slide-in-from-left duration-500">
                       {slide.icon && (
                          <div className="text-3xl md:text-5xl drop-shadow-md">
                            {slide.icon}
                          </div>
                       )}
                       <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                        {slide.title}
                      </h2>
                    </div>
                    
                    <p className="text-base md:text-xl font-bold text-white/90 leading-snug drop-shadow-lg max-w-sm animate-in slide-in-from-left duration-700">
                      {slide.subtitle}
                    </p>
                  </div>

                  {slide.footer && (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-1000">
                      <span className="text-base">{slide.icon || '✨'}</span>
                      <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] leading-none">
                        {slide.footer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20 bg-slate-800">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Syncing Gateway...</p>
              </div>
            </div>
          )}
          
          {carouselSlides.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-black/20 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10">
              {carouselSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === currentSlide ? 'w-10 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="px-6 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Recent Arrivals</h2>
            <div className="flex gap-1.5">
              <div className="w-12 h-1.5 bg-indigo-600 rounded-full"></div>
              <div className="w-2.5 h-1.5 bg-indigo-100 rounded-full"></div>
            </div>
          </div>
          <Link 
            to="/marketplace" 
            className="text-[10px] font-black text-indigo-600 bg-white border border-indigo-100 px-6 py-3 rounded-2xl transition-all hover:bg-indigo-600 hover:text-white hover:scale-105 uppercase tracking-widest active:scale-95 shadow-sm"
          >
            Explore Market
          </Link>
        </div>

        {recentItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {recentItems.map(item => (
              <div 
                key={item.id} 
                className="bg-white rounded-[2.5rem] border border-indigo-50/50 overflow-hidden premium-shadow group transition-all active:scale-[0.98] hover:shadow-2xl hover:shadow-indigo-100/30"
              >
                <div 
                  className="aspect-square relative overflow-hidden cursor-pointer" 
                  onClick={() => onViewDetail(item.id)}
                >
                  <img 
                    src={item.imageUrl} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={item.title} 
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3.5 py-2 rounded-xl text-[8px] font-black text-white uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/10 ${
                      item.type === ItemType.MARKETPLACE ? 'bg-indigo-600/90' : 'bg-rose-500/90'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-800 truncate leading-none mb-2.5">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-indigo-600 tracking-tight">
                      {item.type === ItemType.MARKETPLACE ? `₹${item.price}` : 'View Item'}
                    </p>
                    <button 
                      onClick={() => onViewDetail(item.id)} 
                      className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 bg-white rounded-[3.5rem] border border-indigo-50/50 flex flex-col items-center justify-center opacity-40 shadow-inner">
            <span className="text-7xl mb-6 grayscale">📦</span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Syncing...</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
