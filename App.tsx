import React, { useState, useEffect } from 'react';
import { Menu, Loader2 } from 'lucide-react';
import { supabase } from './supabase';
import Sidebar from './components/Sidebar';
import Welcome from './components/Welcome';
import ExchangeConfig from './components/ExchangeConfig';
import TelegramConfig from './components/TelegramConfig';
import ActivationForm from './components/ActivationForm';
import Login from './components/Login';
import Register from './components/Register';
import { Tab } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  const [activeTab, setActiveTab] = useState<Tab>(Tab.WELCOME);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.WELCOME:
        return <Welcome onNext={() => setActiveTab(Tab.EXCHANGE)} />;
      case Tab.EXCHANGE:
        return <ExchangeConfig onNext={() => setActiveTab(Tab.TELEGRAM)} />;
      case Tab.TELEGRAM:
        return <TelegramConfig onNext={() => setActiveTab(Tab.ACTIVATION)} />;
      case Tab.ACTIVATION:
        return <ActivationForm />;
      default:
        return <Welcome onNext={() => setActiveTab(Tab.EXCHANGE)} />;
    }
  };

  // Loading Screen while checking session
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  // Auth Flow (Login/Register)
  if (!session) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Main App (Protected)
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0 z-10">
          <span className="font-bold text-white">CryptoBot Elite</span>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto pb-10">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;