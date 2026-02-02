import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Copy, ExternalLink, Zap, Terminal, BarChart2, BookOpen, Loader2, CheckCircle, Bell } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

// ⚠️ INSERISCI QUI IL TUO USERNAME BOT (Senza @)
const BOT_USERNAME = "cryptoanalyzer_AI_Bot";

const AnalyzerBotPage: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [pollInterval, setPollInterval] = useState(5000); // ✅ Smart polling
  const maxInterval = 30000; // ✅ Max 30s backoff

  // Funzione di controllo stato
  const checkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data } = await supabase
          .from('pagamenti')
          .select('stato, codice')
          .eq('user_email', user.email)
          .ilike('piano', '%Analyzer%')
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setStatus(data.stato);

          if (data.codice && data.codice.length > 5) {
            setLicenseKey(data.codice);

            const storageKey = `license_notified_${data.codice}`;
            const alreadyNotified = localStorage.getItem(storageKey);

            if (!alreadyNotified) {
              toast.success("🎉 La tua Licenza è PRONTA!", {
                duration: 8000,
                style: { background: '#10b981', color: '#fff', fontWeight: 'bold', border: '2px solid #fff' },
                icon: '🔑'
              });
              localStorage.setItem(storageKey, 'true');
            }

            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
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

    // ✅ SMART POLLING: Stop quando tab nascosta
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        // Solo se tab visibile
        if (document.visibilityState === 'visible') {
          checkStatus();

          // Exponential backoff se licenza non ancora pronta
          if (!licenseKey) {
            setPollInterval(prev => Math.min(prev * 1.5, maxInterval));
          }
        }
      }, pollInterval);
    };

    startPolling();

    // Listener visibility change
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
  }, [pollInterval, licenseKey]); // ✅ Dependencies

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

  const renderLicenseContent = () => {
    // ✅ SKELETON ANIMATO INVECE DI SPINNER GENERICO
    if (loading) return (
      <div className="flex flex-col gap-3 w-full animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-32"></div>
        <div className="h-8 bg-slate-800 rounded w-full"></div>
        <div className="h-3 bg-slate-700 rounded w-48 mt-2"></div>
      </div>
    );

    if (licenseKey) {
      return (
        <>
          {/* FIX: Aggiunto margine inferiore su mobile (mb-4) e larghezza piena */}
          <div className="flex flex-col items-start animate-in fade-in zoom-in duration-500 w-full sm:w-auto relative z-20 mb-4 sm:mb-0">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Licenza Attiva</span>
            {/* FIX: Break-all per mandare a capo il codice lungo */}
            <code className="text-xl sm:text-2xl font-mono text-white tracking-wider font-bold select-all break-all bg-slate-900/50 px-2 py-1 rounded-lg">
              {licenseKey}
            </code>
          </div>

          {/* FIX: Bottone a tutta larghezza su mobile (w-full) e centrato */}
          <button
            onClick={handleCopy}
            className={`relative z-20 flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-3 rounded-xl transition-all text-sm font-bold shadow-lg cursor-pointer
                        ${copied
                ? 'bg-emerald-600 text-white scale-95'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:text-white hover:-translate-y-1'
              }`}
          >
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
            {copied ? 'Copiato!' : 'Copia'}
          </button>
        </>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center py-2 animate-pulse">
        <div className="flex items-center gap-2">
          <Loader2 size={20} className="text-yellow-500 animate-spin" />
          <span className="text-yellow-500 font-mono text-sm font-bold">
            GENERAZIONE IN CORSO...
          </span>
        </div>
        <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
          Non chiudere, si aggiornerà da solo
        </span>
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

            {/* FIX: Layout a colonna su mobile (flex-col) e riga su desktop (sm:flex-row) */}
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 min-h-[100px] relative z-20">
              {renderLicenseContent()}
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

        {/* ISTRUZIONI A DESTRA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h3 className="text-white font-bold mb-4">Guida Rapida</h3>
          <ol className="space-y-4 text-sm text-slate-400 list-decimal pl-4">
            <li>Clicca su <strong>Apri il Bot Telegram</strong>.</li>
            <li>Premi <strong>Avvia</strong> (/start) nel bot.</li>
            <li>Attendi che la licenza appaia qui a sinistra.</li>
            <li>Copia il codice con il tasto verde.</li>
            <li>Incolla nel bot: <code>/activate CODICE</code>.</li>
          </ol>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Bell size={12} className="animate-swing text-yellow-500" />
              <span>La pagina si aggiorna automaticamente.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyzerBotPage;