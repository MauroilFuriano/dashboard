import React from 'react';
import { AlertTriangle, ArrowRight, ExternalLink, PlayCircle } from 'lucide-react';

interface ExchangeConfigProps {
  onNext: () => void;
}

const ExchangeConfig: React.FC<ExchangeConfigProps> = ({ onNext }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Configurazione MEXC</h2>
        <p className="text-slate-400">Genera le chiavi API per permettere al bot di operare per te.</p>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 flex items-start space-x-4">
        <div className="shrink-0 mt-1">
          <AlertTriangle className="text-amber-500 w-6 h-6" />
        </div>
        <div>
          <h3 className="text-amber-500 font-bold text-lg">ATTENZIONE: Sicurezza Fondi</h3>
          <p className="text-amber-200/80 text-sm mt-1 leading-relaxed">
            Durante la creazione delle API, <span className="font-bold text-white underline">NON abilitare</span> mai l'opzione "Withdrawal" (Prelievo). 
            Il bot necessita solo dei permessi di <strong>Trading (Spot/Futures)</strong> e <strong>Lettura</strong>. 
            In questo modo i tuoi fondi rimangono sempre al sicuro.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Steps */}
        <div className="space-y-6">
          <div className="flex space-x-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center border border-slate-700">1</div>
            <div>
              <h4 className="text-lg font-medium text-white">Accedi o Registrati su MEXC</h4>
              <p className="text-slate-400 text-sm mt-1 mb-3">
                Fai il login. Se non hai un account, usa il link partner qui sotto per registrarti con vantaggi esclusivi.
              </p>
              <a 
                href="https://promote.mexc.com/r/b2QRLbsk" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-brand-900/20"
              >
                <span>Registrati su MEXC (Referral)</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center border border-slate-700">2</div>
            <div>
              <h4 className="text-lg font-medium text-white">Crea Nuova API Key</h4>
              <p className="text-slate-400 text-sm mt-1">Nel tuo profilo vai su "API Management" e clicca su "Create New API".</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center border border-slate-700">3</div>
            <div>
              <h4 className="text-lg font-medium text-white">Permessi e IP</h4>
              <p className="text-slate-400 text-sm mt-1">
                Seleziona <strong>"Spot Trading"</strong> e <strong>"Futures Trading"</strong>. 
                Lascia vuoto il campo IP (o chiedi al supporto l'IP del server se richiesto).
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-brand-900 text-brand-400 font-bold flex items-center justify-center border border-brand-700">4</div>
            <div>
              <h4 className="text-lg font-medium text-brand-400">Salva le chiavi</h4>
              <p className="text-slate-400 text-sm mt-1">
                Copia immediatamente la <strong>Access Key</strong> e la <strong>Secret Key</strong>. La Secret Key verrà mostrata una sola volta!
              </p>
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="flex flex-col space-y-4">
             <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl shadow-black/50">
                <div className="bg-slate-800 px-4 py-2 text-xs font-medium text-slate-400 border-b border-slate-700 flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                    <PlayCircle size={14} />
                    <span>Tutorial: Creazione API</span>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-700 rounded text-[10px] text-slate-300">1:13 min</span>
                </div>
                
                <div className="relative bg-black aspect-video group">
                    {/* MODIFICA: Aggiornato poster a banner-v3.jpg e aggiunto preload="none" */}
                    <video 
                      controls 
                      preload="none"
                      className="w-full h-full object-contain"
                      poster="/banner-v3.jpg" 
                    >
                      <source src="/mexc_tutorial.mp4" type="video/mp4" />
                      Il tuo browser non supporta il tag video.
                    </video>
                </div>

                <div className="p-4 bg-slate-900/50">
                    <h4 className="font-bold text-white text-sm">Guida Passo-Passo</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Segui esattamente i passaggi del video per creare le chiavi API corrette. 
                    Ricorda: <span className="text-amber-500 font-semibold">NO Withdrawal</span>.
                    </p>
                </div>
            </div>
            
            {/* Transcript / Notes */}
             <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 text-xs text-slate-400 space-y-2">
                 <p className="flex items-center"><span className="text-brand-400 font-bold w-12">00:05</span> <span>Vai su Profilo &rarr; Gestione API</span></p>
                 <p className="flex items-center"><span className="text-brand-400 font-bold w-12">00:16</span> <span>Spunta caselle "Account" e "Trading"</span></p>
                 <p className="flex items-center"><span className="text-brand-400 font-bold w-12">00:46</span> <span>Copia Access Key e Secret Key</span></p>
             </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button 
          onClick={onNext}
          className="group flex items-center space-x-2 bg-white text-slate-950 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-all"
        >
          <span>Ho le chiavi, procediamo</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ExchangeConfig;