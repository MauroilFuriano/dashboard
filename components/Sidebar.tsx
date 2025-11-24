import React from 'react';
import { LayoutDashboard, Wallet, MessageSquare, Zap, X, LogOut, ExternalLink, Users, TrendingUp } from 'lucide-react';
import { Tab, NavigationItem } from '../types';
import { supabase } from '../supabase';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) => {
  
  const menuItems: NavigationItem[] = [
    { id: Tab.WELCOME, label: 'Benvenuto', icon: LayoutDashboard },
    { id: Tab.EXCHANGE, label: 'Config. Exchange', icon: Wallet },
    { id: Tab.TELEGRAM, label: 'Config. Telegram', icon: MessageSquare },
    { id: Tab.ACTIVATION, label: 'Attivazione', icon: Zap },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-72 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* HEADER LOGO */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <CheckCircleIcon />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">CryptoBot Elite</h1>
              <p className="text-slate-500 text-xs font-medium">Pannello Cliente v2.0</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* MENU NAVIGAZIONE */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-emerald-500' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                )}
              </button>
            );
          })}

          {/* --- SEZIONE COMMUNITY & PARTNER (NUOVA) --- */}
          <div className="pt-6 mt-4 border-t border-slate-800/50">
            <p className="px-4 text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-wider">Community & Supporto</p>
            
            <div className="px-3 space-y-3">
                {/* Box Informativo MEXC */}
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                    <p className="text-slate-400 leading-relaxed">
                        I nostri bot sono ottimizzati e testati per operare esclusivamente su:
                    </p>
                    <div className="flex items-center gap-2 font-bold text-white">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        MEXC Exchange
                    </div>
                </div>

                {/* Link Telegram */}
                <a 
                    href="https://t.me/MauroilFurianoCryotoGalassia" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all group"
                >
                    <Users size={18} />
                    <div className="text-left">
                        <div className="text-xs font-bold">Gruppo Telegram</div>
                        <div className="text-[10px] opacity-70">Supporto & News</div>
                    </div>
                    <ExternalLink size={14} className="ml-auto opacity-50 group-hover:opacity-100" />
                </a>

                {/* Link MEXC */}
                <a 
                    href="https://promote.mexc.com/r/b2QRLbsk" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all group"
                >
                    <TrendingUp size={18} />
                    <div className="text-left">
                        <div className="text-xs font-bold">Iscriviti a MEXC</div>
                        <div className="text-[10px] opacity-70">Bonus Commissioni</div>
                    </div>
                    <ExternalLink size={14} className="ml-auto opacity-50 group-hover:opacity-100" />
                </a>
            </div>
          </div>
        </nav>

        {/* FOOTER LOGOUT */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
           >
             <LogOut size={18} />
             <span className="font-medium text-sm">Disconnetti</span>
           </button>
           
           <div className="mt-3 flex items-center gap-2 px-4 justify-center opacity-60">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <span className="text-[10px] text-slate-500 font-mono">System: Operational</span>
           </div>
        </div>
      </aside>
    </>
  );
};

// Icona logo helper
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default Sidebar;