import React from 'react';
import { Server, Wallet, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { Tab } from '../types';

interface WelcomeProps {
  onNext: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onNext }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 lg:p-12">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold tracking-wide mb-4 border border-brand-500/20">
            BENVENUTO A BORDO
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Inizia il tuo viaggio nel <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">Trading Automatico</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Grazie per aver scelto CryptoBot Elite. Il nostro sistema girerà per te H24 su server dedicati ad alta sicurezza. 
            Segui questa breve guida per configurare le tue API e collegare Telegram.
          </p>
        </div>
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 text-brand-400">
            <Wallet size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">1. Account MEXC</h3>
          <p className="text-slate-400 text-sm">
            Hai bisogno di un account verificato sull'exchange MEXC con i fondi USDT pronti per il trading.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 text-brand-400">
            <Smartphone size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">2. Telegram</h3>
          <p className="text-slate-400 text-sm">
            Un account Telegram attivo per ricevere notifiche in tempo reale sui profitti e lo stato del bot.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 text-brand-400">
            <Server size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">3. Attivazione</h3>
          <p className="text-slate-400 text-sm">
            Una volta raccolti i dati, attiverai il bot tramite questo pannello. Il setup richiede meno di 5 minuti.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button 
          onClick={onNext}
          className="group flex items-center space-x-2 bg-white text-slate-950 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-all"
        >
          <span>Inizia Configurazione</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Welcome;