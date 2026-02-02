# 🚀 CryptoBot Elite Dashboard

Dashboard cliente per la gestione di bot di trading automatico su criptovalute e servizio di analisi AI.

## 📋 Panoramica

CryptoBot Elite offre due prodotti principali:

- **BTC Trend** - Bot automatico per trading spot su Bitcoin con strategia trend following
- **Analyzer Pro AI** - Servizio di analisi predittiva Futures powered by Gemini 2.5 su Telegram

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Auth + Database)
- **Grafici:** Recharts
- **Icone:** Lucide React
- **Notifiche:** React Hot Toast

## 📦 Prerequisiti

- Node.js 18+
- Account Supabase configurato

## ⚙️ Configurazione

1. Clona il repository
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Crea il file `.env.local` con le variabili:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_ENCRYPTION_KEY=your_encryption_key
   ```

## 🚀 Avvio

```bash
# Modalità sviluppo
npm run dev

# Build produzione
npm run build

# Preview build
npm run preview
```

## 📁 Struttura Progetto

```
├── components/           # Componenti React
│   ├── Welcome.tsx       # Homepage con prodotti
│   ├── AnalyzerReport.tsx # Report backtest con grafici
│   ├── AnalyzerBotPage.tsx # Gestione bot Analyzer
│   ├── ExchangeConfig.tsx # Configurazione API exchange
│   ├── TelegramConfig.tsx # Configurazione bot Telegram
│   ├── ActivationForm.tsx # Form attivazione bot
│   ├── PaymentModal.tsx   # Modal pagamento crypto
│   ├── StrategyModal.tsx  # Modal info strategie
│   ├── Sidebar.tsx        # Navigazione laterale
│   └── ...
├── public/               # Asset statici
│   ├── captions/         # Sottotitoli video WebVTT
│   └── reports/          # PDF scaricabili
├── App.tsx               # Componente principale
├── supabase.ts           # Client Supabase
├── index.css             # Stili globali + Tailwind
└── vite.config.ts        # Configurazione Vite
```

## 🔐 Sicurezza

- **RLS attivo** su tutte le tabelle Supabase
- **Crittografia API keys** lato client prima del salvataggio
- **No Withdrawal** - Le chiavi API richiedono solo permessi di trading
- **Sanitizzazione input** con DOMPurify

## ♿ Accessibilità (A11Y)

- ARIA labels su tutti i controlli interattivi
- Focus trap nei modali
- Skip navigation link
- Contrasto colori WCAG AA
- Sottotitoli video WebVTT

## 📱 Responsive

- Layout mobile-first
- Sidebar collassabile
- Grafici adattivi con min-width
- Video aspect ratio per iOS 14+
- Safe area per notch iOS

## 📄 Licenza

Proprietario - CryptoBot Elite © 2025
