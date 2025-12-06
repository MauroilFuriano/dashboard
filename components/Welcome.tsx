import React, { useState } from 'react';
import { TrendingUp, Info, Calculator, AlertTriangle, CheckCircle, BarChart3, Shield, Zap, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PaymentModal from './PaymentModal';
import StrategyModal from './StrategyModal';

interface WelcomeProps {
  onNext: (type: 'SINGLE' | 'DUAL' | 'ANALYZER') => void;
  onAuthRequired: () => void;
  isLoggedIn: boolean;
}

const performanceData = [
  { name: 'Start', value: 10000 },
  { name: 'M 6', value: 10650 },
  { name: 'Y 1', value: 11350 },
  { name: 'Y 1.5', value: 12100 },
  { name: 'Y 2', value: 12883 },
  { name: 'Y 2.5', value: 13700 },
  { name: 'Y 3', value: 14620 },
];

const Welcome: React.FC<WelcomeProps> = ({ onNext, onAuthRequired, isLoggedIn }) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ name: string, price: string, type: 'SINGLE' | 'DUAL' | 'ANALYZER' }>({ name: '', price: '', type: 'SINGLE' });

  const handleSelect = (name: string, price: string, type: 'SINGLE' | 'DUAL' | 'ANALYZER') => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setSelectedProduct({ name, price, type });
    setIsPaymentOpen(true);
  };

  const openStrategy = (type: 'SINGLE' | 'DUAL' | 'ANALYZER') => {
    setSelectedProduct({ ...selectedProduct, type });
    setIsStrategyOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-700 h-full pb-0 flex flex-col relative">
      
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        planName={selectedProduct.name}
        price={selectedProduct.price}
        onSuccess={() => onNext(selectedProduct.type)}
      />
      <StrategyModal 
        isOpen={isStrategyOpen}
        onClose={() => setIsStrategyOpen(false)}
        type={selectedProduct.type}
      />

      {/* TITOLO */}
      <div className="text-left mb-6 shrink-0 relative z-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Backtest 2022-2025
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
          Scegli la tua <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Strategia</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch relative z-0">
        
        {/* --- COLONNA SINISTRA (Prodotti) --- */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* BANNER PRINCIPALE */}
          <div className="w-full shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20 relative group bg-slate-900">
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent"></div>
             <img 
               src="/banner-v3.jpg" 
               alt="Institutional AI"
               fetchPriority="high"
               loading="eager"
               className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 block"
             />
             <div className="absolute bottom-4 left-6">
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1 inline-block shadow-lg">
                  New Release
                </span>
                <h3 className="text-white font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Crypto Analyzer Pro</h3>
             </div>
          </div>

          {/* GRIGLIA PRODOTTI */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 pt-4">
            
            {/* CARD 1: BTC TREND */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all flex flex-col h-full justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50 z-0"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl border border-emerald-500/20"><Shield size={18} /></div>
                        <div className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase h-fit mt-0.5">Spot Only</div>
                    </div>
                    <button onClick={() => openStrategy('SINGLE')} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"><Info size={18} /></button>
                </div>
                
                <h3 className="font-bold text-white text-lg mb-1">BTC Trend</h3>
                <p className="text-xs text-slate-400 mb-4 h-[32px]">Accumulo sicuro su Bitcoin senza leva finanziaria.</p>
                
                {/* FIX: Altezza fissa 120px per allineamento perfetto */}
                <div className="space-y-2 mb-6 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 h-[120px] flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> Target 20-90% annuo</div>
                    <div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> No Rischio Liquidazione</div>
                    <div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> Operatività Automatica</div>
                </div>

                <div className="mt-auto">
                    {/* MODIFICATO: Prezzo 500 LIFETIME */}
                    <div className="flex justify-between items-end mb-3 border-t border-slate-800 pt-3">
                        <div className="text-xs text-slate-500">Prezzo</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-white">500€</span>
                            <span className="text-[10px] text-emerald-400 font-bold uppercase">Lifetime</span>
                        </div>
                    </div>
                    <button onClick={() => handleSelect('BTC Single', '500€', 'SINGLE')} className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                    Attiva BTC <TrendingUp size={16} />
                    </button>
                </div>
              </div>
            </div>

            {/* CARD 2: ANALYZER PRO */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/10 transition-all flex flex-col h-full justify-between relative overflow-visible group mt-0">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse pointer-events-none z-0"></div>
              
              <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg uppercase tracking-wider">BEST SELLER</span>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4 mt-2">
                    <div className="flex gap-2">
                        <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20"><Zap size={18} /></div>
                        <div className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase h-fit mt-0.5">AI Powered</div>
                    </div>
                    <button onClick={() => openStrategy('ANALYZER')} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"><Info size={18} /></button>
                </div>
                
                <h3 className="font-bold text-white text-lg mb-1">Analyzer Pro AI</h3>
                <p className="text-xs text-slate-400 mb-4 h-[32px]">Analisi predittiva Futures su Telegram.</p>
                
                {/* FIX: Altezza fissa 120px */}
                <div className="space-y-2 mb-6 bg-slate-950/50 p-3 rounded-xl border border-emerald-500/20 h-[120px] flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> Motore Gemini 2.5</div>
                    <div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> Analisi Futures (No Spot)</div>
                    <div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> Licenza A VITA</div>
                </div>

                <div className="mt-auto">
                    <div className="flex justify-between items-end mb-3 border-t border-slate-800 pt-3">
                        <div className="text-xs text-slate-500">Prezzo</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-white">99€</span>
                            <span className="text-[10px] text-emerald-400 font-bold uppercase">Lifetime</span>
                        </div>
                    </div>
                    <button onClick={() => handleSelect('Crypto Analyzer Pro', '99€', 'ANALYZER')} className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                    Acquista Licenza <Zap size={16} />
                    </button>
                </div>
              </div>
            </div>

            {/* CARD 3: DUAL ENGINE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all flex flex-col h-full justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50 z-0"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20"><Layers size={18} /></div>
                        <div className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase h-fit mt-0.5">Balanced</div>
                    </div>
                    <button onClick={() => openStrategy('DUAL')} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"><Info size={18} /></button>
                </div>
                
                <h3 className="font-bold text-white text-lg mb-1">Dual Engine</h3>
                <p className="text-xs text-slate-400 mb-4 h-[32px]">Strategia diversificata BTC + ETH.</p>
                
                {/* FIX: Altezza fissa 120px */}
                <div className="space-y-2 mb-6 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 h-[120px] flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> 60% BTC / 40% ETH</div>
                    <div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> Rebalancing Dinamico</div>
                    <div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle size={12} className="text-emerald-500 shrink-0" /> Target 20-90%</div>
                </div>

                <div className="mt-auto">
                    {/* MODIFICATO: Prezzo 500 LIFETIME */}
                    <div className="flex justify-between items-end mb-3 border-t border-slate-800 pt-3">
                        <div className="text-xs text-slate-500">Prezzo</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-white">500€</span>
                            <span className="text-[10px] text-emerald-400 font-bold uppercase">Lifetime</span>
                        </div>
                    </div>
                    <button onClick={() => handleSelect('Dual Combo', '500€', 'DUAL')} className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                    Attiva Dual <Layers size={16} />
                    </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- COLONNA DESTRA (Grafico) --- */}
        <div className="lg:col-span-5 flex flex-col h-full mt-4 lg:mt-0">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col h-full min-h-fit lg:min-h-[600px] relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>

             <div className="mb-8 relative z-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                      <TrendingUp className="text-emerald-400" size={22} /> Performance
                    </h3>
                    <p className="text-xs text-slate-500">Backtest Storico Cumulativo</p>
                  </div>
                  <div className="bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700">
                     <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Bullish
                     </div>
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6 relative z-0">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
                   <div className="text-[10px] text-slate-500 uppercase mb-1">Ritorno 3Y</div>
                   <div className="text-3xl font-bold text-emerald-400">+46.2%</div>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
                   <div className="text-[10px] text-slate-500 uppercase mb-1">Drawdown</div>
                   <div className="text-3xl font-bold text-white">-10.4%</div>
                </div>
             </div>

             <div className="mb-6 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3 relative z-0">
                <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                   <Calculator size={20} />
                </div>
                <div>
                   <div className="text-xs text-slate-400">Esempio Interesse Composto</div>
                   <div className="text-sm text-white font-medium">
                      $1,000 <span className="text-slate-500">→</span> <span className="text-emerald-400 font-bold">$1,462</span> (in 3 Anni)
                   </div>
                </div>
             </div>

             <div className="w-full relative z-0 mt-4 lg:mt-0" style={{ height: '300px', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                    <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }} 
                      formatter={(value) => [`$${value}`, 'Capitale']} 
                      labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#colorVal)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-800 relative z-0">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                   <span className="flex items-center gap-1"><CheckCircle size={12}/> Dati Blockchain</span>
                   <span className="flex items-center gap-1"><BarChart3 size={12}/> Aggiornato oggi</span>
                </div>
             </div>

           </div>
        </div>
      </div>

      {/* --- DISCLAIMER FOOTER COMPLETO --- */}
      <div className="mt-12 pt-6 border-t border-slate-800/50 text-center shrink-0 pb-4 relative z-0">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mb-2 uppercase font-bold tracking-wider">
              <AlertTriangle size={14} className="text-amber-500" />
              Disclaimer Legale & Rischi
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-4xl mx-auto">
              Il trading di criptovalute comporta un <strong>rischio elevato</strong> e potrebbe non essere adatto a tutti gli investitori. 
              Le performance passate mostrate nei backtest non sono indicative né garantiscono risultati futuri. 
              CryptoBot Elite fornisce un software di automazione, non consulenza finanziaria. L'utente è l'unico responsabile delle proprie decisioni di investimento e della gestione del rischio. 
              Si raccomanda di operare solo con capitali che ci si può permettere di perdere.
          </p>
      </div>

    </div>
  );
};

export default Welcome;