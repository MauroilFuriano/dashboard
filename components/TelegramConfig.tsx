import React from 'react';
import { MessageCircle, Bot, User, ArrowRight, PlayCircle, CheckCircle2 } from 'lucide-react';

interface TelegramConfigProps {
  onNext: () => void;
}

const TelegramConfig: React.FC<TelegramConfigProps> = ({ onNext }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Setup Telegram</h2>
        <p className="text-slate-400">Collega il tuo bot personale in meno di 2 minuti.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* --- COLONNA SINISTRA: VIDEO TUTORIAL --- */}
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl shadow-black/50 group">
                {/* Header Video */}
                <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <PlayCircle size={16} className="animate-pulse"/>
                        <span className="text-xs font-bold uppercase tracking-wider">Video Guida Ufficiale</span>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">HD 1080p</span>
                </div>
                
                {/* Player */}
                <div className="relative bg-black aspect-video">
                    {/* VIDEO FIX: Aggiunto preload="none" e poster aggiornato a banner-v3.jpg */}
                    <video 
                        controls 
                        preload="none"
                        playsInline
                        className="w-full h-full object-contain"
                        poster="/banner-v3.jpg" 
                    >
                        {/* Assicurati che il file video sia nella cartella public */}
                        <source src="/telegram_setup.mp4" type="video/mp4" />
                        Il tuo browser non supporta il video.
                    </video>
                </div>

                {/* Footer Video */}
                <div className="p-4 bg-slate-900/80">
                    <h4 className="text-white font-bold text-sm mb-1">Cosa imparerai:</h4>
                    <ul className="text-xs text-slate-400 space-y-1">
                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> Creare il bot con BotFather</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> Ottenere il Token segreto</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> Trovare il tuo Chat ID personale</li>
                    </ul>
                </div>
            </div>

            {/* Alert Consigli */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                <div className="mt-0.5"><MessageCircle className="text-blue-400" size={20} /></div>
                <div>
                    <h4 className="text-blue-400 font-bold text-sm">Consiglio Importante</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mt-1">
                        Dopo aver creato il bot su Telegram, ricordati di premere il tasto <strong>AVVIA</strong> nella chat del tuo nuovo bot, altrimenti non potrà inviarti messaggi!
                    </p>
                </div>
            </div>
        </div>

        {/* --- COLONNA DESTRA: ISTRUZIONI SCRITTE --- */}
        <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700 shrink-0">1</div>
                    <div>
                        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                            Crea il Bot <Bot size={16} className="text-emerald-500"/>
                        </h3>
                        <p className="text-sm text-slate-400 mb-3">
                            Apri <strong>@BotFather</strong> su Telegram e digita <code>/newbot</code>. Scegli un nome e uno username (es. <em>PippoBot</em>).
                        </p>
                        <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            Apri BotFather
                        </a>
                    </div>
                </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700 shrink-0">2</div>
                    <div>
                        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                            Copia il Token
                        </h3>
                        <p className="text-sm text-slate-400">
                            BotFather ti darà un codice lungo (Token). Copialo interamente, ti servirà nel prossimo passaggio.
                        </p>
                    </div>
                </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700 shrink-0">3</div>
                    <div>
                        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                            Trova il tuo ID <User size={16} className="text-purple-500"/>
                        </h3>
                        <p className="text-sm text-slate-400 mb-3">
                            Cerca <strong>@userinfobot</strong> su Telegram, avvialo e copia il numero "Id".
                        </p>
                         <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="inline-block bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            Apri UserInfoBot
                        </a>
                    </div>
                </div>
            </div>

        </div>
      </div>

      {/* Footer Action */}
      <div className="flex justify-end pt-6 border-t border-slate-800">
        <button 
          onClick={onNext}
          className="group flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 hover:-translate-y-1"
        >
          <span>Ho tutti i dati, procediamo</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default TelegramConfig;