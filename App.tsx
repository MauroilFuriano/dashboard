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
  
  // STATO AGGIUNTO: Per sapere se l'utente ha già pagato/attivato
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>(Tab.WELCOME);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // 1. Controllo sessione iniziale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkUserPayment(session.user.email);
      } else {
        setAuthLoading(false);
      }
    });

    // 2. Ascolto cambiamenti auth (login/logout)
    const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkUserPayment(session.user.email);
      } else {
        setAuthLoading(false);
        setHasActivePlan(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // FUNZIONE CHIAVE: Controlla nel DB se esiste un pagamento
  const checkUserPayment = async (email: string | undefined) => {
    if (!email) return;
    setCheckingPayment(true);
    
    try {
      // Cerca nella tabella 'pagamenti' se c'è un record per questa email
      const { data, error } = await supabase
        .from('pagamenti')
        .select('*')
        .eq('user_email', email)
        .maybeSingle(); 

      if (error) {
        console.error("Errore check pagamento:", error);
      }

      // Se troviamo un record (anche 'pending'), sblocchiamo l'utente
      if (data) {
        setHasActivePlan(true);
        // Se era sulla welcome page, lo spostiamo avanti
        if (activeTab === Tab.WELCOME) {
            setActiveTab(Tab.EXCHANGE);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingPayment(false);
      setAuthLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.WELCOME:
        return <Welcome onNext={() => {
            // Callback: l'utente ha appena pagato nel modale
            setHasActivePlan(true);
            setActiveTab(Tab.EXCHANGE);
        }} />;
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

  // SCHERMATA DI CARICAMENTO (Login o Verifica Pagamento)
  if (authLoading || checkingPayment) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-slate-400 text-sm">Verifica account in corso...</p>
        </div>
      </div>
    );
  }

  // FLUSSO AUTH (Login/Register)
  if (!session) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // APP PRINCIPALE
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        hasActivePlan={hasActivePlan}
        // Qui potresti passare 'hasActivePlan' se vuoi mostrare lucchetti nella sidebar
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Mobile */}
        <header className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0 z-10">
          <span className="font-bold text-white">CryptoBot Elite</span>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Contenuto Scrollabile */}
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