import React, { useState } from 'react';
import { LayoutDashboard, Wallet, MessageSquare, Zap, X, Bot, LogOut, ExternalLink, Users, TrendingUp, Lock, LogIn, Cpu, Gift } from 'lucide-react';
import { Tab, NavigationItem } from '../types';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  activePlan: string | null;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  userEmail?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen, activePlan, isLoggedIn, onLoginClick }) => {

  const [shakingId, setShakingId] = useState<string | null>(null);

  const menuItems: NavigationItem[] = [
    { id: Tab.WELCOME, label: 'Benvenuto', icon: LayoutDashboard },
    { id: Tab.ANALYZER, label: 'Crypto Analyzer Pro', icon: Bot },
    { id: Tab.EXCHANGE, label: 'Config. Exchange', icon: Wallet },
    { id: Tab.TELEGRAM, label: 'Config. Telegram', icon: MessageSquare },
    { id: Tab.ACTIVATION, label: 'Attiva', icon: Zap },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab(Tab.WELCOME);
    toast.success('Disconnessione effettuata');
  };

  const triggerShake = (id: string) => {
    setShakingId(id);
    setTimeout(() => setShakingId(null), 500);
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-72 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out will-change-transform
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `} style={{ transform: isMobileOpen ? 'translateX(0) translateZ(0)' : 'translateX(-100%) translateZ(0)' }}>
        {/* HEADER LOGO */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <picture>
              {/* ✅ Modern formats first */}
              <source srcSet="/logo-circle.webp" type="image/webp" />
              <source srcSet="/logo-circle.avif" type="image/avif" />

              {/* ✅ Fallback JPEG */}
              <img
                src="/logo-circle.jpg"
                alt="Logo CryptoBot Elite"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            </picture>
            <div className="hidden w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
              <Zap className="text-white" />
            </div>

            <div>
              <h1 className="font-bold text-white text-lg leading-tight">CryptoBot Elite</h1>
              <p className="text-slate-500 text-xs font-medium">Pannello Cliente v2.0</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* MENU NAVIGAZIONE */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isShaking = shakingId === item.id;

            let isLocked = false;
            const plan = activePlan ? activePlan.toUpperCase() : "";

            if (item.id !== Tab.WELCOME) {
              if (!isLoggedIn) {
                isLocked = true;
              } else {
                if (item.id === Tab.ANALYZER) {
                  if (!plan.includes('ANALYZER')) isLocked = true;
                }
                else if (['EXCHANGE', 'TELEGRAM', 'ACTIVATION'].includes(item.id)) {
                  if (!plan.includes('BTC') && !plan.includes('DUAL') && !plan.includes('SINGLE')) isLocked = true;
                }
              }
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLocked) {
                    triggerShake(item.id);
                    if (!isLoggedIn) {
                      toast.error("Effettua il login per accedere", { icon: '👤' });
                      setTimeout(onLoginClick, 500);
                    } else {
                      toast.error("Acquista una licenza per sbloccare!", { icon: '🔒' });
                    }
                  } else {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors duration-75 group relative
                  ${isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                  ${isLocked ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}
                  ${isShaking ? 'animate-shake bg-red-500/10 text-red-400 border border-red-500/30' : ''} 
                `}
              >
                <Icon size={20} className={isActive ? 'text-emerald-500' : (isShaking ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300')} />
                <span className="font-medium text-sm">{item.label}</span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                )}

                {isLocked && (
                  <Lock size={14} className={`ml-auto ${isShaking ? 'text-red-400' : 'text-slate-600'}`} />
                )}
              </button>
            );
          })}

          {/* --- INFO PRODOTTI (MODIFICATO: STILE NEON VERDE UNIFORME) --- */}
          <div className="pt-6 mt-4 border-t border-slate-800/50 space-y-4">

            <p className="px-4 text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Info Prodotti</p>

            <div className="px-3 space-y-3">

              {/* 1. ANALYZER PRO - STILE NEON VERDE */}
              <div className="relative overflow-hidden rounded-xl p-3 border border-emerald-500/30 bg-slate-900/50 shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:border-emerald-500/60 transition-all group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"><Bot size={14} /></div>
                    <span className="text-white font-bold text-xs tracking-wide drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]">ANALYZER PRO</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Analisi istituzionale su <span className="text-emerald-400 font-medium">Telegram</span>.
                  </p>
                </div>
              </div>

              {/* 2. BOT AUTOMATICI - MODIFICATO BITGET */}
              <div className="relative overflow-hidden rounded-xl p-3 border border-emerald-500/30 bg-slate-900/50 shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:border-emerald-500/60 transition-all group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"><Cpu size={14} /></div>
                    <span className="text-white font-bold text-xs tracking-wide drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]">BOT AUTOMATICI</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Bot automatici trading algoritmico 24 h su 24 su <span className="text-emerald-400 font-medium">Bitget</span>.
                  </p>
                </div>
              </div>

              {/* 3. BONUS ATTIVO - LINK MODIFICATO BITGET */}
              <a href="https://share.bitget.com/u/DRPUAUPG" target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden rounded-xl p-3 border border-emerald-500/30 bg-slate-900/50 shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:border-emerald-500/60 transition-all group">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"><Gift size={14} /></div>
                      <span className="text-white font-bold text-xs tracking-wide drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]">BONUS ATTIVO</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">0,1% Commissioni Maker</p>
                  </div>
                  <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400"><ExternalLink size={14} /></div>
                </div>
              </a>
            </div>

            {/* LINK SUPPORTO */}
            <div className="px-3 space-y-2">
              <a href="https://t.me/MauroilFurianoCryotoGalassia" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs font-medium bg-slate-900/50">
                <Users size={14} /> Supporto Community
              </a>

              <a href="https://t.me/cryptoanalyzer_officialbot" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs font-medium bg-slate-900/50">
                <MessageSquare size={14} /> Servizio Clienti
              </a>
            </div>

          </div>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={18} /> <span className="font-medium text-sm">Disconnetti</span>
            </button>
          ) : (
            <button onClick={() => { setIsMobileOpen(false); onLoginClick(); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all font-bold">
              <LogIn size={18} /> <span>Accedi / Registrati</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;