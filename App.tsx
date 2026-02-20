import React, { useState, useEffect } from 'react';
import { Menu, Loader2, User } from 'lucide-react';
import { supabase } from './supabase';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Componenti
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import UserMenu from './components/UserMenu';
import Welcome from './components/Welcome';
import ExchangeConfig from './components/ExchangeConfig';
import TelegramConfig from './components/TelegramConfig';
import ActivationForm from './components/ActivationForm';
import AnalyzerBotPage from './components/AnalyzerBotPage';
import Login from './components/Login';
import Register from './components/Register';
import { Tab } from './types';

const App: React.FC = () => {
  // --- STATI ---
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>(Tab.WELCOME);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- EFFETTI (Auth & Payment Check) ---
  useEffect(() => {
    // 1. Controllo sessione all'avvio
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkUserPayment(session.user.email);
        setShowAuth(false);
      } else {
        setAuthLoading(false);
      }
    });

    // 2. Listener per Login/Logout
    const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Utente loggato: controlla piano e chiudi login
        checkUserPayment(session.user.email);
        setShowAuth(false);
      } else {
        // Utente sloggato: resetta tutto
        setAuthLoading(false);
        setActivePlan(null);
        setActiveTab(Tab.WELCOME);
        setAuthView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Funzione per controllare lo stato del pagamento su Supabase
  // Controlla ENTRAMBE le tabelle: 'pagamenti' (TXID) e 'stripe_payments' (Stripe)
  const checkUserPayment = async (email: string | undefined) => {
    if (!email) return;
    setCheckingPayment(true);
    try {
      const allPlans: string[] = [];

      // 1. Controlla tabella 'pagamenti' (pagamenti TXID/manuali)
      const { data: txidData, error: txidError } = await supabase
        .from('pagamenti')
        .select('piano, stato')
        .eq('user_email', email);

      if (txidError && import.meta.env.DEV) {
        console.error("Errore check pagamenti TXID:", txidError);
      }

      if (txidData && txidData.length > 0) {
        const approvedTxid = txidData
          .filter(row => row.stato === 'approved' || row.stato === 'activated')
          .map(row => row.piano);
        allPlans.push(...approvedTxid);
      }

      // 2. Controlla tabella 'stripe_payments' (pagamenti Stripe)
      const { data: stripeData, error: stripeError } = await supabase
        .from('stripe_payments')
        .select('plan_type, status')
        .eq('user_email', email);

      if (stripeError && import.meta.env.DEV) {
        console.error("Errore check stripe_payments:", stripeError);
      }

      if (stripeData && stripeData.length > 0) {
        const approvedStripe = stripeData
          .filter(row => row.status === 'completed' || row.status === 'activated')
          .map(row => row.plan_type === 'monthly' ? 'Crypto Analyzer Pro' : row.plan_type);
        allPlans.push(...approvedStripe);
      }

      // 3. Imposta il piano attivo se trovato
      if (allPlans.length > 0) {
        setActivePlan([...new Set(allPlans)].join(' ')); // Rimuove duplicati
      } else {
        setActivePlan(null);
      }

    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(err);
      }
    } finally {
      setCheckingPayment(false);
      setAuthLoading(false);
    }
  };

  // ✅ REALTIME SUBSCRIPTION PER PAYMENT STATUS
  useEffect(() => {
    if (!session?.user?.email) return;

    const channel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pagamenti',
          filter: `user_email=eq.${session.user.email}`
        },
        (payload: any) => {
          checkUserPayment(session.user.email);

          if (payload.new?.stato === 'approved') {
            toast.success('🎉 Pagamento Approvato! Piano attivato.', {
              duration: 6000,
              style: { background: '#10b981', color: '#fff', fontWeight: 'bold' }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Funzione per aprire il login manualmente
  const triggerLogin = () => {
    setAuthView('login');
    setShowAuth(true);
    setIsMobileOpen(false); // Chiude il menu mobile se aperto
  };

  // --- LOGICA VISUALIZZAZIONE ---

  // Determina se mostrare l'overlay di Login/Register
  // Lo mostriamo se:
  // 1. showAuth è true (cliccato su "Accedi")
  // 2. OPPURE non c'è sessione e l'utente cerca di accedere a una tab diversa da Welcome
  const isAuthOverlayVisible = showAuth || (!session && activeTab !== Tab.WELCOME);

  // Renderizza il contenuto principale in base alla Tab attiva
  const renderMainContent = () => {
    switch (activeTab) {
      case Tab.WELCOME:
        return <Welcome
          onNext={(productType) => {
            toast.success('Richiesta inviata! In attesa di verifica.', {
              duration: 6000,
              style: { background: '#eab308', color: '#fff', border: 'none', fontWeight: 'bold' },
              iconTheme: { primary: '#fff', secondary: '#eab308' },
            });
          }}
          onAuthRequired={triggerLogin}
          isLoggedIn={!!session}
        />;
      case Tab.ANALYZER:
        return <AnalyzerBotPage />;
      case Tab.EXCHANGE:
        return <ExchangeConfig onNext={() => setActiveTab(Tab.TELEGRAM)} />;
      case Tab.TELEGRAM:
        return <TelegramConfig onNext={() => setActiveTab(Tab.ACTIVATION)} />;
      case Tab.ACTIVATION:
        return <ActivationForm />;
      default:
        return <Welcome onNext={() => { }} onAuthRequired={triggerLogin} isLoggedIn={!!session} />;
    }
  };

  // Renderizza l'Overlay di Autenticazione (Schermo Intero)
  const renderAuthOverlay = () => {
    if (!isAuthOverlayVisible) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col h-full w-full overflow-y-auto animate-in fade-in duration-300">
        {/* Header Overlay: Torna alla Home */}
        <div className="p-4 absolute top-0 left-0 z-10">
          <button
            onClick={() => {
              setShowAuth(false);
              setActiveTab(Tab.WELCOME); // Torna alla home se annulli
            }}
            className="text-slate-400 hover:text-white flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-slate-800 transition-colors"
          >
            <span className="text-xl">&larr;</span> Home
          </button>
        </div>

        {/* Contenuto Login/Register */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
          {authView === 'login' ? (
            <Login onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthView('login')} />
          )}
        </div>
      </div>
    );
  };

  // Loading Screen Iniziale
  if (authLoading || checkingPayment) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center bg-slate-950"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Caricamento CryptoBot Elite...</p>
          <span className="sr-only">Caricamento in corso, attendere prego.</span>
        </div>
      </div>
    );
  }

  // --- LAYOUT PRINCIPALE ---
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative">

      {/* 1. NOTIFICHE TOAST */}
      <Toaster
        position="top-center"
        containerStyle={{
          top: 'env(safe-area-inset-top, 16px)',
          paddingTop: '16px'
        }}
        toastOptions={{
          className: 'toast-custom',
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
        }}
      />

      {/* ✅ SKIP NAVIGATION LINK */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg"
      >
        Salta al contenuto principale
      </a>

      {/* 2. OVERLAY AUTH (Login/Register) - Sempre sopra a tutto */}
      {renderAuthOverlay()}

      {/* 3. SIDEBAR DESKTOP */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === Tab.WELCOME) setShowAuth(false);
        }}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        activePlan={activePlan}
        isLoggedIn={!!session}
        onLoginClick={triggerLogin}
        userEmail={session?.user?.email}
      />

      {/* 4. AREA CONTENUTO PRINCIPALE */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">

        {/* A. HEADER MOBILE (Visibile solo < 1024px) */}
        <header className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0 z-10">
          <span className="font-bold text-white text-lg">CryptoBot Elite</span>

          <div className="flex items-center gap-3">
            {session ? (
              // Se loggato: Mostra menu utente
              <UserMenu email={session.user.email} activePlan={activePlan} />
            ) : (
              // Se sloggato: Mostra tasto Accedi (QUESTO MANCAVA PRIMA!)
              <button
                onClick={triggerLogin}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20"
              >
                Accedi
              </button>
            )}

            {/* Tasto Menu Hamburger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* B. HEADER DESKTOP (Visibile solo >= 1024px) */}
        <header className="hidden lg:flex bg-transparent p-6 justify-end items-center shrink-0 z-20 absolute top-0 right-0 w-full pointer-events-none">
          <div className="pointer-events-auto">
            {session ? (
              <UserMenu email={session.user.email} activePlan={activePlan} />
            ) : (
              <button
                onClick={triggerLogin}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
              >
                Accedi al Pannello
              </button>
            )}
          </div>
        </header>

        {/* C. CONTENUTO SCROLLABILE */}
        <div id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth pt-6 lg:pt-20 pb-24 lg:pb-10 w-full">
          <div className="max-w-6xl mx-auto">
            {renderMainContent()}
          </div>
        </div>

        {/* D. NAVIGAZIONE MOBILE (Bottom Bar) */}
        {/* Nascondiamo la navbar se l'overlay di auth è visibile per evitare sovrapposizioni */}
        {!isAuthOverlayVisible && (
          <MobileNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isLoggedIn={!!session}
            onLoginClick={triggerLogin}
          />
        )}

      </main>
    </div>
  );
};

export default App;