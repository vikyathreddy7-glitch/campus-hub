
import React from 'react';
import { Link } from 'react-router-dom';
import { MarketplaceItem, ItemType } from '../types';

interface HomeProps {
  items: MarketplaceItem[];
  onOpenChat: (id: string) => void;
  onViewDetail: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ items, onOpenChat, onViewDetail }) => {
  return (
    <div className="bg-[#FAF9FF] animate-in fade-in duration-500">
      {/* Hero Banner matched exactly to the user's provided design */}
      <div className="px-6 py-4">
        <div className="relative overflow-hidden bg-[#E9E4FF] rounded-[2.5rem] p-8 shadow-sm border border-[#DCD3FF] min-h-[240px] flex items-center">
          <div className="relative z-10 w-full md:w-[60%]">
             <div className="flex items-center gap-2.5 mb-2">
               {/* Rounded icon matching the one in the screenshot */}
               <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                 </svg>
               </div>
               <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight">Campus Marketplace</h2>
             </div>
             
             <p className="text-sm md:text-base font-bold text-[#4B4453] leading-relaxed mb-6 max-w-[240px]">
               Buy, sell, rent and find lost items within your college community.
             </p>

             <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-[11px] font-black text-[#166534] border border-[#DCFCE7] shadow-sm">
               <div className="w-5 h-5 bg-[#22C55E] rounded-full flex items-center justify-center text-white shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                 </svg>
               </div>
               Verified Campee Users Only
             </div>
          </div>
          
          {/* Illustration placed exactly as shown in the provided image */}
          <div className="absolute right-0 bottom-0 w-[45%] h-full pointer-events-none hidden sm:block">
             <img 
               src="https://cdni.iconscout.com/illustration/premium/thumb/students-campus-life-illustration-download-in-svg-png-gif-file-formats--education-university-school-lifestyle-pack-illustrations-5381862.png" 
               className="w-full h-full object-contain object-right-bottom" 
               alt="Marketplace Students Illustration" 
             />
          </div>
          {/* Mobile version of the illustration */}
          <div className="absolute right-[-10px] bottom-[-10px] w-[40%] h-[80%] pointer-events-none sm:hidden opacity-90">
             <img 
               src="https://cdni.iconscout.com/illustration/premium/thumb/students-campus-life-illustration-download-in-svg-png-gif-file-formats--education-university-school-lifestyle-pack-illustrations-5381862.png" 
               className="w-full h-full object-contain object-right-bottom" 
               alt="Marketplace Students Illustration" 
             />
          </div>
        </div>
      </div>

      <section className="mt-8 px-6 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-black text-gray-800 tracking-tight">Recently Listed Items</h2>
          <Link to="/marketplace" className="text-[10px] font-bold text-gray-400 flex items-center gap-1 hover:text-blue-600 transition-colors">
            View Market <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all">
              <div className="aspect-[1.1/1] relative overflow-hidden bg-gray-50" onClick={() => onViewDetail(item.id)}>
                <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                {item.type !== ItemType.MARKETPLACE && (
                  <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg text-[7px] font-black text-white uppercase tracking-widest">
                    {item.type}
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-[11px] font-black text-gray-800 truncate leading-snug">{item.title}</h3>
                <p className="text-[10px] text-blue-600 font-bold mt-0.5">
                  {item.price > 0 ? `₹${item.price}` : 'FREE'}
                </p>
                <div className="mt-3 flex gap-1.5">
                  <button onClick={() => onViewDetail(item.id)} className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  </button>
                  <button 
                    onClick={() => onOpenChat(item.id)}
                    className="flex-grow bg-[#2D4A8A] text-white text-[9px] font-black py-2 rounded-xl shadow-sm active:scale-95 transition-transform uppercase tracking-widest"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
