/**
 * StripeCheckout.tsx - Componente per pagamento con Stripe Payment Links
 * 
 * Flusso:
 * 1. Genera activation_token univoco
 * 2. Salva record su stripe_payments con status='pending'
 * 3. Redirect a Stripe Payment Link
 * 4. Al ritorno, admin approva manualmente su Supabase
 */

import React, { useState } from 'react';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

interface StripeCheckoutProps {
    planName: string;
    price: string;
    onCancel?: () => void;
}

/**
 * Genera un token di attivazione univoco
 */
const generateActivationToken = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ planName, price, onCancel }) => {
    const [loading, setLoading] = useState(false);

    const handleStripeCheckout = async () => {
        setLoading(true);

        try {
            // 1. Ottieni l'utente corrente
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || !user.email) {
                toast.error('Devi essere loggato per procedere al pagamento');
                setLoading(false);
                return;
            }

            // 2. Controlla se ha già un pagamento in corso o completato (SOLO per Crypto Analyzer Pro)
            if (planName === 'Crypto Analyzer Pro') {
                const { data: existing } = await supabase
                    .from('stripe_payments')
                    .select('id, status')
                    .eq('user_email', user.email)
                    .in('status', ['pending', 'completed']);

                if (existing && existing.length > 0) {
                    const status = existing[0].status;
                    setLoading(false);
                    if (status === 'completed') {
                        toast.error('Hai già acquistato questo piano!', { icon: '✅' });
                    } else {
                        toast.error('Hai già un pagamento in sospeso.', { icon: '⏳' });
                    }
                    return;
                }
            }

            // 3. Genera token di attivazione
            const activationToken = generateActivationToken();

            // 4. Salva record preliminare su Supabase SOLO per Crypto Analyzer Pro
            // I prodotti BTC usano btc-spot-webhook che salva in tabelle diverse
            if (planName === 'Crypto Analyzer Pro') {
                const { error: insertError } = await supabase
                    .from('stripe_payments')
                    .insert([{
                        user_email: user.email,
                        plan_type: 'monthly',
                        status: 'pending',
                        activation_token: activationToken,
                        amount: 5900, // €59 in centesimi
                        currency: 'eur'
                    }]);

                if (insertError) {
                    console.error('Errore insert:', insertError);
                    toast.error('Errore nella preparazione del pagamento');
                    setLoading(false);
                    return;
                }
            }

            // 5. Redirect al Stripe Payment Link
            // Mappa dei Payment Links per ogni prodotto
            const PAYMENT_LINKS: { [key: string]: string } = {
                'Crypto Analyzer Pro': 'https://buy.stripe.com/28E6oJdsIboS9Uz7nE5Ne01', // TEST Crypto Analyzer 1€
                'BTC Trend Mensile': 'https://buy.stripe.com/9B64gB88o3Wq6In23k5Ne04',   // TEST BTC Trend (Vecchio link distinto)
                'BTC Trend Annuale': 'https://buy.stripe.com/00wdRb4WcfF8giX8rI5Ne03',   // €299
            };

            // Seleziona il link corretto in base al piano
            const STRIPE_PAYMENT_LINK = PAYMENT_LINKS[planName] || PAYMENT_LINKS['Crypto Analyzer Pro'];

            // Aggiungi email come parametro per pre-compilare il checkout
            const checkoutUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(user.email)}&client_reference_id=${activationToken}`;

            // Redirect al checkout Stripe
            window.location.href = checkoutUrl;

        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error('Errore durante il checkout: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Pulsante principale Stripe */}
            <button
                onClick={handleStripeCheckout}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-base transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-3 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Reindirizzamento a Stripe...
                    </>
                ) : (
                    <>
                        <CreditCard size={20} />
                        Paga con Carta - {price}
                        <ExternalLink size={16} className="opacity-60" />
                    </>
                )}
            </button>

            {/* Info sicurezza */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Pagamento sicuro gestito da Stripe
            </div>

            {/* Link annulla */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="w-full py-2 text-slate-500 hover:text-white text-sm transition-colors"
                >
                    Annulla
                </button>
            )}
        </div>
    );
};

export default StripeCheckout;
