import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, Lock, ShieldCheck, CreditCard } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import ChangePasswordModal from './ChangePasswordModal';

interface UserMenuProps {
  email: string;
  activePlan: string | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ email, activePlan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Chiude il menu se clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Disconnesso');
    window.location.reload(); // Ricarica per pulire lo stato
  };

  // Determina lo stato del piano per la visualizzazione
  const planDisplay = activePlan || "Nessun Piano Attivo";
  const isPro = !!activePlan;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
      >
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold text-white">{email.split('@')[0]}</p>
          <p className="text-[10px] text-slate-400">{isPro ? 'Membro Premium' : 'Utente Free'}</p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isPro ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <User size={20} />
        </div>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-60 animate-in fade-in zoom-in-95 slide-in-from-top-2">
          
          {/* Info Utente */}
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Account</p>
            <p className="text-sm text-white font-medium truncate">{email}</p>
          </div>

          {/* Info Piano */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/30">
             <p className="text-xs text-slate-500 uppercase font-bold mb-2">Il tuo Piano</p>
             <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={isPro ? "text-emerald-400" : "text-slate-500"} />
                <span className={`text-sm font-bold ${isPro ? "text-emerald-400" : "text-slate-400"}`}>
                    {planDisplay}
                </span>
             </div>
             {isPro && <p className="text-[10px] text-emerald-500/70 mt-1 pl-6">Licenza Lifetime Attiva</p>}
          </div>

          {/* Azioni */}
          <div className="p-2">
            <button 
                onClick={() => { setIsPasswordModalOpen(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
            >
                <Lock size={16} /> Cambia Password
            </button>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
                <LogOut size={16} /> Disconnetti
            </button>
          </div>
        </div>
      )}

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default UserMenu;