import React from 'react';
import { LayoutDashboard, Settings, MessageCircle, Zap, CheckCircle2, LogOut } from 'lucide-react';
import { supabase } from '../supabase';
import { Tab, NavigationItem } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) => {
  const navItems: NavigationItem[] = [
    { id: Tab.WELCOME, label: 'Benvenuto', icon: LayoutDashboard },
    { id: Tab.EXCHANGE, label: 'Config. Exchange', icon: Settings },
    { id: Tab.TELEGRAM, label: 'Config. Telegram', icon: MessageCircle },
    { id: Tab.ACTIVATION, label: 'Attivazione', icon: Zap },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-72 bg-slate-900 border-r border-slate-800 shadow-xl transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/20">
            <CheckCircle2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">CryptoBot Elite</h1>
            <span className="text-xs text-slate-400 font-medium">Pannello Cliente v2.0</span>
          </div>
        </div>

        <nav className="p-4 space-y-2 mt-4 flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:translate-x-1'}
                `}
              >
                <item.icon 
                  size={20} 
                  className={`${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Logout + Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-4 shrink-0">
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Esci</span>
          </button>

          <div className="flex items-center justify-center space-x-3 text-slate-500 text-xs pt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>System Status: </span>
            <span className="text-emerald-400 font-semibold">Operational</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;