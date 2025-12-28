
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MarketplaceItem, ItemType, ItemStatus, User } from '../types';

interface HomeProps {
  items: MarketplaceItem[];
  onOpenChat: (id: string) => void;
  onViewDetail: (id: string) => void;
  currentUser: User;
}

const CAROUSEL_SLIDES = [
  {
    id: 1,
    title: "Campus Hub",
    subtitle: "Buy & Sell • Rent • Borrow • Lost & Found",
    footer: "For verified campus students only",
    image: "https://images.unsplash.com/photo-1541339907198-e087563f975b?auto=format&fit=crop&q=80&w=1200", 
    accent: "indigo",
    icon: "✅"
  },
  {
    id: 3,
    title: "Lost & Found",
    subtitle: "Easily report and recover lost items within your college community.",
    footer: "Report in seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200", 
    accent: "rose",
    icon: "🔍"
  },
  {
    id: 4,
    title: "Buy Items & Sell Items",
    subtitle: "Easily buy, sell, and trade items with students in your college community.",
    footer: "Secure peer trading",
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=1200", 
    accent: "emerald",
    icon: "🛒"
  }
];

const Home: React.FC<HomeProps> = ({ items, onOpenChat, onViewDetail, currentUser }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const recentItems = useMemo(() => items.filter(i => i.status === ItemStatus.ACTIVE).slice(0, 4), [items]);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="px-6 py-6">
        <div className="relative overflow-hidden rounded-[2.5rem] premium-shadow h-[320px] md:h-[400px]">
          {CAROUSEL_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'
              }`}
            >
              <img src={slide.image} className="w-full h-full object-cover brightness-75" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-8 right-8 z-20">
                <div className="flex items-center gap-2 mb-4">
                  {slide.footer && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full shadow-lg">
                      <span className="text-xs">{slide.icon}</span>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">
                        {slide.footer}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight drop-shadow-sm">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-base font-medium text-white/80 mt-2 max-w-[320px] md:max-w-[480px]">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}
          <div className="absolute bottom-6 right-8 z-30 flex gap-2">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <section className="px-6 pb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Recent Listings</h2>
            <div className="w-10 h-1 bg-indigo-500 rounded-full mt-1"></div>
          </div>
          <Link to="/marketplace" className="text-[10px] font-black text-indigo-500 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors uppercase tracking-widest">
            Explore All
          </Link>
        </div>

        {recentItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {recentItems.map(item => (
              <div key={item.id} className="bg-white rounded-[2rem] border border-indigo-50/50 overflow-hidden premium-shadow group transition-all active:scale-[0.98]">
                <div className="aspect-square relative overflow-hidden" onClick={() => onViewDetail(item.id)}>
                  <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-lg text-[7px] font-black text-white uppercase tracking-widest shadow-lg ${
                      item.type === ItemType.MARKETPLACE ? 'bg-indigo-500' : 'bg-rose-500'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xs font-black text-slate-800 truncate leading-none mb-2">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-indigo-600">
                      {item.type === ItemType.MARKETPLACE ? `₹${item.price}` : 'Claim Free'}
                    </p>
                    <button onClick={() => onViewDetail(item.id)} className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 bg-white rounded-[2rem] border border-indigo-50 flex flex-col items-center justify-center opacity-50">
            <span className="text-4xl mb-3">📦</span>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Quiet for now...</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
