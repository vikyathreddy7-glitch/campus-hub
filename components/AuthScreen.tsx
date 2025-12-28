
import React, { useState } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'splash' | 'login'>('splash');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDeterministicId = (username: string): string => {
    const cleanUser = username.toUpperCase().trim();
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
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    
    // Final check for email format safety
    const expectedEmail = `${formData.username.toLowerCase()}@nitrkl.ac.in`;
    if (formData.email !== expectedEmail) {
      setError('Email synchronization error. Please re-enter username.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const uname = formData.username.toUpperCase();
      // Fix: 'username' does not exist on type 'User', changed to 'collegeId' to match interface definition
      const newUser: User = {
        id: generateDeterministicId(uname),
        name: formData.name,
        collegeId: uname,
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

  const handleUsernameChange = (val: string) => {
    const uname = val.toUpperCase().trim();
    setFormData({
      ...formData,
      username: uname,
      email: uname ? `${uname.toLowerCase()}@nitrkl.ac.in` : ''
    });
  };

  if (view === 'splash') {
    return (
      <div className="fixed inset-0 bg-[#1E1B4B] flex flex-col items-center justify-center p-8 z-[200]">
        <div className="w-full max-w-md text-center space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-[#5B7CB8] rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Campus Hub</h1>
          </div>
          <button onClick={() => setView('login')} className="w-full bg-white text-[#1E1B4B] py-5 rounded-[2rem] font-black text-lg active:scale-95 transition-all">Get Started</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FAF9FF] flex flex-col z-[200] overflow-y-auto">
      <div className="p-8 max-w-md mx-auto w-full space-y-10 py-16">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-black text-red-600 uppercase tracking-widest">{error}</div>}
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
              <input required className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Student Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Username (Roll No/Unique ID)</label>
              <input 
                required 
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 outline-none uppercase focus:ring-2 focus:ring-indigo-100 transition-all" 
                placeholder="e.g. 121CS0001" 
                value={formData.username} 
                onChange={e => handleUsernameChange(e.target.value)} 
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Campus Email (Auto-Generated)</label>
              <div className="relative">
                <input 
                  readOnly
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-400 outline-none cursor-not-allowed italic" 
                  placeholder="username@nitrkl.ac.in" 
                  value={formData.email} 
                />
                {formData.email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-indigo-500">
                    <span className="text-[9px] font-black uppercase tracking-tight">Verified</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-[9px] text-gray-400 mt-2 ml-1">Email is locked to your unique campus ID format.</p>
            </div>
          </div>
          <button type="submit" disabled={isLoading || !formData.username} className="w-full bg-[#1E1B4B] text-white py-5 rounded-[2rem] font-black text-lg active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
