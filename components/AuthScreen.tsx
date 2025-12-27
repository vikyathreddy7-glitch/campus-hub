
import React, { useState } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'splash' | 'login'>('splash');
  const [formData, setFormData] = useState({
    name: '',
    collegeId: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generates a deterministic UUID based on the roll number.
   * This prevents duplicate key errors in the database by ensuring
   * one Roll Number always maps to one UUID.
   */
  const generateDeterministicId = (rollNumber: string): string => {
    const cleanRoll = rollNumber.toUpperCase().trim();
    // Use a fixed prefix for NITR Hub users
    const prefix = "nitr-hub-";
    const baseStr = prefix + cleanRoll;
    
    // Simple hash to create a hex string
    let hash = 0;
    for (let i = 0; i < baseStr.length; i++) {
      hash = ((hash << 5) - hash) + baseStr.charCodeAt(i);
      hash |= 0;
    }
    
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    // Format: 8-4-4-4-12 (standard UUID structure)
    // We'll fill the rest with a deterministic pattern based on the roll number
    const rollHex = cleanRoll.split('').map(c => c.charCodeAt(0).toString(16)).join('').substring(0, 12).padEnd(12, '0');
    
    return `${hexHash}-4000-8000-0000-${rollHex}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.collegeId.length !== 9) {
      setError('Roll Number must be exactly 9 characters (e.g., 121CS0001)');
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const roll = formData.collegeId.toUpperCase();
      const newUser: User = {
        id: generateDeterministicId(roll), // Now deterministic!
        name: formData.name,
        collegeId: roll,
        email: formData.email || `${roll.toLowerCase()}@nitrkl.ac.in`,
        phone: '+91 00000 00000',
        year: 'Current Year',
        branch: 'NIT Rourkela',
        notificationsEnabled: true,
        avatarUrl: undefined
      };
      onLogin(newUser);
      setIsLoading(false);
    }, 1200);
  };

  if (view === 'splash') {
    return (
      <div className="fixed inset-0 bg-[#1E1B4B] flex flex-col items-center justify-center p-8 z-[200]">
        <div className="w-full max-w-md text-center space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-[#5B7CB8] rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter">Campus Hub</h1>
              <p className="text-blue-300/60 font-bold uppercase tracking-[0.3em] text-xs mt-2">NIT Rourkela</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-blue-100/70 text-lg font-medium leading-relaxed max-w-xs mx-auto">
              Your centralized gateway to the campus marketplace and community.
            </p>
            <button 
              onClick={() => setView('login')}
              className="w-full bg-white text-[#1E1B4B] py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-50 transition-all active:scale-95"
            >
              Get Started
            </button>
            <p className="text-blue-300/40 text-[10px] font-bold uppercase tracking-widest">
              Secured with University SSO
            </p>
          </div>
        </div>
        
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FAF9FF] flex flex-col z-[200] overflow-y-auto">
      <div className="p-8 max-w-md mx-auto w-full space-y-10 py-16">
        <header className="space-y-2">
          <button 
            onClick={() => setView('splash')}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Login</h2>
          <p className="text-gray-500 font-bold">Use your campus credentials to access the hub.</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-black text-red-600 uppercase tracking-widest leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
              <input 
                required
                type="text"
                placeholder="Rahul Sharma"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1 flex justify-between">
                <span>Roll Number</span>
                <span className={formData.collegeId.length === 9 ? 'text-green-500' : 'text-gray-300'}>
                  {formData.collegeId.length}/9
                </span>
              </label>
              <input 
                required
                type="text"
                maxLength={9}
                placeholder="121CS0001"
                className={`w-full bg-white border ${formData.collegeId.length > 0 && formData.collegeId.length !== 9 ? 'border-red-200' : 'border-gray-100'} rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm uppercase`}
                value={formData.collegeId}
                onChange={e => setFormData({...formData, collegeId: e.target.value.toUpperCase()})}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Campus Email (Optional)</label>
              <input 
                type="email"
                placeholder="name@nitrkl.ac.in"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1E1B4B] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-900/10 hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <footer className="text-center pt-8">
          <p className="text-gray-400 text-xs font-medium">
            By signing in, you agree to our <span className="text-blue-600 font-bold">Community Guidelines</span> and <span className="text-blue-600 font-bold">Privacy Policy</span>.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthScreen;
