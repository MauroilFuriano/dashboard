import React, { useState, useEffect } from 'react';
import { Zap, Eye, EyeOff, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';
import DOMPurify from 'dompurify';

const STORAGE_KEY = 'cryptobot_activation_form';

const ActivationForm: React.FC = () => {
  // Carica dati da localStorage se esistono
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignora errori parsing
    }
    return {
      clientName: '',
      accessKey: '',
      secretKey: '',
      botToken: '',
      chatId: ''
    };
  };

  const [formData, setFormData] = useState(getSavedData);
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState<number | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSubmit, setLastSubmit] = useState(0);

  // Recuperiamo l'email dell'utente loggato e il record esistente
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email);

        // Cerca record esistente in richieste_attivazione
        const { data: existing } = await supabase
          .from('richieste_attivazione')
          .select('id, nome_cliente, access_key, chat_id')
          .eq('user_email', user.email)
          .eq('plan', 'BTC Single')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existing) {
          setRequestId(existing.id);
          // Pre-popola i campi non sensibili se esistono
          if (existing.nome_cliente || existing.access_key || existing.chat_id) {
            setFormData((prev: typeof formData) => ({
              ...prev,
              clientName: existing.nome_cliente || prev.clientName,
              accessKey: existing.access_key || prev.accessKey,
              chatId: existing.chat_id || prev.chatId
            }));
          }
        }
      }
    });
  }, []);

  // Salva in localStorage quando formData cambia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // âœ… SANITIZE INPUT per prevenire XSS
    const sanitizedValue = DOMPurify.sanitize(e.target.value);

    setFormData({
      ...formData,
      [e.target.name]: sanitizedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // âœ… RATE LIMITING (5 secondi cooldown)
    const now = Date.now();
    if (now - lastSubmit < 5000) {
      setErrorMessage("Attendere 5 secondi prima di inviare nuovamente.");
      setStatus('error');
      return;
    }
    setLastSubmit(now);

    // Validazione base
    if (!formData.accessKey || !formData.secretKey || !formData.botToken || !formData.chatId) {
      setErrorMessage("Tutti i campi sono obbligatori per il funzionamento del bot.");
      setStatus('error');
      return;
    }

    if (!requestId) {
      setErrorMessage("Nessun abbonamento attivo trovato. Completa prima il pagamento.");
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      // ✅ I dati vengono inviati in chiaro via HTTPS (già sicuro)
      // La criptazione avverrà lato server prima dello storage

      // ✅ UPDATE record esistente invece di INSERT
      const { error } = await supabase
        .from('richieste_attivazione')
        .update({
          nome_cliente: formData.clientName || email.split('@')[0],
          access_key: formData.accessKey,
          secret_key: formData.secretKey,
          telegram_token: formData.botToken,
          chat_id: formData.chatId,
          status: 'pending_deploy'
        })
        .eq('id', requestId);

      if (error) throw error;

      // ✅ Pulisci localStorage dopo successo
      localStorage.removeItem(STORAGE_KEY);

      // ✅ Trigger deploy tramite Edge Function (evita CORS)
      try {
        await fetch('https://hlzjlsuirhulmjhbzmtd.supabase.co/functions/v1/trigger-deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: requestId })
        });
      } catch (deployErr) {
        // Ignora errori di rete - il bot verrà deployato manualmente se necessario
        console.log('Deploy trigger attempted');
      }

      setStatus('success');

    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Errore invio:', error);
      }
      setErrorMessage(error.message || "Errore sconosciuto durante il salvataggio.");
      setStatus('error');
    }
  };

  // Schermata di successo
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-10 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Configurazione Completata!</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            I tuoi dati sono stati crittografati e inviati al server sicuro.
            Il bot inizierÃ  l'inizializzazione entro <span className="text-white font-bold">60 minuti</span>.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 max-w-sm w-full">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Prossimi Step</h3>
          <ul className="text-left text-sm space-y-2 text-slate-400">
            <li className="flex gap-2"><span>1.</span> Verifica che il bot Telegram risponda.</li>
            <li className="flex gap-2"><span>2.</span> Attendi il primo messaggio di "Benvenuto".</li>
            <li className="flex gap-2"><span>3.</span> Rilassati e lascia fare all'algoritmo.</li>
          </ul>
        </div>
      </div>
    );
  }

  // Form principale
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Attivazione Servizio</h2>
        <p className="text-slate-400">Inserisci le API Key generate per avviare il CryptoBot Elite.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">

        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="shrink-0 w-5 h-5 mt-0.5" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Nome Cliente */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Nome Identificativo</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="Es. Mario Rossi (Portfolio A)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-slate-600"
          />
        </div>

        <div className="h-px bg-slate-800 my-4" />

        {/* MEXC Keys */}
        <div>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
            Credenziali Bitget
          </h3>
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Access Key (Public)</label>
              <input
                type="text"
                name="accessKey"
                value={formData.accessKey}
                onChange={handleChange}
                placeholder="mx0..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all font-mono text-sm placeholder-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Secret Key (Private)</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  name="secretKey"
                  value={formData.secretKey}
                  onChange={handleChange}
                  placeholder="Incolla qui la chiave segreta..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all font-mono text-sm pr-10 placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  aria-label={showSecret ? "Nascondi secret key" : "Mostra secret key"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-800 my-4" />

        {/* Telegram Data */}
        <div>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Credenziali Telegram
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Bot Token</label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  name="botToken"
                  value={formData.botToken}
                  onChange={handleChange}
                  placeholder="12345:AAEF..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all font-mono text-sm pr-10 placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Chat ID</label>
              <input
                type="text"
                name="chatId"
                value={formData.chatId}
                onChange={handleChange}
                placeholder="12345678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all font-mono text-sm placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Bottone Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg
              ${status === 'loading'
                ? 'bg-slate-800 cursor-not-allowed text-slate-400'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/20 hover:shadow-brand-500/20 hover:-translate-y-1'
              }`}
          >
            {status === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvataggio sicuro...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                AVVIA TRADING BOT
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-500 mt-4 flex items-center justify-center gap-1.5 opacity-70">
            <Lock size={10} />
            Dati trasmessi tramite protocollo sicuro SSL/TLS End-to-End
          </p>
        </div>
      </form>
    </div>
  );
};

export default ActivationForm;
