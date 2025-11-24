import React, { useState } from 'react';
import { X, Copy, CheckCircle, Loader2, User } from 'lucide-react';
import { supabase } from '../supabase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planName, price, onSuccess }) => {
  // --- I TUOI WALLET ---
  const wallets = {
    BSC: "0x32144cd83aa0164e10b855c6198dd819db42b816", 
    SOL: "8QejkQynGzxQYpdcPKmzVv3MZ2kXew2hZEisRyHma2Xm"
  };

  const [network, setNetwork] = useState<'BSC' | 'SOL'>('BSC'); 
  const [senderWallet, setSenderWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const activeAddress = network === 'BSC' ? wallets.BSC : wallets.SOL;
  // QR Code generato dinamicamente
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${activeAddress}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmed) {
      return alert("Per favore conferma di aver effettuato il pagamento spuntando la casella.");
    }

    setLoading(true);

    try {
      // 1. Recuperiamo l'utente corrente per avere la sua email
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) {
        throw new Error("Utente non identificato. Prova a fare logout e login.");
      }

      // 2. Inseriamo il record nella tabella 'pagamenti' (minuscolo!)
      const { error } = await supabase
        .from('pagamenti')
        .insert([{
            user_email: user.email,
            piano: planName,
            txid: senderWallet || "Non specificato", 
            stato: 'pending' // Di default è pending finché non controlli il wallet
          }]);

      if (error) throw error;

      // 3. Successo
      setLoading(false);
      onSuccess(); // Questo dirà ad App.tsx di sbloccare le tab
      onClose();

    } catch (error: any) {
      console.error(error);
      alert("Errore nel salvataggio: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Intestazione */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h3 className="text-xl font-bold text-white">Deposito USDC</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Selezione Rete */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setNetwork('BSC')}
              className={`p-3 rounded-xl border text-center transition-all ${
                network === 'BSC' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="font-bold">Rete BSC (BEP20)</div>
            </button>
            <button 
              type="button"
              onClick={() => setNetwork('SOL')}
              className={`p-3 rounded-xl border text-center transition-all ${
                network === 'SOL' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="font-bold">Rete SOLANA</div>
            </button>
          </div>

          {/* Indirizzo e QR */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center">
            <div className="bg-white p-2 rounded-lg mb-4">
              <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
            </div>
            
            <p className="text-slate-400 text-sm mb-2">Invia esattamente <strong className="text-white">{price} USDC</strong> a questo indirizzo:</p>
            
            <div className="w-full flex items-center gap-2 max-w-md">
              <code className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-lg text-slate-200 font-mono text-xs break-all text-left">
                {activeAddress}
              </code>
              <button onClick={handleCopy} className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors">
                {copied ? <CheckCircle size={18} className="text-emerald-500"/> : <Copy size={18}/>}
              </button>
            </div>
          </div>

          {/* Conferma */}
          <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-800 space-y-4">
            
            {/* Campo Wallet Mittente */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">Il tuo indirizzo Wallet (Facoltativo)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                   <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Es. Il tuo indirizzo di Binance/Metamask..."
                  value={senderWallet}
                  onChange={(e) => setSenderWallet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none text-sm placeholder-slate-600"
                />
              </div>
              <p className="text-xs text-slate-600 mt-1">Ci aiuta a trovare subito il tuo pagamento.</p>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl cursor-pointer hover:bg-emerald-500/10 transition-colors">
              <input 
                type="checkbox" 
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-900" 
              />
              <span className="text-sm text-slate-300">
                Ho inviato <strong>{price}</strong> all'indirizzo indicato. Sono consapevole che l'attivazione avverrà dopo la verifica manuale.
              </span>
            </label>
            
            <button 
              type="submit" 
              disabled={loading || !confirmed}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin"/> : <CheckCircle size={20} />}
              {loading ? 'Attendi...' : 'Conferma Pagamento'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default PaymentModal;