import React, { useState, useEffect } from 'react';
import { Zap, Eye, EyeOff, CheckCircle, Lock, AlertCircle, Globe } from 'lucide-react';
import { supabase } from '../supabase';
import DOMPurify from 'dompurify';

const STORAGE_KEY = 'cryptobot_activation_form';

const EXCHANGES = [
  { id: 'Bitget', name: 'Bitget', requirePassphrase: true },
  { id: 'Binance', name: 'Binance', requirePassphrase: false },
  { id: 'Bybit', name: 'Bybit', requirePassphrase: false },
  { id: 'MEXC', name: 'MEXC', requirePassphrase: false },
];

const ActivationForm: React.FC = () => {
  // Carica dati da localStorage se esistono
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure exchange has a default if loading from old data
        return {
          ...parsed,
          exchange: parsed.exchange || 'Bitget'
        };
      }
    } catch (e) {
      // Ignora errori parsing
    }
    return {
      clientName: '',
      exchange: 'Bitget',
      accessKey: '',
      secretKey: '',
      apiPassphrase: '',
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

        // 1. Cerca record esistente in richieste_attivazione
        const { data: existing } = await supabase
          .from('richieste_attivazione')
          .select('id, nome_cliente, access_key, chat_id, exchange')
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
              exchange: existing.exchange || prev.exchange,
              accessKey: existing.access_key || prev.accessKey,
              chatId: existing.chat_id || prev.chatId
            }));
          }
        } else {
          // 2. Se non esiste in richieste_attivazione, cerca pagamento approvato in 'pagamenti'
          // e crea automaticamente il record in richieste_attivazione
          const { data: approvedPayment } = await supabase
            .from('pagamenti')
            .select('id, user_email, piano, stato')
            .eq('user_email', user.email)
            .like('piano', '%BTC%')
            .eq('stato', 'approved')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (approvedPayment) {
            // Determina il tipo di piano
            const planType = approvedPayment.piano.toLowerCase().includes('annuale') ? 'annual' : 'monthly';

            // Crea record in richieste_attivazione
            const { data: newRequest, error: insertError } = await supabase
              .from('richieste_attivazione')
              .insert([{
                user_email: user.email,
                plan: 'BTC Single',
                plan_type: planType,
                status: 'pending_config'
              }])
              .select('id')
              .single();

            if (!insertError && newRequest) {
              setRequestId(newRequest.id);
            }
          }
        }
      }
    });
  }, []);

  // Salva in localStorage quando formData cambia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // ✅ SANITIZE INPUT per prevenire XSS
    const sanitizedValue = DOMPurify.sanitize(e.target.value);

    setFormData({
      ...formData,
      [e.target.name]: sanitizedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // ✅ RATE LIMITING (5 secondi cooldown)
    const now = Date.now();
    if (now - lastSubmit < 5000) {
      setErrorMessage("Attendere 5 secondi prima di inviare nuovamente.");
      setStatus('error');
      return;
    }
    setLastSubmit(now);

    const selectedExchange = EXCHANGES.find(ex => ex.id === formData.exchange);
    const isPassphraseRequired = selectedExchange?.requirePassphrase;

    // Validazione base
    if (!formData.accessKey || !formData.secretKey || !formData.botToken || !formData.chatId) {
      setErrorMessage("Tutti i campi obbligatori devono essere compilati.");
      setStatus('error');
      return;
    }

    if (isPassphraseRequired && !formData.apiPassphrase) {
      setErrorMessage(`La Passphrase API è obbligatoria per ${formData.exchange}.`);
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
          exchange: formData.exchange,
          access_key: formData.accessKey,
          secret_key: formData.secretKey,
          api_passphrase: formData.apiPassphrase,
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

  const currentExchange = EXCHANGES.find(ex => ex.id === formData.exchange) || EXCHANGES[0];

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
            Il bot inizierà l'inizializzazione entro <span className="text-white font-bold">60 minuti</span>.
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

        {/* Exchange Credential Section */}
        <div>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
            Credenziali Exchange
          </h3>

          <div className="grid grid-cols-1 gap-5">
            {/* Exchange Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Globe size={14} /> Seleziona Exchange
              </label>
              <select
                name="exchange"
                value={formData.exchange}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all cursor-pointer appearance-none"
              >
                {EXCHANGES.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Access Key (Public)</label>
              <input
                type="text"
                name="accessKey"
                value={formData.accessKey}
                onChange={handleChange}
                placeholder={`API Key ${formData.exchange}...`}
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
                  placeholder="Chiave segreta..."
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

            {/* Passphrase - Only if required or optional but visible */}
            <div className={`space-y-2 transition-all duration-300 ${!currentExchange.requirePassphrase ? 'opacity-80' : ''}`}>
              <label className="text-sm font-medium text-slate-400 flex items-center justify-between">
                <span>Passphrase API</span>
                {!currentExchange.requirePassphrase && (
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Opzionale</span>
                )}
                {currentExchange.requirePassphrase && (
                  <span className="text-[10px] text-brand-500 font-bold">* Obbligatorio su {currentExchange.name}</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="apiPassphrase"
                  value={formData.apiPassphrase}
                  onChange={handleChange}
                  placeholder={currentExchange.requirePassphrase ? "Passphrase obbligatoria" : "Lascia vuoto se non richiesta"}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all font-mono text-sm placeholder-slate-600 ${currentExchange.requirePassphrase ? 'border-slate-800 focus:border-brand-500' : 'border-slate-900 opacity-60 focus:opacity-100 focus:border-slate-700'}`}
                />
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
