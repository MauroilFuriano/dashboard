import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Copy, ExternalLink, Zap, Terminal, BarChart2, BookOpen, Loader2, CheckCircle, Bell, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

// ⚠️ INSERISCI QUI IL TUO USERNAME BOT (Senza @)
const BOT_USERNAME = "cryptoanalyzer_AI_Bot";

/**
 * Pagina Crypto Analyzer Pro
 * - Modalità FREEMIUM per utenti non paganti
 * - Link attivazione per utenti con status=approved
 * - Info scadenza per utenti con status=activated
 */
const AnalyzerBotPage: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'activated' | null>(null);
  const [activationToken, setActivationToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState<string>(''); // Debug
  const [debugError, setDebugError] = useState<string | null>(null); // Debug Error


  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [pollInterval, setPollInterval] = useState(5000);
  const maxInterval = 30000;

  // Funzione di controllo stato
  const checkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);

        // Query 1: Tabella 'pagamenti' (TXID)
        const { data: txidData, error: txidError } = await supabase
          .from('pagamenti')
          .select('id, stato, codice, activation_token, user_email, piano, created_at')
          .eq('user_email', user.email)
          .order('id', { ascending: false })
          .limit(1);

        // Query 2: Tabella 'stripe_payments' (Stripe)
        const { data: stripeData, error: stripeError } = await supabase
          .from('stripe_payments')
          .select('id, status, activation_token, user_email, plan_type, created_at')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false })
          .limit(1);

        if (txidError) {
          setDebugError(txidError.message);
          console.error("Supabase Error (pagamenti):", txidError);
        } else if (stripeError) {
          setDebugError(stripeError.message);
          console.error("Supabase Error (stripe_payments):", stripeError);
        } else {
          setDebugError(null);
        }

        // Unisci risultati: prendi il più recente tra TXID e Stripe
        let latest: any = null;
        let source: 'txid' | 'stripe' | null = null;

        if (txidData && txidData.length > 0) {
          latest = txidData[0];
          source = 'txid';
        }

        if (stripeData && stripeData.length > 0) {
          const stripeRecord = stripeData[0];

          // Verifica se i record hanno token validi
          const txidHasToken = latest && (latest.activation_token || latest.codice);
          const stripeHasToken = stripeRecord.activation_token;

          // Usa Stripe se:
          // 1. Non c'è nessun record TXID
          // 2. OPPURE Stripe ha un token e TXID no (priorità al token)
          // 3. OPPURE entrambi hanno token (o nessuno lo ha) e Stripe è più recente
          const useStripe = !latest ||
            (stripeHasToken && !txidHasToken) ||
            ((!!stripeHasToken === !!txidHasToken) &&
              stripeRecord.created_at && latest.created_at &&
              new Date(stripeRecord.created_at) > new Date(latest.created_at));

          if (useStripe) {
            latest = stripeRecord;
            source = 'stripe';
          }
        }

        if (latest) {
          // Normalizza i campi (Stripe usa 'status', TXID usa 'stato')
          const paymentStatus = source === 'stripe' ? latest.status : latest.stato;

          // Mappa 'completed' (Stripe) a 'approved' per uniformità
          const normalizedStatus = paymentStatus === 'completed' ? 'approved' : paymentStatus;

          setStatus(normalizedStatus);
          setHasPaid(true);

          if (latest.activation_token) {
            setActivationToken(latest.activation_token);
          }

          if (latest.codice && latest.codice.length > 5) {
            setLicenseKey(latest.codice);

            const storageKey = `license_notified_${latest.codice}`;
            const alreadyNotified = localStorage.getItem(storageKey);

            if (!alreadyNotified) {
              toast.success("🎉 La tua Licenza è PRONTA!", {
                duration: 8000,
                style: { background: '#10b981', color: '#fff', fontWeight: 'bold', border: '2px solid #fff' },
                icon: '🔑'
              });
              localStorage.setItem(storageKey, 'true');
            }
          }
        } else {
          // L'utente non ha pagato per Analyzer
          setHasPaid(false);
          setStatus(null);
        }
      }
    } catch (error) {
      console.error("Errore check licenza:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          checkStatus();

          if (!licenseKey) {
            setPollInterval(prev => Math.min(prev * 1.5, maxInterval));
          }
        }
      }, pollInterval);
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
        startPolling();
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pollInterval, licenseKey]);

  // --- FUNZIONE COPIA ---
  const handleCopy = async () => {
    if (!licenseKey) return;

    try {
      await navigator.clipboard.writeText(licenseKey);
      triggerCopySuccess();
    } catch (err) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = licenseKey;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        triggerCopySuccess();
      } catch (e) {
        toast.error('Copia fallita. Seleziona il testo manualmente.');
      }
    }
  };

  const triggerCopySuccess = () => {
    setCopied(true);
    toast.success('Codice copiato!', {
      style: { background: '#10b981', color: '#fff' }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Formatta la data di scadenza
  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  /**
   * Renderizza il contenuto della sezione Licenza in base allo stato:
   * - NON PAGATO: Modalità FREEMIUM con pulsante "Acquista PRO"
   * - APPROVED: Link Telegram per attivare il bot PRO
   * - ACTIVATED: Info licenza attiva con data scadenza
   */
  const renderLicenseContent = () => {
    // Skeleton durante il caricamento
    if (loading) return (
      <div className="flex flex-col gap-3 w-full animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-32"></div>
        <div className="h-8 bg-slate-800 rounded w-full"></div>
        <div className="h-3 bg-slate-700 rounded w-48 mt-2"></div>
      </div>
    );

    // ✅ CASO 1: LICENZA ATTIVATA (status = activated)
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === 'activated' && expiresAt) {
      return (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-emerald-400" size={28} />
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Licenza Attiva</span>
              <p className="text-white font-bold text-lg">✅ Modalità PRO</p>
            </div>
          </div>
          <div className="text-center sm:text-right bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-500 uppercase">Scadenza</span>
            <p className="text-white font-mono font-bold">{formatExpiryDate(expiresAt)}</p>
          </div>
        </div>
      );
    }

    // ✅ CASO 2: APPROVATO (status = approved) - Mostra link attivazione
    if (normalizedStatus === 'approved' && activationToken) {
      const activationLink = `https://t.me/${BOT_USERNAME}?start=PAY_${activationToken}`;

      return (
        <div className="flex flex-col gap-4 w-full animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center animate-pulse">
              <Crown className="text-yellow-400" size={28} />
            </div>
            <div>
              <span className="text-[11px] text-yellow-400 font-bold uppercase tracking-wider">Pagamento Approvato</span>
              <p className="text-white font-bold">Pronto per l'attivazione!</p>
            </div>
          </div>

          <a
            href={activationLink}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 animate-pulse"
          >
            <Sparkles size={22} />
            Attiva il tuo Bot PRO
            <ArrowRight size={20} />
          </a>

          <p className="text-[11px] text-slate-500 text-center">
            Clicca il pulsante sopra → Il premium si attiverà automaticamente!
          </p>
        </div>
      );
    }

    // ✅ CASO 3: PENDING - In attesa di approvazione
    if (normalizedStatus === 'pending') {
      return (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center py-2 animate-pulse">
          <div className="flex items-center gap-2">
            <Loader2 size={20} className="text-yellow-500 animate-spin" />
            <span className="text-yellow-500 font-mono text-sm font-bold">
              VERIFICA PAGAMENTO IN CORSO ({status})
            </span>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            Riceverai una notifica quando approvato
          </span>
        </div>
      );
    }

    // ✅ CASO 4: NON HA PAGATO - Mostra modalità FREEMIUM
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-between animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
            <Zap className="text-slate-400" size={24} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Modalità Attuale</span>
            <p className="text-white font-bold text-lg">🆓 FREEMIUM</p>
            <p className="text-[11px] text-slate-500">Funzionalità limitate</p>
          </div>
        </div>

        <button
          onClick={() => {
            // Naviga alla sezione Benvenuto per acquistare
            toast('Vai alla sezione "Benvenuto" per acquistare PRO!', { icon: '👉' });
          }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1"
        >
          <Crown size={18} />
          Acquista PRO
        </button>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Crypto Analyzer <span className="text-emerald-500">Pro</span></h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase border border-emerald-500/20">v5.1 AI-Enhanced</span>
          </div>
          <p className="text-slate-400">Institutional Dashboard • Gemini 2.5 Flash Engine</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-900/20 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-emerald-400">SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LICENSE CARD */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xl">
            {/* BACKGROUND EFFECTS */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity z-0 pointer-events-none">
              <ShieldCheck size={120} />
            </div>

            <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 relative z-10">
              <Zap className="text-yellow-400" size={20} />
              La tua Licenza Personale
            </h3>

            {/* Contenuto dinamico in base allo stato */}
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex flex-col items-center justify-center gap-4 min-h-[100px] relative z-20">
              {renderLicenseContent()}

              <div className="mt-4 text-[10px] text-slate-600 font-mono break-all bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                DEBUG: State={status || 'NULL'} | Token={activationToken || 'NULL'} | Paid={hasPaid ? 'YES' : 'NO'} | Email={userEmail || 'NO_EMAIL'}
              </div>
            </div>

            <div className="mt-8 flex gap-4 relative z-20">
              <a
                href={`https://t.me/${BOT_USERNAME}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 hover:border-emerald-500 transition-all group"
              >
                <ExternalLink size={20} className="group-hover:text-emerald-400 transition-colors" />
                APRI IL BOT TELEGRAM
              </a>
            </div>
          </div>

          {/* FEATURES */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <div className="w-10 h-10 mx-auto bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 mb-3"><Terminal size={20} /></div>
              <p className="text-xs text-slate-500 uppercase font-bold">AI Engine</p><p className="text-white font-bold">Gemini 2.5</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <div className="w-10 h-10 mx-auto bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-3"><BarChart2 size={20} /></div>
              <p className="text-xs text-slate-500 uppercase font-bold">Signals</p><p className="text-white font-bold">Institutional</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <div className="w-10 h-10 mx-auto bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400 mb-3"><BookOpen size={20} /></div>
              <p className="text-xs text-slate-500 uppercase font-bold">Updates</p><p className="text-white font-bold">Lifetime</p>
            </div>
          </div>
        </div>

        {/* GUIDA RAPIDA - AGGIORNATA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h3 className="text-white font-bold mb-4">Guida Rapida</h3>
          <ol className="space-y-3 text-sm text-slate-400 list-decimal pl-4">
            <li>Clicca su <strong className="text-white">Apri il Bot Telegram</strong>.</li>
            <li>Premi <strong className="text-white">Avvia</strong> (/start) nel bot.</li>
            <li>Il bot funziona in modalità <strong className="text-emerald-400">FREEMIUM</strong> (gratis con limiti).</li>
          </ol>

          {/* Sezione PRO */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Crown size={12} /> Per sbloccare la versione PRO:
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Acquista dalla sezione <strong className="text-white">"Benvenuto"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Dopo l'approvazione, riceverai un <strong className="text-emerald-400">link qui</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Clicca il link → <strong className="text-white">Premium attivo automaticamente!</strong></span>
              </li>
            </ul>
          </div>

          {/* Codice manuale */}
          <div className="mt-4 pt-3 border-t border-slate-800/50">
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Bell size={10} className="text-yellow-500" />
              Hai già un codice? Usa <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-[10px]">/activate CODICE</code> nel bot.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyzerBotPage;