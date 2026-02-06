import React, { useState } from 'react';
import { X, Copy, CheckCircle, Loader2, User, Hash, HelpCircle } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import HelpTXIDModal from './HelpTXIDModal';
import FocusLock from 'react-focus-lock';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  onSuccess: () => void;
}

const generateActivationToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planName, price, onSuccess }) => {

  const wallets = {
    BSC: "0x32144cd83aa0164e10b855c6198dd819db42b816",
    SOL: "8QejkQynGzxQYpdcPKmzVv3MZ2kXew2hZEisRyHma2Xm"
  };

  const [network, setNetwork] = useState<'BSC' | 'SOL'>('BSC');
  const [txid, setTxid] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stato per aprire la guida
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  if (!isOpen) return null;

  const activeAddress = network === 'BSC' ? wallets.BSC : wallets.SOL;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${activeAddress}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (txid.length < 10) {
      return alert("Per favore inserisci un ID Transazione (TXID) valido.");
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) {
        throw new Error("Utente non identificato.");
      }

      // ✅ CHECK DUPLICATI PRIMA DI INSERT
      const { data: existing } = await supabase
        .from('pagamenti')
        .select('id, stato')
        .eq('user_email', user.email)
        .eq('piano', planName)
        .in('stato', ['pending', 'approved']);

      if (existing && existing.length > 0) {
        const status = existing[0].stato;
        setLoading(false);
        if (status === 'approved') {
          toast.error("Hai già acquistato questo piano!", { icon: '✅' });
          return;
        } else {
          toast.error("Hai già una richiesta in sospeso. Attendi l'approvazione.", { icon: '⏳' });
          return;
        }
      }

      // ✅ PROCEDI CON INSERT
      const { error } = await supabase
        .from('pagamenti')
        .insert([{
          user_email: user.email,
          piano: planName,
          txid: txid,
          stato: 'pending',
          activation_token: generateActivationToken() // ✅ AUTO-GENERAZIONE TOKEN
        }]);

      if (error) throw error;

      // ✅ FEEDBACK VISIVO FORTE
      setLoading(false);
      toast.success('🎉 Pagamento Registrato! Verifica in corso...', {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px 24px',
          boxShadow: '0 10px 40px rgba(16,185,129,0.3)'
        },
        icon: '✅'
      });

      // Attendi 1.5s per mostrare toast, poi chiudi
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      alert("Errore nel salvataggio: " + error.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* IL MODALE DI AIUTO */}
      <HelpTXIDModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
        <FocusLock returnFocus>
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
          >

            {/* Intestazione */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 id="payment-modal-title" className="text-xl font-bold text-white">Pagamento {planName}</h3>
              <button onClick={onClose} aria-label="Chiudi modal pagamento" className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto overscroll-contain">

              {/* Selezione Rete */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNetwork('BSC')}
                  className={`p-3 rounded-xl border text-center transition-all ${network === 'BSC' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                >
                  <div className="font-bold">Rete BSC (BEP20)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setNetwork('SOL')}
                  className={`p-3 rounded-xl border text-center transition-all ${network === 'SOL' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                >
                  <div className="font-bold">Rete SOLANA</div>
                </button>
              </div>

              {/* Indirizzo e QR */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="bg-white p-2 rounded-lg mb-4">
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                </div>

                <p className="text-slate-400 text-sm mb-2">Invia esattamente <strong className="text-white">{price} USDT/USDC</strong> a:</p>

                <div className="w-full flex items-center gap-2 max-w-md">
                  <code className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-lg text-slate-200 font-mono text-xs break-all text-left">
                    {activeAddress}
                  </code>
                  <button onClick={handleCopy} aria-label={copied ? "Indirizzo copiato" : "Copia indirizzo wallet"} className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors">
                    {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Form Conferma TXID */}
              <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-800 space-y-4">

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-400 text-sm font-bold">Ricevuta di Pagamento (TXID)</label>

                    {/* TASTO AIUTO */}
                    <button
                      type="button"
                      onClick={() => setIsHelpOpen(true)}
                      className="text-blue-400 text-xs flex items-center gap-1 hover:underline hover:text-blue-300 transition-colors"
                    >
                      <HelpCircle size={12} />
                      Dove lo trovo?
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Incolla qui l'ID della transazione (Es. 0x123abc...)"
                      value={txid}
                      onChange={(e) => setTxid(e.target.value)}
                      onFocus={(e) => {
                        // ✅ FIX MOBILE KEYBOARD OVERLAP
                        setTimeout(() => {
                          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none text-sm placeholder-slate-600 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || txid.length < 10}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                  {loading ? 'Verifica in corso...' : 'Conferma e Attiva'}
                </button>
              </form>

            </div>
          </div>
        </FocusLock>
      </div>
    </>
  );
};

export default PaymentModal;