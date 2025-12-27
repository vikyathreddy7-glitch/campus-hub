
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceItem, User, ItemStatus, ItemType } from '../types';
import { supabaseService } from '../services/supabaseService';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onUpdateUser, onLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({
    name: user.name,
    year: user.year,
    branch: user.branch,
    collegeId: user.collegeId,
  });
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const updatedUser = { ...user, avatarUrl: base64 };
        
        onUpdateUser(updatedUser);
        localStorage.setItem('hub_user', JSON.stringify(updatedUser));
        
        try {
          await supabaseService.upsertProfile(updatedUser);
        } catch (err) {
          console.error("Failed to sync new avatar to Supabase", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleNotifications = () => {
    const updatedUser = { ...user, notificationsEnabled: !user.notificationsEnabled };
    onUpdateUser(updatedUser);
    localStorage.setItem('hub_user', JSON.stringify(updatedUser));
  };

  const handleSave = async () => {
    if (editData.collegeId && editData.collegeId.length !== 9) {
      setError('Roll Number must be 9 characters.');
      return;
    }

    setIsSaving(true);
    const updatedUser = {
      ...user,
      name: editData.name || user.name,
      year: editData.year || user.year,
      branch: editData.branch || user.branch,
      collegeId: (editData.collegeId || user.collegeId).toUpperCase(),
    };

    try {
      await supabaseService.upsertProfile(updatedUser);
      onUpdateUser(updatedUser);
      localStorage.setItem('hub_user', JSON.stringify(updatedUser));
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to sync profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setEditData({
        name: user.name,
        year: user.year,
        branch: user.branch,
        collegeId: user.collegeId,
      });
      setIsEditing(true);
      setError(null);
    }
  };

  const goToMyListings = () => {
    onClose();
    navigate('/my-listings');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="relative h-32 bg-blue-600 flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-lg rounded-full flex items-center justify-center text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 pb-6 -mt-12 relative z-10 flex-grow overflow-y-auto">
          <div className="flex items-end gap-4 mb-8">
            <div className="relative group">
              <div 
                className={`w-28 h-28 rounded-3xl bg-white p-1.5 shadow-xl transition-all ${isEditing ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`} 
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-4xl overflow-hidden border border-blue-100 relative">
                  {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : user.name.charAt(0)}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="pb-2 flex-grow">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="relative">
                    <input 
                      className="text-xl font-black text-black tracking-tight bg-gray-50 border border-gray-100 rounded-xl px-3 py-1 w-full focus:ring-2 focus:ring-blue-100 outline-none"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="relative">
                    <input 
                      className={`text-sm font-bold bg-gray-50 border ${error ? 'border-red-300' : 'border-gray-100'} rounded-xl px-3 py-1 w-full focus:ring-2 focus:ring-blue-100 outline-none uppercase text-black`}
                      value={editData.collegeId}
                      maxLength={9}
                      onChange={(e) => setEditData({ ...editData, collegeId: e.target.value.toUpperCase() })}
                      placeholder="College Roll ID"
                    />
                    {error && <p className="text-[9px] font-black text-red-500 uppercase mt-1 ml-1">{error}</p>}
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h2>
                  <p className="text-sm font-bold text-gray-400">ID: {user.collegeId}</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section 
              onClick={goToMyListings}
              className="bg-blue-600 p-6 rounded-[2rem] border border-blue-500 shadow-xl shadow-blue-100 cursor-pointer active:scale-[0.98] transition-all group"
            >
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📦</div>
                   <div>
                     <h3 className="text-base font-black text-white tracking-tight">Manage My Listings</h3>
                     <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Active & Sold History</p>
                   </div>
                 </div>
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                 </svg>
               </div>
            </section>

            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">App Settings</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg">🔔</div>
                  <div>
                    <p className="text-sm font-black text-gray-800 tracking-tight">Global Notifications</p>
                    <p className="text-[10px] font-bold text-gray-400">Receive alerts for new listings</p>
                  </div>
                </div>
                <button 
                  onClick={toggleNotifications}
                  className={`w-14 h-8 rounded-full transition-all relative ${user.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${user.notificationsEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 bg-white">
          <button 
            onClick={handleEditToggle}
            disabled={isSaving}
            className={`flex-1 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2 ${
              isEditing ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'
            }`}
          >
             {isSaving ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Saving...
               </>
             ) : (
               isEditing ? 'Save Changes' : 'Edit Profile'
             )}
          </button>
          {!isEditing && (
            <button 
              onClick={onLogout}
              className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all"
            >
              Sign Out
            </button>
          )}
          {isEditing && !isSaving && (
            <button 
              onClick={() => setIsEditing(false)} 
              className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
