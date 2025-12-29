
import React, { useState } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  appName: string;
  appLogo: string | null;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, appName, appLogo }) => {
  const [view, setView] = useState<'splash' | 'login'>('splash');
  const [formData, setFormData] = useState({
    name: '',
    collegeId: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDeterministicId = (collegeId: string): string => {
    const cleanUser = collegeId.toUpperCase().trim();
    const baseStr = "nitr-hub-" + cleanUser;
    let hash = 0;
    for (let i = 0; i < baseStr.length; i++) {
      hash = ((hash << 5) - hash) + baseStr.charCodeAt(i);
      hash |= 0;
    }
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    const userHex = cleanUser.split('').map(c => c.charCodeAt(0).toString(16)).join('').substring(0, 12).padEnd(12, '0');
    return `${hexHash}-4000-8000-0000-${userHex}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.collegeId.length < 3) {
      setError('College ID must be at least 3 characters.');
      return;
    }
    
    const expectedEmail = `${formData.collegeId.toLowerCase()}@nitrkl.ac.in`;
    if (formData.email !== expectedEmail) {
      setError('Email synchronization error. Please re-enter College ID.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const cid = formData.collegeId.toUpperCase();
      const newUser: User = {
        id: generateDeterministicId(cid),
        name: formData.name,
        collegeId: cid,
        email: formData.email,
        phone: '+91 00000 00000',
        year: 'Current Student',
        branch: 'NIT Rourkela',
        notificationsEnabled: true,
      };
      onLogin(newUser);
      setIsLoading(false);
    }, 1200);
  };

  const handleCollegeIdChange = (val: string) => {
    const cid = val.toUpperCase().trim();
    setFormData({
      ...formData,
      collegeId: cid,
      email: cid ? `${cid.toLowerCase()}@nitrkl.ac.in` : ''
    });
  };

  if (view === 'splash') {
    return (
      <div className="fixed inset-0 bg-[#1E1B4B] flex flex-col items-center justify-center p-8 z-[200]">
        <div className="w-full max-w-md text-center space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl overflow-hidden">
              {appLogo ? (
                <img src={appLogo} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tighter">{appName}</h1>
              <p className="text-indigo-200 font-bold text-sm uppercase tracking-[0.2em]">Community Gateway</p>
            </div>
          </div>
          <button onClick={() => setView('login')} className="w-full bg-white text-[#1E1B4B] py-5 rounded-[2rem] font-black text-lg active:scale-95 transition-all shadow-xl">Get Started</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FAF9FF] flex flex-col z-[200] overflow-y-auto">
      <div className="p-8 max-w-md mx-auto w-full space-y-10 py-16">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Identify Yourself</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Welcome to {appName}</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-black text-red-600 uppercase tracking-widest animate-pulse">{error}</div>}
            
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Name</label>
              <input required className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm group-focus-within:border-indigo-200" placeholder="Your Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">College ID</label>
              <input required className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 outline-none uppercase focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm group-focus-within:border-indigo-200" placeholder="e.g. 121CS0001" value={formData.collegeId} onChange={e => handleCollegeIdChange(e.target.value)} />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Campus Email</label>
              <div className="relative">
                <input readOnly type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-400 outline-none cursor-not-allowed italic" placeholder="collegeid@nitrkl.ac.in" value={formData.email} />
                {formData.email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-indigo-500 bg-white/80 backdrop-blur-sm py-1 px-2 rounded-lg">
                    <span className="text-[8px] font-black uppercase tracking-tight">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={isLoading || !formData.collegeId || !formData.name} className="w-full bg-[#1E1B4B] text-white py-5 rounded-[2rem] font-black text-lg active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-100">
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Enter Hub'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
