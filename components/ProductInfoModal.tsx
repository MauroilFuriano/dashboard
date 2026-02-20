import React from 'react';
import { X, Shield, Wallet, Bot, MessageSquare, TrendingUp, Zap, BarChart2, Brain, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import FocusLock from 'react-focus-lock';

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: 'analyzer' | 'bot';
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
      <FocusLock returnFocus>
        <div
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className={`p-5 border-b border-slate-800 flex justify-between items-center ${product === 'analyzer' ? 'bg-purple-500/10' : 'bg-emerald-500/10'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${product === 'analyzer' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {product === 'analyzer' ? <Brain size={24} /> : <Bot size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {product === 'analyzer' ? 'Crypto Analyzer Pro' : 'BTC Spot Bot'}
                </h3>
                <p className="text-xs text-slate-400">
                  {product === 'analyzer' ? 'Analisi Istituzionale AI-Powered' : 'Trading Automatico 24/7'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {product === 'analyzer' ? (
              // CRYPTO ANALYZER CONTENT
              <>
                {/* Intro */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <strong className="text-white">Crypto Analyzer Pro</strong> è un bot Telegram avanzato che analizza il mercato crypto
                    utilizzando <strong className="text-purple-400">dati istituzionali</strong> e <strong className="text-blue-400">intelligenza artificiale Gemini 2.5</strong>.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart2 className="text-blue-400" size={18} />
                      <span className="text-white font-bold text-sm">Analisi Tecnica</span>
                    </div>
                    <p className="text-xs text-slate-400">RSI, MACD, Bande di Bollinger, Fibonacci, e oltre 20 indicatori tecnici analizzati in tempo reale.</p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="text-emerald-400" size={18} />
                      <span className="text-white font-bold text-sm">Dati Istituzionali</span>
                    </div>
                    <p className="text-xs text-slate-400">Flussi whale, liquidazioni, Open Interest, funding rate e sentiment di mercato istituzionale.</p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="text-purple-400" size={18} />
                      <span className="text-white font-bold text-sm">AI Gemini 2.5</span>
                    </div>
                    <p className="text-xs text-slate-400">Intelligenza artificiale avanzata che elabora tutti i dati e genera analisi dettagliate con setup operativi.</p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="text-cyan-400" size={18} />
                      <span className="text-white font-bold text-sm">Bot Telegram</span>
                    </div>
                    <p className="text-xs text-slate-400">Ricevi analisi direttamente su Telegram. Chiedi al bot qualsiasi crypto e ottieni report istantanei.</p>
                  </div>
                </div>

                {/* Modes */}
                <div className="space-y-3">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <Zap className="text-yellow-400" size={16} />
                    Modalità Disponibili
                  </h4>

                  <div className="flex gap-3">
                    <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-lg p-3">
                      <span className="text-slate-400 text-xs font-bold uppercase">Freemium</span>
                      <p className="text-white text-sm font-bold mt-1">Gratis</p>
                      <p className="text-[10px] text-slate-500 mt-1">3 analisi/giorno, funzioni base</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-3">
                      <span className="text-amber-400 text-xs font-bold uppercase">PRO</span>
                      <p className="text-white text-sm font-bold mt-1">39€/mese</p>
                      <p className="text-[10px] text-slate-400 mt-1">Illimitato, tutte le funzioni</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // BTC SPOT BOT CONTENT
              <>
                {/* Intro */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <strong className="text-white">BTC Spot Bot</strong> è un sistema di trading automatico che opera su <strong className="text-emerald-400">Bitget</strong> 24 ore su 24,
                    eseguendo operazioni in completa autonomia basandosi su strategie algoritmiche testate.
                  </p>
                </div>

                {/* Security Alert */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-emerald-400 font-bold text-sm mb-1">Sicurezza delle Chiavi API</h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={12} />
                          <span>Le chiavi API sono <strong>criptate end-to-end</strong> e salvate in modo sicuro</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={12} />
                          <span>Il bot ha <strong>solo permessi di trading</strong>, non può prelevare fondi</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={12} />
                          <span>Nessuno ha accesso ai tuoi fondi - restano nel <strong>tuo wallet Bitget</strong></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How it works */}
                <div className="space-y-3">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <Bot className="text-emerald-400" size={16} />
                    Come Funziona
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">1</div>
                      <div>
                        <p className="text-white text-sm font-medium">Configura le Chiavi API</p>
                        <p className="text-[10px] text-slate-500">Crea chiavi API su Bitget con permessi solo trading (no prelievo)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">2</div>
                      <div>
                        <p className="text-white text-sm font-medium">Collega Telegram</p>
                        <p className="text-[10px] text-slate-500">Ricevi notifiche in tempo reale su ogni operazione del bot</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">3</div>
                      <div>
                        <p className="text-white text-sm font-medium">Il Bot Opera 24/7</p>
                        <p className="text-[10px] text-slate-500">Trading automatico basato su algoritmi, senza intervento manuale</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telegram Monitoring */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="text-blue-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-blue-400 font-bold text-sm mb-1">Monitoraggio via Telegram</h4>
                      <p className="text-xs text-slate-300">
                        Ogni operazione viene notificata in tempo reale sul tuo bot Telegram personale:
                        <strong className="text-white"> apertura posizioni, chiusure, profitti/perdite, stato del capitale</strong>.
                        Hai sempre il controllo completo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wallet Safety */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Wallet className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-amber-400 font-bold text-sm mb-1">I Tuoi Fondi Restano Tuoi</h4>
                      <p className="text-xs text-slate-300">
                        Il bot opera direttamente sul <strong className="text-white">tuo account Bitget</strong>.
                        I fondi non vengono mai trasferiti - rimangono sempre nel tuo wallet personale.
                        Puoi interrompere il bot in qualsiasi momento.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-lg p-3 text-center">
                    <span className="text-slate-400 text-xs font-bold uppercase">Mensile</span>
                    <p className="text-white text-lg font-bold mt-1">29€</p>
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                    <span className="text-emerald-400 text-xs font-bold uppercase">Annuale</span>
                    <p className="text-white text-lg font-bold mt-1">299€</p>
                    <p className="text-[10px] text-emerald-400">Risparmi 49€</p>
                  </div>
                </div>

                {/* Risk Warning */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={14} />
                  <p className="text-[10px] text-red-300">
                    <strong>Avviso:</strong> Il trading comporta rischi. I risultati passati non garantiscono rendimenti futuri.
                    Opera solo con capitali che puoi permetterti di perdere.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                product === 'analyzer'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              Ho Capito
            </button>
          </div>
        </div>
      </FocusLock>
    </div>
  );
};

export default ProductInfoModal;
