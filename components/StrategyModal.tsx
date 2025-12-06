import React from 'react';
import { X, Activity, Shield, Crosshair, BarChart2, Download, FileText, Smartphone, Zap, Cpu, BrainCircuit, LineChart, TrendingUp, ExternalLink, Lock, Gift, Layers, Anchor } from 'lucide-react';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'SINGLE' | 'DUAL' | 'ANALYZER';
}

const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const isDual = type === 'DUAL';
  const isSingle = type === 'SINGLE';
  const isAnalyzer = type === 'ANALYZER';

  // Contenuto dinamico Titoli
  let title = '';
  let subtitle = '';
  let downloadLink = '';

  if (isAnalyzer) {
    title = 'Crypto Analyzer Pro';
    subtitle = 'Architettura Ibrida: Algoritmo + Gemini AI';
    downloadLink = '/reports/Guida_Analyzer_Pro.pdf'; 
  } else if (isDual) {
    title = 'Dual Engine (BTC + ETH)';
    subtitle = 'Diversificazione Dinamica & Rebalancing';
    downloadLink = '/reports/Report_Dual_Engine.pdf';
  } else {
    title = 'BTC Trend Following';
    subtitle = 'Algoritmo di Stabilità & Accumulo';
    downloadLink = '/reports/Report_BTC_Trend.pdf';
  }

  // Banner Referral Comune
  const ReferralBanner = () => (
    <div className="mt-6 bg-gradient-to-r from-slate-900 to-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Partner Ufficiale</span>
            </div>
            <h4 className="text-white font-bold text-sm">Ottimizzato per MEXC Exchange</h4>
            <p className="text-xs text-slate-400 mt-1">Zero Commissioni Maker (0%) & Bonus Benvenuto</p>
        </div>

        <a 
            href="https://promote.mexc.com/r/b2QRLbsk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative z-10 bg-white text-slate-950 hover:bg-emerald-50 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
        >
            Registrati Ora
            <ExternalLink size={12} />
        </a>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-emerald-400 font-medium text-sm">{subtitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-300 flex-1">
          
          {/* --- CASO 1: CRYPTO ANALYZER PRO --- */}
          {isAnalyzer && (
            <>
              <div className="bg-gradient-to-r from-emerald-900/20 to-slate-900 border border-emerald-500/20 p-5 rounded-xl flex gap-4">
                 <div className="mt-1 bg-emerald-500/10 p-2 rounded-lg h-fit"><BrainCircuit className="text-emerald-400" size={24} /></div>
                 <div>
                    <h4 className="text-white font-bold mb-2">Come funziona il Motore Ibrido?</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        Questo bot non si limita a leggere un grafico. Unisce due intelligenze per la massima affidabilità:
                        <br/><br/>
                        1. <strong>Algoritmo Matematico:</strong> Elabora una confluenza di <strong>indicatori tecnici istituzionali</strong> per individuare livelli di prezzo e trend con precisione millimetrica.
                        <br/>
                        2. <strong>AI Istituzionale (Gemini 2.5):</strong> Analizza il <em>contesto macro</em>. Legge le news, interpreta il Funding Rate e l'Open Interest per <strong>potenziare il segnale</strong> e validare la forza del movimento.
                    </p>
                 </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <LineChart className="text-emerald-500" /> Strumenti di Analisi
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <strong className="text-white block mb-1 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> VWAP Istituzionale
                    </strong>
                    <p className="text-xs text-slate-400">Calcola il prezzo medio ponderato dai volumi, benchmark usato dai fondi.</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <strong className="text-white block mb-1 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> Analisi Derivati
                    </strong>
                    <p className="text-xs text-slate-400">L'AI incrocia Funding Rate e Open Interest per prevedere squeeze.</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <strong className="text-white block mb-1 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Radar Volatilità
                    </strong>
                    <p className="text-xs text-slate-400">Alert immediati se una crypto fa un movimento anomalo (&gt; 2%).</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <strong className="text-white block mb-1 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Smart Entry
                    </strong>
                    <p className="text-xs text-slate-400">Strategia "Lock-in" e suggerimenti di ingresso Limit per risparmiare fee.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* --- CASO 2: BOT AUTOMATICI (BTC o DUAL) --- */}
          {!isAnalyzer && (
            <>
              {/* DESCRIZIONE SPECIFICA DEL BOT SCELTO (BTC o DUAL) */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-lg">
                 <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    {isDual ? <Layers className="text-indigo-400"/> : <Anchor className="text-amber-400"/>}
                    Strategia Operativa
                 </h4>
                 
                 {isSingle && (
                    <p className="text-sm text-slate-300 leading-relaxed">
                        Questo algoritmo è progettato per seguire i <strong>grandi trend di Bitcoin</strong>. 
                        Filtra il rumore laterale e punta a catturare le espansioni di prezzo, proteggendo il capitale durante i bear market con un sistema di <em>Trailing Stop adattivo</em>. Ideale per chi cerca stabilità e accumulo.
                    </p>
                 )}

                 {isDual && (
                    <p className="text-sm text-slate-300 leading-relaxed">
                        Il sistema bilancia dinamicamente l'esposizione tra <strong>Bitcoin ed Ethereum</strong>. 
                        Sfrutta la rotazione della liquidità tra le due crypto principali per massimizzare i rendimenti quando le altcoin spingono, e si rifugia in BTC quando la dominance sale. Ottimo per diversificare il rischio.
                    </p>
                 )}
              </div>

              {/* DESCRIZIONE GENERICA SICUREZZA (Uguale per entrambi) */}
              <div className="space-y-4 mt-6">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="text-emerald-500" /> Operatività Hands-Free
                </h4>
                <p className="text-sm text-slate-300">
                    Trasforma il tuo account in un fondo di trading automatico sicuro e gestito.
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex gap-4 items-start">
                      <div className="mt-1 bg-blue-500/10 p-2 rounded-lg text-blue-400"><Smartphone size={20}/></div>
                      <div>
                          <strong className="text-white block mb-1 text-sm">Controllo Totale</strong>
                          <p className="text-slate-400 text-xs leading-relaxed">
                              I fondi non lasciano mai il tuo wallet. Tu vedi tutto dall'app, il bot esegue solo gli ordini.
                          </p>
                      </div>
                   </div>
                   
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex gap-4 items-start">
                      <div className="mt-1 bg-green-500/10 p-2 rounded-lg text-green-400"><Lock size={20}/></div>
                      <div>
                          <strong className="text-white block mb-1 text-sm">Sicurezza "No-Withdrawal"</strong>
                          <p className="text-slate-400 text-xs leading-relaxed">
                              Le chiavi API necessitano solo dei permessi di <strong>Trading</strong>. Il prelievo è disabilitato tecnicamente.
                          </p>
                      </div>
                   </div>
                </div>
              </div>
            </>
          )}
          
          {/* Banner Referral (Sempre visibile) */}
          <ReferralBanner />

        </div>

        {/* FOOTER DOWNLOAD */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded-lg text-slate-400">
                    <FileText size={24} />
                </div>
                <div>
                    <div className="text-white font-medium text-sm">Manuale Operativo</div>
                    <div className="text-slate-500 text-xs">{isAnalyzer ? 'Guida Comandi & Strategia' : 'Backtest & Equity Curve'}</div>
                </div>
            </div>
            
            <a 
                href={downloadLink} 
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-slate-700 hover:border-slate-500"
            >
                <Download size={18} />
                Scarica PDF
            </a>
        </div>

      </div>
    </div>
  );
};

export default StrategyModal;