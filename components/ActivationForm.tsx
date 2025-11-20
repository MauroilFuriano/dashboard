import React, { useState } from 'react';
import { Zap, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';
// Importiamo il collegamento a Supabase che hai appena creato
import { supabase } from '../supabase';

const ActivationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    accessKey: '',
    secretKey: '',
    botToken: '',
    chatId: ''
  });

  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione
    if (!formData.accessKey || !formData.secretKey || !formData.botToken) {
      alert("Per favore compila tutti i campi obbligatori.");
      return;
    }

    setStatus('loading');

    try {
      // --- INVIO REALE A SUPABASE ---
      const { error } = await supabase
        .from('richieste_attivazione') // Nome della tabella che hai creato
        .insert([
          {
            // A sinistra i nomi delle colonne su Supabase
            // A destra i dati del form
            nome_cliente: formData.clientName,
            access_key: formData.accessKey,
            secret_key: formData.secretKey,
            telegram_token: formData.botToken,
            chat_id: formData.chatId
          }
        ]);

      if (error) throw error;

      // Se tutto va bene:
      setStatus('success');

    } catch (error: any) {
      console.error('Errore durante l\'invio:', error);
      alert("C'è stato un errore nell'invio dei dati: " + error.message);
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-10 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white">Richiesta Inviata con Successo!</h2>
        <p className="text-slate-400 max-w-md">
          I tuoi dati sono stati salvati nel database sicuro.
          Il team tecnico sta configurando il tuo bot.
        </p>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <p className="text-sm text-slate-300">Controlla la tua email o Telegram tra <span className="text-green-400 font-bold">1-2 ore</span></p>
        </div>
        <button 
          onClick={() => {
            setStatus('idle');
            setFormData({ clientName: '', accessKey: '', secretKey: '', botToken: '', chatId: '' });
          }}
          className="text-slate-500 hover:text-white underline mt-4 text-sm"
        >
          Invia una nuova richiesta
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Attivazione Servizio</h2>
        <p className="text-slate-400">Inserisci i dati per avviare il tuo CryptoBot Elite.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
        
        {/* Nome Cliente */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Nome Cliente</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="Mario Rossi"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* MEXC Keys */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">MEXC Access Key</label>
            <input
              type="text"
              name="accessKey"
              value={formData.accessKey}
              onChange={handleChange}
              placeholder="mx0..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">MEXC Secret Key</label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                name="secretKey"
                value={formData.secretKey}
                onChange={handleChange}
                placeholder="••••••••••••••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Telegram Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Telegram Bot Token</label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                name="botToken"
                value={formData.botToken}
                onChange={handleChange}
                placeholder="12345:AAEF..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Telegram Chat ID</label>
            <input
              type="text"
              name="chatId"
              value={formData.chatId}
              onChange={handleChange}
              placeholder="12345678"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-all font-mono text-sm"
            />
          </div>
        </div>

        {/* Bottone Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg
            ${status === 'loading' 
              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/20 hover:shadow-brand-500/20 hover:-translate-y-1'
            }`}
        >
          {status === 'loading' ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvataggio in corso...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-current" />
              ATTIVA IL MIO BOT
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
          <Lock size={12} />
          Dati crittografati SSL e salvati su server sicuro.
        </p>
      </form>
    </div>
  );
};

export default ActivationForm;