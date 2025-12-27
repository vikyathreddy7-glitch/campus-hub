
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
import AuthScreen from './components/AuthScreen';
import { MarketplaceItem, ItemStatus, ItemType, Message, User, ChatThread, Notification, Order } from './types';
import { supabaseService } from './services/supabaseService';
import { MOCK_ITEMS } from './constants';

const AppContent: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [chats, setChats] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewDetailItemId, setViewDetailItemId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('hub_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const loadInitialData = async () => {
      try {
        const fetchedItems = await supabaseService.fetchItems();
        const fetchedMessages = await supabaseService.fetchMessages();
        
        if (fetchedItems !== null && fetchedItems.length > 0) {
          setItems(fetchedItems);
          localStorage.setItem('hub_cached_items', JSON.stringify(fetchedItems));
        } else {
          const cachedItems = localStorage.getItem('hub_cached_items');
          if (cachedItems) {
            setItems(JSON.parse(cachedItems));
          } else {
            setItems(MOCK_ITEMS);
            localStorage.setItem('hub_cached_items', JSON.stringify(MOCK_ITEMS));
          }
        }

        if (fetchedMessages !== null) {
          setChats(fetchedMessages);
          localStorage.setItem('hub_cached_messages', JSON.stringify(fetchedMessages));
        } else {
          const cachedMessages = localStorage.getItem('hub_cached_messages');
          if (cachedMessages) setChats(JSON.parse(cachedMessages));
        }
      } catch (err) {
        console.error("Critical failure during initial data load:", err);
        const cachedItems = localStorage.getItem('hub_cached_items');
        if (cachedItems) setItems(JSON.parse(cachedItems));
        else setItems(MOCK_ITEMS);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    setNotifications([
      {
        id: 'n1',
        title: 'Welcome to Campus Hub',
        message: 'Start exploring items listed by your fellow students.',
        type: ItemType.MARKETPLACE,
        timestamp: new Date().toISOString(),
        itemId: '1',
        read: false
      }
    ]);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hub_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hub_user');
    setIsProfileOpen(false);
  };

  const handleAddItem = async (newItem: MarketplaceItem) => {
    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    localStorage.setItem('hub_cached_items', JSON.stringify(updatedItems));

    try {
      await supabaseService.addItem(newItem);
    } catch (err) {
      console.warn("Database failed to sync, item saved locally only.");
    }
  };

  const handleUpdateStatus = async (id: string, s: ItemStatus, r?: any) => {
    const updatedItems = items.map(it => it.id === id ? {...it, status: s, recoveryRecord: r} : it);
    setItems(updatedItems);
    localStorage.setItem('hub_cached_items', JSON.stringify(updatedItems));

    try {
      await supabaseService.updateItemStatus(id, s, r);
    } catch (err) {
      console.warn("Status update failed to sync with database.");
    }
  };

  const handleSendMessage = async (itemId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      itemId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toISOString()
    };
    
    const updatedChats = [...chats, newMessage];
    setChats(updatedChats);
    localStorage.setItem('hub_cached_messages', JSON.stringify(updatedChats));

    try {
      await supabaseService.sendMessage(newMessage);
    } catch (err) {
      console.warn("Message failed to sync with database.");
    }
  };

  const handleCheckout = async (order: Order) => {
    try {
      await supabaseService.createOrder(order);
      // Optional: Mark item as sold if it's a marketplace item
      // await handleUpdateStatus(order.itemId, ItemStatus.SOLD); 
      alert("Order successfully placed!");
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed. Please try again.");
    }
  };

  const receivedMessagesCount = useMemo(() => {
    if (!currentUser) return 0;
    return chats.filter(m => m.senderId !== currentUser.id).length;
  }, [chats, currentUser]);

  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser) return 0;
    return currentUser.notificationsEnabled ? notifications.filter(n => !n.read).length : 0;
  }, [notifications, currentUser]);

  const chatThreads = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    chats.forEach(m => {
      if (!groups[m.itemId]) groups[m.itemId] = [];
      groups[m.itemId].push(m);
    });

    return Object.entries(groups).map(([itemId, messages]) => {
      const item = items.find(i => i.id === itemId);
      return {
        itemId,
        itemTitle: item?.title || 'Unknown Item',
        itemImageUrl: item?.imageUrl,
        messages: messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      } as ChatThread;
    }).sort((a, b) => {
      const aTime = new Date(a.messages[0].timestamp).getTime();
      const bTime = new Date(b.messages[0].timestamp).getTime();
      return bTime - aTime;
    });
  }, [chats, items]);

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">Connecting to Campus Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <header className="px-6 py-4 flex justify-between items-center border-b border-gray-50 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#5B7CB8] rounded-xl flex items-center justify-center text-white shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-800 tracking-tight leading-none">Campus</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsInboxOpen(true)} 
            className="relative text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            {receivedMessagesCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></span>}
          </button>
          <Link to="/notifications" className="relative text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {unreadNotificationsCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>}
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home items={items} onOpenChat={setActiveChatId} onViewDetail={setViewDetailItemId} />} />
          <Route 
            path="/marketplace" 
            element={
              <Marketplace 
                items={items.filter(i => i.type === ItemType.MARKETPLACE)} 
                onAddItem={handleAddItem}
                onUpdateStatus={handleUpdateStatus}
                onOpenChat={setActiveChatId}
                onViewDetail={setViewDetailItemId}
                currentUser={currentUser}
              />
            } 
          />
          <Route 
            path="/lost-found" 
            element={
              <LostAndFound 
                items={items} 
                onAddItem={handleAddItem}
                onUpdateStatus={handleUpdateStatus}
                onOpenChat={setActiveChatId}
                onViewDetail={setViewDetailItemId}
                currentUser={currentUser}
              />
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <Notifications 
                notifications={currentUser.notificationsEnabled ? notifications : []}
                onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
                onClearAll={() => setNotifications([])}
                onViewItem={setViewDetailItemId}
              />
            } 
          />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex justify-around items-center z-50">
        <NavItem to="/" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Home" active={location.pathname === '/'} />
        <NavItem to="/marketplace" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" label="Market" active={location.pathname === '/marketplace'} />
        <NavItem to="/lost-found" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" label="L&F" active={location.pathname === '/lost-found'} />
        <button onClick={() => setIsProfileOpen(true)} className={`flex flex-col items-center gap-1 ${isProfileOpen ? 'text-[#5B7CB8]' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full border-2 ${isProfileOpen ? 'border-[#5B7CB8]' : 'border-gray-200'} flex items-center justify-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tight">Profile</span>
        </button>
      </nav>

      {activeChatId && items.find(i => i.id === activeChatId) && (
        <ChatModal 
          itemId={activeChatId}
          item={items.find(i => i.id === activeChatId)!}
          messages={chats.filter(m => m.itemId === activeChatId)}
          onClose={() => setActiveChatId(null)}
          onSend={handleSendMessage}
          currentUser={currentUser}
        />
      )}
      {viewDetailItemId && items.find(i => i.id === viewDetailItemId) && (
        <ItemDetailModal 
          item={items.find(i => i.id === viewDetailItemId)!}
          onClose={() => setViewDetailItemId(null)}
          onMessage={() => { setViewDetailItemId(null); setActiveChatId(viewDetailItemId); }}
          onCheckout={handleCheckout}
          currentUser={currentUser}
        />
      )}
      {isInboxOpen && (
        <InboxModal 
          threads={chatThreads}
          onClose={() => setIsInboxOpen(false)}
          onSelectThread={(id) => { setActiveChatId(id); setIsInboxOpen(false); }}
        />
      )}
      {isProfileOpen && (
        <UserProfileModal 
          user={currentUser}
          items={items.filter(i => i.posterId === currentUser.id)}
          onClose={() => setIsProfileOpen(false)}
          onUpdateUser={setCurrentUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{ to: string, icon: string, label: string, active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 ${active ? 'text-[#5B7CB8]' : 'text-gray-400'}`}>
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
    <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
  </Link>
);

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
