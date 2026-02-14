import React, { useState, lazy, Suspense } from 'react';
import { TrendingUp, Info, AlertTriangle, CheckCircle, Shield, Zap, Video } from 'lucide-react';
import PaymentModal from './PaymentModal';
import StrategyModal from './StrategyModal';
import StripeCheckout from './StripeCheckout';

// ✅ LAZY LOAD: Code-split componente pesante (Recharts)
const AnalyzerReport = lazy(() => import('./AnalyzerReport'));

interface WelcomeProps {
  // Mantengo DUAL nel tipo per compatibilità con App.tsx, ma non sarà selezionabile nella UI
  onNext: (type: 'SINGLE' | 'DUAL' | 'ANALYZER') => void;
  onAuthRequired: () => void;
  isLoggedIn: boolean;
}

const Welcome: React.FC<WelcomeProps> = ({ onNext, onAuthRequired, isLoggedIn }) => {
  // VIDEO FILES
  const VIDEO_ANALYZER = "/presentazione.mp4";
  const VIDEO_BTC = "/presentazione_btc_trend.mp4";
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [stripeProduct, setStripeProduct] = useState<{ name: string; price: string }>({ name: 'Crypto Analyzer Pro', price: '59€' });
  const [selectedProduct, setSelectedProduct] = useState<{ name: string, price: string, priceUSDC: string, type: 'SINGLE' | 'DUAL' | 'ANALYZER' }>({ name: '', price: '', priceUSDC: '', type: 'SINGLE' });

  // Funzione per aprire Stripe con prodotto specifico
  const openStripe = (name: string, price: string) => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setStripeProduct({ name, price });
    setIsStripeOpen(true);
  };

  const handleSelect = (name: string, price: string, priceUSDC: string, type: 'SINGLE' | 'DUAL' | 'ANALYZER') => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setSelectedProduct({ name, price, priceUSDC, type });
    setIsPaymentOpen(true);
  };

  const openStrategy = (type: 'SINGLE' | 'DUAL' | 'ANALYZER') => {
    setSelectedProduct({ ...selectedProduct, type });
    setIsStrategyOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-700 h-full pb-0 flex flex-col relative space-y-8">

      {/* STRIPE MODAL */}
      {isStripeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <h3 className="text-xl font-bold text-white mb-4">Pagamento Sicuro</h3>
            <StripeCheckout
              planName={stripeProduct.name}
              price={stripeProduct.price}
              onCancel={() => setIsStripeOpen(false)}
            />
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        planName={selectedProduct.name}
        price={selectedProduct.price}
        priceUSDC={selectedProduct.priceUSDC}
        onSuccess={() => onNext(selectedProduct.type)}
      />
      <StrategyModal
        isOpen={isStrategyOpen}
        onClose={() => setIsStrategyOpen(false)}
        type={selectedProduct.type}
      />

      {/* TITOLO */}
      <div className="text-left shrink-0 relative z-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Dashboard v2.0
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
          Scegli la tua <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Strategia</span>
        </h1>
      </div>

      {/* GRIGLIA PRODOTTI E VIDEO (VIDEO GRANDI E NON TAGLIATI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 relative z-0">

        {/* --- COLONNA SINISTRA: CARD BTC + VIDEO BTC --- */}
        <div className="flex flex-col gap-8 md:gap-6 h-full">

          {/* 1. CARD BTC TREND */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50 z-0"></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl border border-emerald-500/20"><Shield size={20} /></div>
                  <div className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase h-fit mt-0.5">Spot Only</div>
                </div>
                <button onClick={() => openStrategy('SINGLE')} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"><Info size={18} /></button>
              </div>

              <h3 className="font-bold text-white text-xl mb-1">BTC Trend</h3>
              <p className="text-sm text-slate-400 mb-6">Accumulo sicuro su Bitcoin senza leva finanziaria. Ideale per holding di lungo termine.</p>

              {/* Lista caratteristiche allineata */}
              <div className="space-y-4 mb-6 bg-slate-950/50 p-5 rounded-xl border border-slate-800/50 flex-1 min-h-[200px] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Target 35-60% annuo</div>
                <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> No Rischio Liquidazione</div>
                <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Operatività Automatica H4</div>
                <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Gestione Rischio Dinamica</div>
              </div>

              <div className="mt-auto space-y-4">
                {/* PIANO MENSILE */}
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase font-bold">Mensile</span>
                      <span className="text-xl font-bold text-white">29€<span className="text-xs text-slate-400 font-normal">/mese</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelect('BTC Trend Mensile', '29€', '35', 'SINGLE')}
                      className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs transition-all border border-emerald-500/30 hover:border-emerald-400/50 flex items-center justify-center gap-1.5"
                      style={{ textShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }}
                    >
                      <TrendingUp size={14} /> Crypto
                    </button>
                    <button
                      onClick={() => openStripe('BTC Trend Mensile', '29€')}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-900 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                    >
                      💳 Carta
                    </button>
                  </div>
                </div>

                {/* PIANO ANNUALE */}
                <div className="border-t border-slate-800/50 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 uppercase font-bold">Annuale</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">RISPARMIA 15%</span>
                      </div>
                      <span className="text-xl font-bold text-white">299€<span className="text-xs text-slate-400 font-normal">/anno</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelect('BTC Trend Annuale', '299€', '355', 'SINGLE')}
                      className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs transition-all border border-emerald-500/30 hover:border-emerald-400/50 flex items-center justify-center gap-1.5"
                      style={{ textShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }}
                    >
                      <TrendingUp size={14} /> Crypto
                    </button>
                    <button
                      onClick={() => openStripe('BTC Trend Annuale', '299€')}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-900 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                    >
                      💳 Carta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. VIDEO WIDGET BTC - ✅ FIX APPLICATO */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg group relative">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                <Video className="text-emerald-500" size={18} />
                Presentazione BTC Trend
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                Live
              </span>
            </div>

            {/* ✅ FIX iOS 14: Usa padding-bottom invece di aspect-ratio */}
            <div className="w-full bg-black relative" style={{ paddingBottom: '56.25%' }}>
              <video
                src={VIDEO_BTC}
                className="absolute inset-0 w-full h-full rounded-b-xl object-contain"
                controls
                controlsList="nodownload"
                playsInline
                preload="none"
                poster="/banner-v3.jpg"
              >
                <track
                  kind="captions"
                  src="/captions/presentazione_btc.vtt"
                  srcLang="it"
                  label="Italiano"
                  default
                />
                Il tuo browser non supporta il tag video.
              </video>
            </div>
            <div className="p-3 bg-slate-900/80 text-[10px] text-slate-500 border-t border-slate-800">
              Guarda il funzionamento del bot Spot.
            </div>
          </div>

        </div>

        {/* --- COLONNA DESTRA: CARD ANALYZER + VIDEO ANALYZER --- */}
        <div className="flex flex-col gap-8 md:gap-6 h-full">

          {/* 1. CARD ANALYZER PRO */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/10 transition-all flex flex-col h-full relative overflow-visible group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse pointer-events-none z-0"></div>

            <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg uppercase tracking-wider">BEST SELLER</span>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4 mt-2">
                <div className="flex gap-2">
                  <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20"><Zap size={20} /></div>
                  <div className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase h-fit mt-0.5">AI Powered</div>
                </div>
                <button onClick={() => openStrategy('ANALYZER')} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"><Info size={18} /></button>
              </div>

              <h3 className="font-bold text-white text-xl mb-1">Crypto Analyzer Pro</h3>
              <p className="text-sm text-slate-400 mb-6">Analisi predittiva Futures su Telegram powered by Gemini 2.5.</p>

              {/* Lista caratteristiche allineata */}
              <div className="space-y-4 mb-6 bg-slate-950/50 p-5 rounded-xl border border-emerald-500/20 flex-1 min-h-[200px] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Motore Gemini 2.5</div>
                <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Analisi Futures (No Spot)</div>
                <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Segnali in Tempo Reale</div>
                <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Setup Long & Short</div>
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex justify-between items-end border-t border-slate-800 pt-4">
                  <div className="text-xs text-slate-500 uppercase font-bold">Prezzo</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">59€</span>
                    <span className="text-xs text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">Mensile</span>
                  </div>
                </div>

                {/* BOTTONE STRIPE - Verde Neon */}
                <button
                  onClick={() => openStripe('Crypto Analyzer Pro', '59€')}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-900 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-emerald-400/40"
                  style={{ textShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}
                >
                  💳 Paga con Carta
                </button>

                {/* BOTTONE CRYPTO - Verde Matrix Translucido */}
                <button
                  onClick={() => handleSelect('Crypto Analyzer Pro', '59€', '70', 'ANALYZER')}
                  className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-sm transition-all border border-emerald-500/30 hover:border-emerald-400/50 flex items-center justify-center gap-2 backdrop-blur-sm"
                  style={{ textShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }}
                >
                  <TrendingUp size={16} /> Paga con Crypto
                </button>
              </div>
            </div>
          </div>

          {/* 2. VIDEO WIDGET ANALYZER - ✅ FIX APPLICATO */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg group relative">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                <Video className="text-emerald-500" size={18} />
                Presentazione Analyzer Pro
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                Demo
              </span>
            </div>

            {/* ✅ FIX iOS 14: Usa padding-bottom invece di aspect-ratio */}
            <div className="w-full bg-black relative" style={{ paddingBottom: '56.25%' }}>
              <video
                src={VIDEO_ANALYZER}
                className="absolute inset-0 w-full h-full rounded-b-xl object-contain"
                controls
                controlsList="nodownload"
                playsInline
                preload="none"
                poster="/banner-v3.jpg"
              >
                <track
                  kind="captions"
                  src="/captions/presentazione_analyzer.vtt"
                  srcLang="it"
                  label="Italiano"
                  default
                />
                Il tuo browser non supporta il tag video.
              </video>
            </div>
            <div className="p-3 bg-slate-900/80 text-[10px] text-slate-500 border-t border-slate-800">
              Scopri l'intelligenza artificiale al servizio del trading.
            </div>
          </div>

        </div>

      </div>

      {/* ANALYZER REPORT - LAZY LOADED */}
      <div className="mt-12">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        }>
          <AnalyzerReport />
        </Suspense>
      </div>

      {/* DISCLAIMER FOOTER - IN FONDO ALLA PAGINA */}
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


