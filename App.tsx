
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
import BrandingModal from './components/BrandingModal';
import { MarketplaceItem, ItemStatus, ItemType, Message, User, ChatThread, Notification, Report, CarouselSlide } from './types';
import { supabaseService } from './services/supabaseService';

const AppContent: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [chats, setChats] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(() => {
    const cached = localStorage.getItem('hub_cached_slides');
    return cached ? JSON.parse(cached) : [];
  });
  const [cartItems, setCartItems] = useState<MarketplaceItem[]>([]);
  const [activeOtherUserId, setActiveOtherUserId] = useState<string | null>(null);
  const [viewDetailItemId, setViewDetailItemId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // App Branding State
  const [appName, setAppName] = useState(() => localStorage.getItem('hub_app_name') || 'NITR Hub');
  const [appLogo, setAppLogo] = useState(() => localStorage.getItem('hub_app_logo') || null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('hub_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [lastSeenMap, setLastSeenMap] = useState<{[key: string]: string}>(() => {
    const saved = localStorage.getItem('hub_last_seen');
    return saved ? JSON.parse(saved) : {};
  });

  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const processedChats = useMemo(() => {
    if (!currentUser) return chats;
    return chats.map(m => {
      const otherId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
      const seenTimestamp = lastSeenMap[otherId] || '1970-01-01';
      const isUnread = m.senderId !== currentUser.id && new Date(m.timestamp) > new Date(seenTimestamp);
      return { ...m, read: !isUnread };
    });
  }, [chats, currentUser, lastSeenMap]);

  const hasUnreadMessages = useMemo(() => {
    return processedChats.some(m => !m.read);
  }, [processedChats]);

  const syncCriticalData = async () => {
    if (!currentUser) return;
    try {
      const [fetchedItems, fetchedSlides] = await Promise.all([
        supabaseService.fetchItems(),
        supabaseService.fetchCarouselSlides()
      ]);
      if (fetchedItems) setItems(fetchedItems);
      if (fetchedSlides) {
        setCarouselSlides(fetchedSlides);
        localStorage.setItem('hub_cached_slides', JSON.stringify(fetchedSlides));
      }
    } catch (err) {
      console.warn("Critical sync failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncSecondaryData = async () => {
    if (!currentUser) return;
    try {
      const [fetchedMessages, fetchedNotifs] = await Promise.all([
        supabaseService.fetchMessages(currentUser.id),
        supabaseService.fetchNotifications(currentUser.id)
      ]);
      setChats(fetchedMessages);
      setNotifications(fetchedNotifs);
    } catch (err) {
      console.warn("Secondary sync failure:", err);
    }
  };

  const syncAllData = async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setIsRefreshing(true);
    await Promise.all([syncCriticalData(), syncSecondaryData()]);
    if (!silent) setIsRefreshing(false);
  };

  const syncSlides = async () => {
    const fetchedSlides = await supabaseService.fetchCarouselSlides();
    setCarouselSlides(fetchedSlides);
    localStorage.setItem('hub_cached_slides', JSON.stringify(fetchedSlides));
  };

  useEffect(() => {
    if (!currentUser) { 
      setIsLoading(false); 
      return; 
    }
    syncCriticalData().then(() => {
      syncSecondaryData();
    });
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;
    const fastSyncInterval = setInterval(async () => {
      try {
        const [fetchedMessages, fetchedNotifs] = await Promise.all([
          supabaseService.fetchMessages(currentUser.id),
          supabaseService.fetchNotifications(currentUser.id)
        ]);
        setChats(fetchedMessages);
        setNotifications(fetchedNotifs);
      } catch (err) {}
    }, 5000);
    return () => clearInterval(fastSyncInterval);
  }, [currentUser?.id]);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hub_user', JSON.stringify(user));
    await supabaseService.upsertProfile(user);
  };

  const handleUpdateUser = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hub_user', JSON.stringify(user));
    await supabaseService.upsertProfile(user);
  };

  const handleAddItem = async (newItem: MarketplaceItem) => {
    if (!currentUser) return;
    try {
      setItems(prev => [newItem, ...prev]);
      await supabaseService.addItem(newItem);
    } catch (err: any) {
      console.error("Failed to add item:", err.message);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<MarketplaceItem>) => {
    setItems(prev => prev.map(it => it.id === id ? {...it, ...updates} : it));
    await supabaseService.updateItemDetails(id, items.find(i=>i.id===id)!.type, updates);
  };

  const handleUpdateStatus = async (id: string, s: ItemStatus, r?: any) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.map(it => it.id === id ? {...it, status: s, recoveryRecord: r} : it));
    await supabaseService.updateItemStatus(id, item.type, s, r);
  };

  const handleDeleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: ItemStatus.DELETED } : it));
    await supabaseService.updateItemStatus(id, item.type, ItemStatus.DELETED);
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
      senderAvatarUrl: currentUser.avatarUrl,
      text,
      timestamp: new Date().toISOString()
    };
    setChats(prev => [...prev, newMessage]);
    await supabaseService.sendMessage(currentUser.id, recipientId, itemId, text);
  };

  const handleUpdateBranding = (name: string, logo: string | null) => {
    setAppName(name);
    setAppLogo(logo);
    localStorage.setItem('hub_app_name', name);
    if (logo) localStorage.setItem('hub_app_logo', logo);
    else localStorage.removeItem('hub_app_logo');
  };

  const chatThreads = useMemo(() => {
    if (!currentUser) return [];
    const groups: { [key: string]: Message[] } = {};
    processedChats.forEach(m => {
      const otherId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
      if (!groups[otherId]) groups[otherId] = [];
      groups[otherId].push(m);
    });
    return Object.entries(groups).map(([otherUserId, messages]) => {
      const otherMsg = messages.find(m => m.senderId === otherUserId);
      const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const seller = items.find(i => i.posterId === otherUserId);
      return {
        otherUserId,
        otherUserName: otherMsg?.senderName || seller?.posterName || 'Student User',
        otherUserRollNumber: otherMsg?.senderRollNumber || seller?.posterCollegeId || 'Verified',
        otherUserAvatar: otherMsg?.senderAvatarUrl || seller?.posterAvatarUrl,
        messages: sortedMessages
      } as ChatThread;
    }).sort((a, b) => new Date(b.messages[b.messages.length - 1].timestamp).getTime() - new Date(a.messages[a.messages.length - 1].timestamp).getTime());
  }, [processedChats, currentUser, items]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFE] flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-inner">
           <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Loading Hub Content</p>
      </div>
    );
  }

  if (!currentUser) return <AuthScreen onLogin={handleLogin} appName={appName} appLogo={appLogo} />;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <header className="px-6 py-4 flex justify-between items-center glass sticky top-0 z-40 border-b border-indigo-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 overflow-hidden">
             {appLogo ? (
               <img src={appLogo} className="w-full h-full object-cover" alt="Logo" />
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
             )}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tighter leading-none">{appName}</h1>
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Campus Marketplace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => syncAllData()} disabled={isRefreshing} className={`p-2 transition-all rounded-full hover:bg-indigo-50 ${isRefreshing ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`} title="Refresh Data">
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button onClick={() => setIsInboxOpen(true)} className={`relative p-2 transition-all rounded-full ${hasUnreadMessages ? 'text-indigo-600 animate-pulse bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Messages">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            {hasUnreadMessages && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>}
          </button>

          <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home items={items} carouselSlides={carouselSlides} onOpenChat={(id) => setActiveOtherUserId(items.find(i=>i.id===id)?.posterId || null)} onViewDetail={setViewDetailItemId} currentUser={currentUser} onRefreshSlides={syncSlides} />} />
          <Route path="/marketplace" element={<Marketplace items={items.filter(i => i.type === ItemType.MARKETPLACE)} onUpdateStatus={handleUpdateStatus} onOpenChat={(id) => setActiveOtherUserId(items.find(i=>i.id===id)?.posterId || null)} onViewDetail={setViewDetailItemId} currentUser={currentUser} onAddToCart={(i) => setCartItems(prev => [...prev, i])} cartCount={cartItems.length} />} />
          <Route path="/lost-found" element={<LostAndFound items={items} onUpdateStatus={handleUpdateStatus} onOpenChat={(id) => setActiveOtherUserId(items.find(i=>i.id===id)?.posterId || null)} onViewDetail={setViewDetailItemId} currentUser={currentUser} />} />
          <Route path="/notifications" element={<Notifications notifications={notifications} onMarkRead={async (id) => { await supabaseService.markNotificationRead(id); setNotifications(n => n.map(x=>x.id===id?{...x,read:true}:x)); }} onClearAll={async () => { await supabaseService.clearNotifications(currentUser.id); setNotifications([]); }} onViewItem={setViewDetailItemId} />} />
          <Route path="/cart" element={<CartView cartItems={cartItems} onRemoveItem={(id) => setCartItems(c => c.filter(x=>x.id!==id))} onOpenChat={(id) => setActiveOtherUserId(items.find(i=>i.id===id)?.posterId || null)} onViewDetail={setViewDetailItemId} />} />
          <Route path="/my-listings" element={<MyListings items={items.filter(i => i.posterId === currentUser.id)} onDelete={handleDeleteItem} currentUser={currentUser} onViewDetail={setViewDetailItemId} />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass px-6 py-4 flex justify-around items-center z-50 rounded-t-[2rem] border-t border-indigo-50/50">
        <NavItem to="/" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Home" active={location.pathname === '/'} />
        <NavItem to="/marketplace" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" label="Market" active={location.pathname === '/marketplace'} />
        <button onClick={() => setIsUploadOpen(true)} className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 -mt-10 border-4 border-[#FDFCFE] animate-pulse-soft"><svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></button>
        <NavItem to="/lost-found" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" label="L&F" active={location.pathname === '/lost-found'} />
        <button onClick={() => setIsProfileOpen(true)} className={`flex flex-col items-center gap-1.5 transition-all ${isProfileOpen ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>
          <div className={`w-6 h-6 rounded-full border-2 ${isProfileOpen ? 'border-indigo-600' : 'border-slate-300'} flex items-center justify-center`}><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
          <span className="text-[8px] font-black uppercase tracking-widest">Me</span>
        </button>
      </nav>

      {activeOtherUserId && <ChatModal otherUserId={activeOtherUserId} otherUser={chatThreads.find(t => t.otherUserId === activeOtherUserId)} messages={chatThreads.find(t => t.otherUserId === activeOtherUserId)?.messages || []} onClose={() => setActiveOtherUserId(null)} onSend={(text) => handleSendMessage(activeOtherUserId, text, null)} currentUser={currentUser} />}
      {viewDetailItemId && items.find(i => i.id === viewDetailItemId) && (
        <ItemDetailModal item={items.find(i => i.id === viewDetailItemId)!} onClose={() => setViewDetailItemId(null)} onMessage={() => { const item = items.find(i=>i.id===viewDetailItemId); if(item) { setViewDetailItemId(null); setActiveOtherUserId(item.posterId); } }} onCheckout={async (order) => { await supabaseService.createOrder(order); }} onReport={async (r) => await supabaseService.submitReport(r)} currentUser={currentUser} onAddToCart={(i) => setCartItems(p=>[...p,i])} onUpdateStatus={handleUpdateStatus} onUpdateItem={handleUpdateItem} onDeleteListing={handleDeleteItem} />
      )}
      {isInboxOpen && <InboxModal threads={chatThreads} onClose={() => setIsInboxOpen(false)} onSelectThread={(id) => { setActiveOtherUserId(id); setIsInboxOpen(false); }} currentUser={currentUser} />}
      {isProfileOpen && <UserProfileModal user={currentUser} onClose={() => setIsProfileOpen(false)} onUpdateUser={handleUpdateUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem('hub_user'); setIsProfileOpen(false); }} onOpenBranding={() => { setIsProfileOpen(false); setIsBrandingOpen(true); }} />}
      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onAdd={handleAddItem} type={ItemType.MARKETPLACE} currentUser={currentUser} />}
      {isBrandingOpen && <BrandingModal onClose={() => setIsBrandingOpen(false)} currentName={appName} currentLogo={appLogo} onUpdate={handleUpdateBranding} />}
    </div>
  );
};

const NavItem: React.FC<{ to: string, icon: string, label: string, active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'nav-active text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </Link>
);

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
