import React from 'react';
import { X, Search, Clipboard, ArrowRight, FileText } from 'lucide-react';

interface HelpTXIDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpTXIDModal: React.FC<HelpTXIDModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="text-blue-400" size={20} />
            Cos'è il TXID?
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          
          {/* Spiegazione Semplice */}
          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-sm text-slate-300 leading-relaxed">
            Il <strong>TXID</strong> (Transaction ID) o <strong>Hash</strong> è la "ricevuta digitale" del tuo pagamento. È un codice lungo e unico che dimostra che hai inviato i fondi.
          </div>

          {/* Guida Passo Passo */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Come trovarlo in 3 step:</h4>
            
            <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-slate-700">1</div>
                <div className="text-sm text-slate-400">
                    Vai sull'Exchange o Wallet da cui hai pagato (Binance, Bybit, Metamask, ecc.).
                </div>
            </div>

            <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-slate-700">2</div>
                <div className="text-sm text-slate-400">
                    Cerca la sezione <strong>"Storia Prelievi"</strong> (Withdrawal History) o "Attività".
                </div>
            </div>

            <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">3</div>
                <div className="text-sm text-slate-400">
                    Clicca sulla transazione appena fatta. Troverai una voce chiamata <strong>TXID</strong> o <strong>TxHash</strong>. Copia quella stringa lunga.
                </div>
            </div>
          </div>

          {/* Esempio Visivo */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-2">
            <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Esempio di TXID:</p>
            <code className="text-[10px] text-emerald-400 font-mono break-all block">
              0x3b7f...8a9c2d (solitamente 64 caratteri)
            </code>
          </div>

        </div>

        {/* Footer */}
        <button 
            onClick={onClose}
            className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
        >
            Ho capito, inserisco il codice
        </button>

      </div>
    </div>
  );
};

export default HelpTXIDModal;