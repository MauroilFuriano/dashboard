import React from 'react';
import { AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';

interface ExchangeConfigProps {
  onNext: () => void;
}

const ExchangeConfig: React.FC<ExchangeConfigProps> = ({ onNext }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Configurazione BITGET</h2>
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
              <h4 className="text-lg font-medium text-white">Accedi o Registrati su BITGET</h4>
              <p className="text-slate-400 text-sm mt-1 mb-3">
                Fai il login. Se non hai un account, usa il link partner qui sotto per registrarti con vantaggi esclusivi.
              </p>
              <a 
                href="https://share.bitget.com/u/DRPUAUPG" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-brand-900/20"
              >
                <span>Registrati su BITGET (Referral)</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center border border-slate-700">2</div>
            <div>
              <h4 className="text-lg font-medium text-white">Vai su Profilo → Chiave API</h4>
              <p className="text-slate-400 text-sm mt-1">
                Clicca sul tuo profilo in alto a destra, poi seleziona <strong>"Chiave API"</strong> dal menu.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center border border-slate-700">3</div>
            <div>
              <h4 className="text-lg font-medium text-white">Crea Chiave API Generata dal Sistema</h4>
              <p className="text-slate-400 text-sm mt-1">
                Clicca su <strong>"Crea una Chiave API"</strong>, poi seleziona <strong>"Chiave API Generata dal Sistema"</strong>.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center border border-slate-700">4</div>
            <div>
              <h4 className="text-lg font-medium text-white">Compila i Campi</h4>
              <div className="text-slate-400 text-sm mt-1 space-y-1">
                <p>• <strong>Note:</strong> Scrivi "Bot Spot" (o un nome a tua scelta)</p>
                <p>• <strong>Passphrase:</strong> Inserisci una password personale (memorizzala!)</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center border border-slate-700">5</div>
            <div>
              <h4 className="text-lg font-medium text-white">Seleziona Permessi</h4>
              <div className="text-slate-400 text-sm mt-1 space-y-1">
                <p>✅ <strong>Lettura</strong> (Read)</p>
                <p>✅ <strong>Scrittura</strong> (Write/Trade)</p>
                <p>✅ <strong>Spot</strong></p>
                <p>✅ <strong>Tassazione</strong></p>
                <p>✅ <strong>Portafoglio</strong></p>
                <p className="text-amber-500 font-bold">❌ Futures: LASCIA VUOTO</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-brand-900 text-brand-400 font-bold flex items-center justify-center border border-brand-700">6</div>
            <div>
              <h4 className="text-lg font-medium text-brand-400">Salva le Chiavi</h4>
              <p className="text-slate-400 text-sm mt-1">
                Dopo la creazione, copia immediatamente <strong>Access Key</strong>, <strong>Secret Key</strong> e <strong>Passphrase</strong>. 
                La Secret Key verrà mostrata una sola volta!
              </p>
            </div>
          </div>
        </div>

        {/* Tutorial Interattivo AI - IFRAME FULL SCREEN */}
        <div className="flex flex-col space-y-4">
             <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl shadow-black/50">
                <div className="bg-slate-800 px-4 py-3 text-xs font-medium text-slate-400 border-b border-slate-700 flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Tutorial Interattivo AI - Configurazione BITGET</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-500/20">LIVE ASSISTANT</span>
                </div>
                
                {/* IFRAME TUTORIAL AI */}
                <div className="relative bg-black" style={{ height: '600px' }}>
                    <iframe 
                      src="https://safetrade-mentor.vercel.app/" 
                      className="w-full h-full border-0"
                      title="Tutorial AI BITGET"
                      allow="clipboard-write"
                      sandbox="allow-same-origin allow-scripts allow-forms"
                    />
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                    <h4 className="font-bold text-white text-sm">💬 Assistente AI Interattivo</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Chatta con l'AI per ottenere supporto passo-passo nella creazione delle chiavi API su BITGET. 
                    <span className="text-amber-500 font-semibold"> Ricorda: NO Withdrawal</span>.
                    </p>
                </div>
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

