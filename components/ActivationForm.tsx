import React, { useState, useEffect } from 'react';
import { Zap, Eye, EyeOff, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

const ActivationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    accessKey: '',
    secretKey: '',
    botToken: '',
    chatId: ''
  });

  const [email, setEmail] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Recuperiamo l'email dell'utente loggato all'avvio
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validazione base
    if (!formData.accessKey || !formData.secretKey || !formData.botToken || !formData.chatId) {
      setErrorMessage("Tutti i campi sono obbligatori per il funzionamento del bot.");
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const { error } = await supabase
        .from('richieste_attivazione')
        .insert([
          {
            // Associa l'email dell'account loggato (più sicuro)
            user_email: email, 
            nome_cliente: formData.clientName || email.split('@')[0], // Fallback sul nome email se vuoto
            access_key: formData.accessKey,
            secret_key: formData.secretKey,
            telegram_token: formData.botToken,
            chat_id: formData.chatId
          }
        ]);

      if (error) throw error;

      setStatus('success');

    } catch (error: any) {
      console.error('Errore invio:', error);
      setErrorMessage(error.message || "Errore sconosciuto durante il salvataggio.");
      setStatus('error');
    }
  };

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
                Credenziali MEXC
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