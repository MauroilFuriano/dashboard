import React from 'react';
import { X, Activity, Shield, Crosshair, BarChart2 } from 'lucide-react';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'SINGLE' | 'DUAL';
}

const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const isDual = type === 'DUAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {isDual ? 'Dual Strategy (BTC + ETH)' : 'BTC Trend Following'}
            </h3>
            <p className="text-emerald-400 font-medium">Analisi Tecnica & Gestione Rischio</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-300">
          
          {/* Sezione 1: Come Entra a Mercato */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-emerald-500" /> Sistema di Entry (4H)
            </h4>
            <p>Il bot non opera a caso. Segue il principio <strong>"Quality over Quantity"</strong> combinando tre indicatori:</p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <li className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <strong className="text-white block mb-1">1. RSI Oversold</strong>
                Identifica quando il prezzo è temporaneamente "scontato" per entrare a miglior prezzo.
              </li>
              <li className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <strong className="text-white block mb-1">2. Supertrend</strong>
                Filtro fondamentale: apre posizioni SOLO se il trend di fondo è rialzista.
              </li>
              <li className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <strong className="text-white block mb-1">3. EMA Cross</strong>
                Doppia conferma sul momentum per evitare falsi segnali.
              </li>
            </ul>
          </div>

          {/* Sezione 2: Gestione Rischio (Diversa per Dual) */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="text-emerald-500" /> Risk Management Professionale
            </h4>
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Crosshair size={20} className="text-emerald-500 mt-1"/>
                  <div>
                    <strong className="text-white">Stop Loss Dinamico (ATR):</strong> 
                    Non fisso, ma si adatta alla volatilità del mercato. Se il mercato è pazzo, lo stop si allarga per non essere buttati fuori.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BarChart2 size={20} className="text-emerald-500 mt-1"/>
                  <div>
                    <strong className="text-white">Trailing Stop Intelligente:</strong> 
                    Quando andiamo in profitto, lo stop sale automaticamente per proteggere i guadagni.
                  </div>
                </li>
                {isDual && (
                  <li className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <strong className="text-emerald-400">Vantaggio DUAL:</strong> 
                    Diversificazione 60% BTC e 40% ETH. Se un asset soffre, l'altro compensa. Drawdown massimo storico contenuto al 10.4%.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Sezione 3: Statistiche Reali (Dal Backtest) */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">Performance Storica (2022-2025)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase">Ritorno Totale</div>
                <div className="text-2xl font-bold text-emerald-400">{isDual ? '+41.54%' : '+45.44%'}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase">Win Rate</div>
                <div className="text-xl font-bold text-white">{isDual ? '53.5%' : '55%'}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase">Max Drawdown</div>
                <div className="text-xl font-bold text-red-400">{isDual ? '-10.4%' : '-8.87%'}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase">Trade/Anno</div>
                <div className="text-xl font-bold text-white">{isDual ? '~63' : '~29'}</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2 italic">
              *Dati basati su backtest storici (Bear market 2022 incluso). Le performance passate non garantiscono risultati futuri.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StrategyModal;