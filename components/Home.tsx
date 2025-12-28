
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MarketplaceItem, ItemType, ItemStatus } from '../types';

interface HomeProps {
  items: MarketplaceItem[];
  onOpenChat: (id: string) => void;
  onViewDetail: (id: string) => void;
}

const CAROUSEL_SLIDES = [
  {
    id: 1,
    title: "Campus Hub",
    subtitle: "Buy & Sell • Lost & Found",
    footer: "For verified campus students only",
    image: "https://images.unsplash.com/photo-1541339907198-e087563f975b?auto=format&fit=crop&q=80&w=1200", 
    icon: "✅"
  },
  {
    id: 3,
    title: "Lost & Found",
    subtitle: "Easily report and recover lost items within your college community.",
    footer: "",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200", 
    icon: "📦"
  },
  {
    id: 4,
    title: "Buy Items & Sell Items",
    subtitle: "Easily buy, sell, and trade items with students in your college community.",
    footer: "",
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=1200", 
    icon: "🛒"
  }
];

const Home: React.FC<HomeProps> = ({ items, onOpenChat, onViewDetail }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeRecentItems = useMemo(() => {
    return items
      .filter(item => item.status === ItemStatus.ACTIVE)
      .slice(0, 4);
  }, [items]);

  return (
    <div className="bg-[#FAF9FF] animate-in fade-in duration-500">
      {/* Dynamic Hero Carousel */}
      <div className="px-6 py-4">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-xl h-[280px] md:h-[340px] group border border-gray-100">
          {CAROUSEL_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Image Layer */}
              <div className="absolute inset-0">
                <img 
                  src={slide.image} 
                  className="w-full h-full object-cover transform scale-105" 
                  alt={slide.title} 
                />
                {/* Darker overlay for better text contrast matching screenshot style */}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
              </div>

              {/* Text Content Layer */}
              <div className="relative z-20 px-10 w-full max-w-2xl">
                <div className="flex items-center gap-3 mb-2">
                   {index !== 0 && (
                     <span className="text-3xl drop-shadow-lg filter brightness-125">{slide.icon}</span>
                   )}
                   <h2 className={`text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl ${index === 0 ? 'ml-0' : ''}`}>
                    {slide.title}
                   </h2>
                </div>
                
                <p className="text-sm md:text-xl font-extrabold text-white/95 leading-relaxed mb-6 max-w-[480px] drop-shadow-md">
                  {slide.subtitle}
                </p>

                {slide.footer && (
                  <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl text-[12px] font-black text-[#166534] shadow-xl border border-white">
                    <div className="w-5 h-5 bg-[#22C55E] rounded-full flex items-center justify-center text-white text-[10px]">
                      ✓
                    </div>
                    {slide.footer}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Carousel Progress Indicators */}
          <div className="absolute bottom-8 left-10 z-30 flex gap-1.5">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-10 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <section className="mt-8 px-6 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-black text-gray-800 tracking-tight uppercase tracking-widest">Recently Listed Items</h2>
          <Link to="/marketplace" className="text-[10px] font-bold text-gray-400 flex items-center gap-1 hover:text-blue-600 transition-colors uppercase tracking-widest">
            View Market <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {activeRecentItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {activeRecentItems.map(item => (
              <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all">
                <div className="aspect-[1.1/1] relative overflow-hidden bg-gray-50 cursor-pointer" onClick={() => onViewDetail(item.id)}>
                  <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <div className={`bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg text-[7px] font-black text-white uppercase tracking-widest w-fit`}>
                      {item.type}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-[11px] font-black text-gray-800 truncate leading-snug uppercase tracking-tight">{item.title}</h3>
                  <p className={`text-[10px] font-black mt-1 uppercase tracking-widest ${
                    item.type === ItemType.MARKETPLACE ? 'text-blue-600' : 
                    item.type === ItemType.LOST ? 'text-red-500' : 'text-green-600'
                  }`}>
                    {item.type === ItemType.MARKETPLACE ? `₹${item.price}` : item.type}
                  </p>
                  <div className="mt-3 flex gap-1.5">
                    <button onClick={() => onViewDetail(item.id)} className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    </button>
                    <button 
                      onClick={() => onOpenChat(item.id)}
                      className="flex-grow bg-[#2D4A8A] text-white text-[9px] font-black py-2.5 rounded-xl shadow-sm active:scale-95 transition-transform uppercase tracking-widest"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 bg-white rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center opacity-40">
            <span className="text-4xl mb-2">📦</span>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">No recent listings</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
