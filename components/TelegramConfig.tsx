import React from 'react';
import { MessageCircle, Bot, User, ArrowRight, Copy } from 'lucide-react';

interface TelegramConfigProps {
  onNext: () => void;
}

const TelegramConfig: React.FC<TelegramConfigProps> = ({ onNext }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast here
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Setup Telegram</h2>
        <p className="text-slate-400">Configura il tuo assistente personale per le notifiche.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Step A: Create Bot */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">Crea il Bot</h3>
          </div>

          <ol className="space-y-4 text-sm text-slate-400 list-decimal pl-4 marker:text-slate-600">
            <li>Apri Telegram e cerca <strong className="text-white">@BotFather</strong>.</li>
            <li>Avvia la chat e digita <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">/newbot</code>.</li>
            <li>Scegli un nome per il tuo bot (es. <em>MarioTradingBot</em>).</li>
            <li>Scegli uno username che finisca in "bot" (es. <em>mario_trading_bot</em>).</li>
            <li className="text-white font-medium bg-blue-900/20 p-2 rounded border border-blue-500/20">
              BotFather ti darà un <strong>TOKEN</strong>. Copialo, ti servirà tra poco!
            </li>
          </ol>
        </div>

        {/* Step B: Get User ID */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <User size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">Il tuo Chat ID</h3>
          </div>

          <ol className="space-y-4 text-sm text-slate-400 list-decimal pl-4 marker:text-slate-600">
            <li>Cerca su Telegram <strong className="text-white">@userinfobot</strong>.</li>
            <li>Avvia la chat o digita <code className="bg-slate-800 px-1 py-0.5 rounded text-purple-300">/start</code>.</li>
            <li>Il bot risponderà immediatamente con il tuo ID numerico.</li>
            <li className="text-white font-medium bg-purple-900/20 p-2 rounded border border-purple-500/20">
              Copia il numero "Id" (es. <em>123456789</em>). Questo serve per inviare i messaggi solo a te.
            </li>
          </ol>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-sm text-slate-400">
          <span className="text-brand-400 font-bold block mb-1">Consiglio Pro:</span>
          Una volta creato il tuo bot, cercalo su Telegram e premi "Avvia". Se non lo fai, non potrà scriverti!
        </div>
        <a 
          href="https://t.me/BotFather" 
          target="_blank" 
          rel="noreferrer"
          className="text-center sm:text-left shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Apri @BotFather
        </a>
      </div>

      <div className="flex justify-end pt-6">
        <button 
          onClick={onNext}
          className="group flex items-center space-x-2 bg-white text-slate-950 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-all"
        >
          <span>Ho tutti i dati</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default TelegramConfig;