import React, { useState } from 'react';
import { TrendingUp, Info, Shield, Zap, CheckCircle, BarChart3, Calculator, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PaymentModal from './PaymentModal';
import StrategyModal from './StrategyModal';

interface WelcomeProps {
  onNext: () => void;
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

const Welcome: React.FC<WelcomeProps> = ({ onNext }) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ name: string, price: string, type: 'SINGLE' | 'DUAL' }>({ name: '', price: '', type: 'SINGLE' });

  const handleSelect = (name: string, price: string, type: 'SINGLE' | 'DUAL') => {
    setSelectedProduct({ name, price, type });
    setIsPaymentOpen(true);
  };

  const openStrategy = (type: 'SINGLE' | 'DUAL') => {
    setSelectedProduct({ ...selectedProduct, type });
    setIsStrategyOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-700 h-full pb-0 flex flex-col">
      
      {/* Modals */}
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        planName={selectedProduct.name}
        price={selectedProduct.price}
        onSuccess={onNext}
      />
      <StrategyModal 
        isOpen={isStrategyOpen}
        onClose={() => setIsStrategyOpen(false)}
        type={selectedProduct.type}
      />

      {/* TITOLO */}
      <div className="text-left mb-6 shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Backtest 2022-2025
        </div>
        <h1 className="text-4xl font-bold text-white leading-tight">
          Scegli la tua <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Strategia</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        
        {/* --- COLONNA SINISTRA (60%) --- */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. IMMAGINE BOT (Modificata: senza contenitore, full width) */}
          <div className="w-full shrink-0">
             <img 
               src="/bot-mascot.jpg" 
               alt="Crypto Bot AI" 
               className="w-full h-auto rounded-2xl object-cover shadow-xl"
               onError={(e) => {
                 // Fallback immagine se la tua non carica
                 e.currentTarget.src = "https://img.freepik.com/free-photo/futuristic-robot-artificial-intelligence-concept_23-2151042259.jpg?t=st=1710685000~exp=1710688600~hmac=e309e82852225676748717886692196094168559257661761485182883886062&w=1380";
               }}
             />
          </div>

          {/* 2. I PRODOTTI */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            
            {/* CARD BTC */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group relative flex flex-col h-full justify-between">
              <div className="absolute top-4 right-4">
                 <button onClick={() => openStrategy('SINGLE')} className="text-slate-500 hover:text-emerald-400 transition-colors"><Info size={18} /></button>
              </div>
              
              <div>
                <div className="bg-amber-500/10 text-amber-500 w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg mb-3">₿</div>
                <h3 className="font-bold text-white text-lg">BTC Trend</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">Stabilità per investitori prudenti.</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Target</span> <span className="text-emerald-400 font-bold">13-18%</span>
                </li>
                <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Trade</span> <span className="text-white">~29/anno</span>
                </li>
                <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Rischio</span> <span className="text-white font-medium flex items-center gap-1"><Shield size={12} className="text-emerald-500"/> Contenuto</span>
                </li>
              </ul>

              <div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-white">29€</span>
                  <span className="text-slate-500 text-sm">/mese</span>
                </div>
                <button 
                  onClick={() => handleSelect('BTC Single', '29€', 'SINGLE')} 
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  Attiva BTC Bot
                </button>
              </div>
            </div>

            {/* CARD DUAL */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500 transition-all group relative flex flex-col h-full justify-between ring-1 ring-emerald-500/10 shadow-xl shadow-emerald-900/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg uppercase tracking-wider">
                Consigliato
              </div>
              <div className="absolute top-4 right-4">
                 <button onClick={() => openStrategy('DUAL')} className="text-slate-500 hover:text-emerald-400 transition-colors"><Info size={18} /></button>
              </div>
              
              <div>
                <div className="flex -space-x-2 mb-3">
                   <div className="bg-amber-500/10 text-amber-500 w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg border-2 border-slate-900 z-10">₿</div>
                   <div className="bg-indigo-500/10 text-indigo-500 w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg border-2 border-slate-900">Ξ</div>
                </div>
                <h3 className="font-bold text-white text-lg">Dual Engine</h3>
                <p className="text-xs text-emerald-400/80 mt-1 mb-4">Diversificazione 60/40 dinamica.</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Target</span> <span className="text-emerald-400 font-bold">14-20%</span>
                </li>
                <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Trade</span> <span className="text-white">~63/anno</span>
                </li>
                <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Rischio</span> <span className="text-white font-medium flex items-center gap-1"><Zap size={12} className="text-yellow-400"/> Moderato</span>
                </li>
              </ul>

              <div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-white">49€</span>
                  <span className="text-slate-500 text-sm">/mese</span>
                  <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">-20%</span>
                </div>
                <button 
                  onClick={() => handleSelect('Dual Combo', '49€', 'DUAL')} 
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  Attiva Dual System
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* --- COLONNA DESTRA (40%): Grafico --- */}
        <div className="lg:col-span-5 flex flex-col h-full">
           <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col h-full min-h-[600px] relative overflow-hidden shadow-2xl">
             
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>

             <div className="mb-8 relative z-10">
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

             <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
                   <div className="text-[10px] text-slate-500 uppercase mb-1">Ritorno 3Y</div>
                   <div className="text-3xl font-bold text-emerald-400">+46.2%</div>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
                   <div className="text-[10px] text-slate-500 uppercase mb-1">Drawdown</div>
                   <div className="text-3xl font-bold text-white">-10.4%</div>
                </div>
             </div>

             <div className="mb-6 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3 relative z-10">
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

             <div className="flex-1 w-full min-h-[250px] relative z-10">
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
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#colorVal)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                   <span className="flex items-center gap-1"><CheckCircle size={12}/> Dati Blockchain</span>
                   <span className="flex items-center gap-1"><BarChart3 size={12}/> Aggiornato oggi</span>
                </div>
             </div>

           </div>
        </div>
      </div>

      {/* --- DISCLAIMER FOOTER (Nuova Aggiunta) --- */}
      <div className="mt-12 pt-6 border-t border-slate-800/50 text-center shrink-0 pb-4">
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