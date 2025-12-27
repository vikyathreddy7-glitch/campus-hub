
import React from 'react';
import { Notification, ItemType } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onViewItem: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkRead, onClearAll, onViewItem }) => {
  return (
    <div className="flex flex-col h-full bg-[#FAF9FF] animate-in fade-in duration-300">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-[#FAF9FF] z-10">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Campus-wide Activity</p>
        </div>
        {notifications.length > 0 && (
          <button onClick={onClearAll} className="text-blue-600 text-xs font-black bg-blue-50 px-3 py-2 rounded-xl">Clear All</button>
        )}
      </header>

      <div className="px-6 space-y-4 pb-24">
        {notifications.length > 0 ? (
          notifications.map(notif => {
            // Fix: Removed reference to non-existent ItemType.RENTAL to resolve error on line 28
            const isMarket = notif.type === ItemType.MARKETPLACE;
            const isLost = notif.type === ItemType.LOST;
            
            return (
              <button 
                key={notif.id} 
                onClick={() => { onMarkRead(notif.id); onViewItem(notif.itemId); }}
                className={`w-full flex gap-4 p-4 rounded-2xl border transition-all text-left shadow-sm ${
                  notif.read ? 'bg-white border-gray-50 opacity-60' : 'bg-white border-blue-100 ring-1 ring-blue-50/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  isMarket ? 'bg-blue-50 text-blue-600' : 
                  isLost ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {isMarket ? '🛒' : isLost ? '🔍' : '📦'}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-black tracking-tight leading-snug truncate ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap ml-2">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  {!notif.read && (
                    <span className="inline-block mt-2 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">🔕</div>
             <p className="text-sm font-black text-gray-500">No recent activity found.</p>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Check back later for new listings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
