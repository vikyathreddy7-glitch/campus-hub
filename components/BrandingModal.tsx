
import React, { useState, useRef } from 'react';

interface BrandingModalProps {
  onClose: () => void;
  currentName: string;
  currentLogo: string | null;
  onUpdate: (name: string, logo: string | null) => void;
}

const BrandingModal: React.FC<BrandingModalProps> = ({ onClose, currentName, currentLogo, onUpdate }) => {
  const [name, setName] = useState(currentName);
  const [logo, setLogo] = useState<string | null>(currentLogo);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(name, logo);
      setIsSaving(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg h-auto rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-8 pb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">App Identity</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Branding & Customization</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-[2rem] bg-indigo-50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-100 transition-all overflow-hidden relative shadow-sm"
              >
                {logo ? (
                  <>
                    <img src={logo} className="w-full h-full object-cover" alt="Custom Logo" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest transition-opacity">Change</div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-3xl mb-1 block">🖼️</span>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-tight">Upload Logo Image</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </div>
              {logo && (
                <button onClick={() => setLogo(null)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors">Reset to Default</button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">App Name</label>
                <input 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm" 
                  placeholder="e.g. Campus Hub" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving || !name.trim()}
                  className="flex-1 bg-[#1E1B4B] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply Identity'}
                </button>
                <button onClick={onClose} className="px-8 bg-gray-100 text-gray-500 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingModal;
