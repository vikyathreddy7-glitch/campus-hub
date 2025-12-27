
import React from 'react';
import { MarketplaceItem } from '../types';

interface HistoryViewProps {
  items: MarketplaceItem[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 p-20 text-center shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">📂</div>
        <p className="text-gray-500 font-black text-sm uppercase tracking-widest">No Activity</p>
        <p className="text-xs text-gray-400 mt-1">Check back later for recent exchanges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporter (Finder/Owner)</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receiver (Claimant)</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100">
                        <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm leading-tight">{item.title}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">{item.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <p className="text-sm font-black text-gray-800 leading-none mb-1">{item.posterName}</p>
                      <p className="text-[10px] font-bold text-blue-500 uppercase">{item.posterCollegeId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <p className="text-sm font-black text-green-600 leading-none mb-1">{item.recoveryRecord?.receiverName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{item.recoveryRecord?.collegeId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <p className="text-xs font-black text-gray-900 mb-1">
                      {item.recoveryRecord?.date ? new Date(item.recoveryRecord.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-[9px] font-black uppercase">Exchanged</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
