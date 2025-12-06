import React from 'react';
import { LayoutDashboard, Wallet, MessageSquare, Zap, Bot, Lock } from 'lucide-react';
import { Tab, NavigationItem } from '../types';

interface MobileNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  activePlan: string | null;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, activePlan, isLoggedIn, onLoginClick }) => {
  
  const menuItems: NavigationItem[] = [
    { id: Tab.WELCOME, label: 'Home', icon: LayoutDashboard },
    { id: Tab.ANALYZER, label: 'Analyzer', icon: Bot },
    { id: Tab.EXCHANGE, label: 'Exchange', icon: Wallet },
    { id: Tab.TELEGRAM, label: 'Telegram', icon: MessageSquare },
    { id: Tab.ACTIVATION, label: 'Attiva', icon: Zap },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex justify-around items-center h-16 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          // --- LOGICA BLOCCO (Identica alla Sidebar) ---
          const plan = activePlan ? activePlan.toUpperCase() : "";
          let isLocked = false;

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
                   if (!isLoggedIn) onLoginClick();
                } else {
                   setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-all duration-200
                ${isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              <div className="relative">
                 <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : ''}`} />
                 
                 {/* Lucchetto Mobile */}
                 {isLocked && (
                    <div className="absolute -top-1.5 -right-2 bg-slate-900 rounded-full p-0.5 border border-slate-800">
                        <Lock size={10} className="text-slate-500" />
                    </div>
                 )}
              </div>
              
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
              
              {/* Indicatore attivo superiore */}
              {isActive && (
                <div className="absolute top-0 w-12 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981] rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;