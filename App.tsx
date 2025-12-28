
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Marketplace from './components/Marketplace';
import LostAndFound from './components/LostAndFound';
import ChatModal from './components/ChatModal';
import UserProfileModal from './components/UserProfileModal';
import InboxModal from './components/InboxModal';
import Home from './components/Home';
import Notifications from './components/Notifications';
import ItemDetailModal from './components/ItemDetailModal';
import CartView from './components/CartView';
import UploadModal from './components/UploadModal';
import MyListings from './components/MyListings';
import AuthScreen from './components/AuthScreen';
import { MarketplaceItem, ItemStatus, ItemType, Message, User, ChatThread, Notification, Order, Report } from './types';
import { supabaseService } from './services/supabaseService';

const AppContent: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [chats, setChats] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cartItems, setCartItems] = useState<MarketplaceItem[]>([]);
  const [activeOtherUserId, setActiveOtherUserId] = useState<string | null>(null);
  const [viewDetailItemId, setViewDetailItemId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('hub_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const syncAllData = async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setIsRefreshing(true);
    
    try {
      const [fetchedItems, fetchedMessages, fetchedNotifs] = await Promise.all([
        supabaseService.fetchItems(),
        supabaseService.fetchMessages(currentUser.id),
        supabaseService.fetchNotifications(currentUser.id)
      ]);
      
      if (fetchedItems) setItems(fetchedItems);
      
      setChats(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(fetchedMessages)) {
          return fetchedMessages;
        }
        return prev;
      });

      setNotifications(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(fetchedNotifs)) {
          return fetchedNotifs;
        }
        return prev;
      });
    } catch (err: any) {
      console.warn("Data sync failure:", err.message);
    } finally {
      if (!silent) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    syncAllData();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;

    const pollMessages = async () => {
      try {
        const [latestMessages, latestNotifs] = await Promise.all([
          supabaseService.fetchMessages(currentUser.id),
          supabaseService.fetchNotifications(currentUser.id)
        ]);
        
        setChats(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(latestMessages)) {
            return latestMessages;
          }
          return prev;
        });

        setNotifications(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(latestNotifs)) {
            return latestNotifs;
          }
          return prev;
        });
      } catch (err) {
        console.warn("Polling failed:", err);
      }
    };

    const intervalId = setInterval(pollMessages, 500);
    return () => clearInterval(intervalId);
  }, [currentUser?.id]);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hub_user', JSON.stringify(user));
    try {
      await supabaseService.upsertProfile(user);
    } catch (err: any) {
      console.error("Supabase Profile Sync Warning:", err.message);
    }
  };

  const handleUpdateUser = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hub_user', JSON.stringify(user));
    try {
      await supabaseService.upsertProfile(user);
    } catch (err: any) {
      console.error("Profile update sync failed:", err.message);
    }
  };

  const handleAddItem = async (newItem: MarketplaceItem) => {
    if (!currentUser) return;
    setItems([newItem, ...items]);
    try {
      await supabaseService.addItem(newItem);
    } catch (err: any) {
      console.error("Add item failed:", err.message);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<MarketplaceItem>) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.map(it => it.id === id ? {...it, ...updates} : it));
    try {
      await supabaseService.updateItemDetails(id, item.type, updates);
    } catch (err: any) {
      console.error("Update sync failed:", err.message);
    }
  };

  const handleUpdateStatus = async (id: string, s: ItemStatus, r?: any) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.map(it => it.id === id ? {...it, status: s, recoveryRecord: r} : it));
    try {
      await supabaseService.updateItemStatus(id, item.type, s, r);
    } catch (err: any) {
      console.error("Status update sync failed:", err.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    // Perform a soft delete (archive)
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: ItemStatus.DELETED } : it));
    
    try {
      await supabaseService.updateItemStatus(id, item.type, ItemStatus.DELETED);
    } catch (err: any) {
      console.error("Soft delete sync failed:", err.message);
      syncAllData(true);
    }
  };

  const handleRestoreItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: ItemStatus.ACTIVE } : it));
    
    try {
      await supabaseService.updateItemStatus(id, item.type, ItemStatus.ACTIVE);
    } catch (err: any) {
      console.error("Restore sync failed:", err.message);
      syncAllData(true);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const prevItems = [...items];
    setItems(prev => prev.filter(it => it.id !== id));

    try {
      await supabaseService.deleteItem(id, item.type);
    } catch (err: any) {
      console.error("Permanent delete sync failed:", err.message);
      setItems(prevItems);
      throw err;
    }
  };

  const handleAddToCart = async (item: MarketplaceItem) => {
    if (!currentUser || cartItems.find(i => i.id === item.id)) return;
    const newCart = [...cartItems, item];
    setCartItems(newCart);
  };

  const handleRemoveFromCart = async (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSendMessage = async (recipientId: string, text: string, itemId: string | null) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: crypto.randomUUID(), 
      itemId,
      senderId: currentUser.id,
      receiverId: recipientId,
      senderName: currentUser.name,
      senderRollNumber: currentUser.collegeId,
      text,
      timestamp: new Date().toISOString()
    };
    
    setChats(prev => [...prev, newMessage]);
    try {
      await supabaseService.sendMessage(currentUser.id, recipientId, itemId, text);
    } catch (err: any) {
      console.error("Message send failed:", err.message);
    }
  };

  const handleReportItem = async (report: Report) => {
    try {
      await supabaseService.submitReport(report);
    } catch (err: any) {
      console.error("Report submission failed:", err.message);
      throw err;
    }
  };

  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
    try {
      await supabaseService.markNotificationRead(id);
    } catch (err: any) {
      console.error("Notif update failed:", err.message);
    }
  };

  const handleClearNotifications = async () => {
    if (!currentUser) return;
    setNotifications([]);
    try {
      await supabaseService.clearNotifications(currentUser.id);
    } catch (err: any) {
      console.error("Clear notifications sync failed:", err.message);
    }
  };

  const handleFullRefresh = () => {
    syncAllData();
  };

  const chatThreads = useMemo(() => {
    if (!currentUser) return [];
    const groups: { [key: string]: Message[] } = {};
    
    chats.forEach(m => {
      const otherId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
      if (!groups[otherId]) groups[otherId] = [];
      groups[otherId].push(m);
    });

    return Object.entries(groups).map(([otherUserId, messages]) => {
      const otherMsg = messages.find(m => m.senderId === otherUserId);
      const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      let resolvedName = 'Student User';
      let resolvedRoll = 'Verified Roll ID';
      let resolvedAvatar = undefined;

      if (otherMsg) {
        resolvedName = otherMsg.senderName;
        resolvedRoll = otherMsg.senderRollNumber;
      } else {
        const seller = items.find(i => i.posterId === otherUserId);
        if (seller) {
          resolvedName = seller.posterName;
          resolvedRoll = seller.posterCollegeId;
          resolvedAvatar = seller.posterAvatarUrl;
        }
      }

      return {
        otherUserId,
        otherUserName: resolvedName,
        otherUserRollNumber: resolvedRoll,
        otherUserAvatar: resolvedAvatar,
        messages: sortedMessages
      } as ChatThread;
    }).sort((a, b) => {
      const lastA = new Date(a.messages[a.messages.length - 1].timestamp).getTime();
      const lastB = new Date(b.messages[b.messages.length - 1].timestamp).getTime();
      return lastB - lastA;
    });
  }, [chats, currentUser, items]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2D4A8A] border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <header className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#5B7CB8] rounded-xl flex items-center justify-center text-white shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-800 tracking-tight leading-none">Campus</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsInboxOpen(true)} className="relative text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            {chats.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></span>}
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleFullRefresh} 
              className={`text-gray-400 hover:text-blue-600 transition-all duration-300 ${isRefreshing ? 'rotate-180 text-blue-600' : ''}`} 
              title="Refresh Data"
              disabled={isRefreshing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <Link to="/notifications" className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {notifications.filter(n => !n.read).length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home items={items} onOpenChat={(id) => { const item = items.find(i=>i.id===id); if(item) setActiveOtherUserId(item.posterId); }} onViewDetail={setViewDetailItemId} />} />
          <Route path="/marketplace" element={<Marketplace items={items.filter(i => i.type === ItemType.MARKETPLACE)} onUpdateStatus={handleUpdateStatus} onOpenChat={(id) => { const item = items.find(i=>i.id===id); if(item) setActiveOtherUserId(item.posterId); }} onViewDetail={setViewDetailItemId} currentUser={currentUser} onAddToCart={handleAddToCart} cartCount={cartItems.length} />} />
          <Route path="/lost-found" element={<LostAndFound items={items} onUpdateStatus={handleUpdateStatus} onOpenChat={(id) => { const item = items.find(i=>i.id===id); if(item) setActiveOtherUserId(item.posterId); }} onViewDetail={setViewDetailItemId} currentUser={currentUser} />} />
          <Route path="/notifications" element={<Notifications notifications={notifications} onMarkRead={handleMarkRead} onClearAll={handleClearNotifications} onViewItem={setViewDetailItemId} />} />
          <Route path="/cart" element={<CartView cartItems={cartItems} onRemoveItem={handleRemoveFromCart} onOpenChat={(id) => { const item = items.find(i=>i.id===id); if(item) setActiveOtherUserId(item.posterId); }} onViewDetail={setViewDetailItemId} />} />
          <Route path="/my-listings" element={<MyListings items={items.filter(i => i.posterId === currentUser.id)} onDelete={handleDeleteItem} onRestore={handleRestoreItem} onPermanentDelete={handlePermanentDelete} />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex justify-around items-center z-50">
        <NavItem to="/" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Home" active={location.pathname === '/'} />
        <NavItem to="/marketplace" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" label="Market" active={location.pathname === '/marketplace'} />
        <button onClick={() => setIsUploadOpen(true)} className="w-14 h-14 bg-[#2D4A8A] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 -mt-8 border-4 border-white"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></button>
        <NavItem to="/lost-found" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" label="L&F" active={location.pathname === '/lost-found'} />
        <button onClick={() => setIsProfileOpen(true)} className={`flex flex-col items-center gap-1 ${isProfileOpen ? 'text-[#5B7CB8]' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full border-2 ${isProfileOpen ? 'border-[#5B7CB8]' : 'border-gray-200'} flex items-center justify-center`}><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
          <span className="text-[9px] font-bold uppercase tracking-tight">Profile</span>
        </button>
      </nav>

      {activeOtherUserId && (
        <ChatModal 
          otherUserId={activeOtherUserId}
          otherUser={chatThreads.find(t => t.otherUserId === activeOtherUserId)}
          messages={chatThreads.find(t => t.otherUserId === activeOtherUserId)?.messages || []} 
          onClose={() => setActiveOtherUserId(null)} 
          onSend={(text) => handleSendMessage(activeOtherUserId, text, null)} 
          currentUser={currentUser} 
        />
      )}
      {viewDetailItemId && items.find(i => i.id === viewDetailItemId) && (
        <ItemDetailModal 
          item={items.find(i => i.id === viewDetailItemId)!} 
          onClose={() => setViewDetailItemId(null)} 
          onMessage={() => { const item = items.find(i=>i.id===viewDetailItemId); if(item) { setViewDetailItemId(null); setActiveOtherUserId(item.posterId); } }} 
          onCheckout={async (order) => { await supabaseService.createOrder(order); }} 
          onReport={handleReportItem}
          currentUser={currentUser} 
          onAddToCart={handleAddToCart} 
          onUpdateStatus={handleUpdateStatus} 
          onUpdateItem={handleUpdateItem} 
          onDeleteListing={handleDeleteItem}
        />
      )}
      {isInboxOpen && (
        <InboxModal threads={chatThreads} onClose={() => setIsInboxOpen(false)} onSelectThread={(id) => { setActiveOtherUserId(id); setIsInboxOpen(false); }} />
      )}
      {isProfileOpen && (
        <UserProfileModal user={currentUser} onClose={() => setIsProfileOpen(false)} onUpdateUser={handleUpdateUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem('hub_user'); setIsProfileOpen(false); }} />
      )}
      {isUploadOpen && (
        <UploadModal onClose={() => setIsUploadOpen(false)} onAdd={handleAddItem} type={ItemType.MARKETPLACE} currentUser={currentUser} />
      )}
    </div>
  );
};

const NavItem: React.FC<{ to: string, icon: string, label: string, active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 ${active ? 'text-[#5B7CB8]' : 'text-gray-400'}`}>
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
    <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
  </Link>
);

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
