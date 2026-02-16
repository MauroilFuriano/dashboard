// @ts-nocheck
/**
 * stripe-webhook/index.ts - Webhook Stripe per Crypto Analyzer Pro
 * =================================================================
 * v16 - Aggiunta gestione scadenze abbonamenti + notifiche
 * 
 * Eventi gestiti:
 * - checkout.session.completed → Pagamento completato, salva expires_at
 * - invoice.paid → Rinnovo abbonamento, estende expires_at
 * - customer.subscription.deleted → Abbonamento cancellato → status expired
 * - invoice.payment_failed → Pagamento fallito → notifica admin
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

declare const Deno: any;

// =============================================================================
// CONFIGURAZIONE
// =============================================================================

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const ADMIN_CHAT_ID = Deno.env.get('ADMIN_CHAT_ID') || '5454410388';

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

// =============================================================================
// HANDLER PRINCIPALE
// =============================================================================

// Product IDs validi per Crypto Analyzer (ignorare BTC Spot e altri)
const ALLOWED_PRODUCT_IDS = [
    'prod_TuoDbBPoQ0Lrvn', // Crypto Analyzer Pro - Standard
    'prod_TuoBNeViu26GBm', // Crypto Analyzer Pro - Early Bird
    'prod_TwNAWdsxQTRD4a', // Test Crypto Analyzer
    'prod_TwhMvbUdxnOGre', // [TEST] Verifica Flusso - 1€ (usato per debug)
    'prod_TwhMvbUdxnOGre' // Safe duplicate
];

Deno.serve(async (req: Request) => {
    const logs: string[] = [];
    const log = (msg: string) => {
        const line = `[${new Date().toISOString()}] ${msg}`;
        console.log(line);
        logs.push(line);
    };

    log('=== STRIPE WEBHOOK v17 (Product Filter) ===');

    // Endpoint di debug GET
    if (req.method === 'GET') {
        log('DEBUG CHECK: Testing DB Connection...');
        try {
            const { data, error } = await supabase.from('webhook_debug_logs').insert([{ logs: 'DB CONNECTION TEST SUCCESSFUL' }]).select();
            if (error) throw error;
            return new Response(JSON.stringify({ status: 'ok', data }), { headers: { 'Content-Type': 'application/json' } });
        } catch (err: any) {
            return new Response(JSON.stringify({ status: 'error', message: err.message, logs }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }

    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    if (!stripe || !supabase || !STRIPE_WEBHOOK_SECRET) {
        log('MISSING CONFIG: Check env vars for Stripe/Supabase on Dashboard');
        return new Response(JSON.stringify({ error: 'Configuration Error', logs }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            log('Missing signature');
            return new Response(JSON.stringify({ error: 'Missing signature', logs }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        let event: Stripe.Event;
        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
            log(`Event verified: ${event.type} [${event.id}]`);
        } catch (err: any) {
            log(`Signature failed: ${err.message}`);
            return new Response(JSON.stringify({ error: 'Invalid signature', logs }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // =====================================================================
        // CHECKOUT COMPLETATO (nuovo pagamento)
        // =====================================================================
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // CHECK PRODOTTO
            try {
                const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
                const productId = lineItems.data[0]?.price?.product as string;

                if (productId && !ALLOWED_PRODUCT_IDS.includes(productId)) {
                    log(`Ignored product: ${productId} (Not Crypto Analyzer)`);
                    return jsonResponse({ received: true, status: 'ignored_product' });
                }
            } catch (e) {
                log(`Error checking product ID: ${e.message}`);
            }

            const customerEmail = await resolveEmail(session, log);
            const paymentId = session.id;
            const amountTotal = session.amount_total;
            const currency = session.currency;
            const subscriptionId = session.subscription as string | null;

            if (customerEmail) {
                log(`Checkout completed for: ${customerEmail}`);

                // Calcolo scadenza: 30 giorni per mensile, 365 per annuale
                const expiresAt = calculateExpiry(amountTotal, subscriptionId);

                const dbResult = await updatePaymentStatus(
                    customerEmail, paymentId, subscriptionId, expiresAt, supabase, log
                );

                const amountDisplay = amountTotal ? `${(amountTotal / 100).toFixed(2)} ${currency?.toUpperCase()}` : 'N/A';
                const expiresDisplay = expiresAt ? expiresAt.toLocaleDateString('it-IT') : 'N/A';
                const msg = `💰 **PAGAMENTO ANALYZER RICEVUTO!**\n\n👤 Utente: \`${customerEmail}\`\n💸 Importo: **${amountDisplay}**\n🆔 Payment ID: \`${paymentId}\`\n📅 Scadenza: **${expiresDisplay}**\n✅ DB Update: ${dbResult ? 'OK' : 'Errore'}`;

                await sendTelegram(msg, log);
            } else {
                log('No email found in checkout session');
            }
        }

        // =====================================================================
        // RINNOVO PAGATO (fattura ricorrente)
        // =====================================================================
        else if (event.type === 'invoice.paid') {
            const invoice = event.data.object as Stripe.Invoice;

            // CHECK PRODOTTO RINNOVO
            const productId = invoice.lines?.data[0]?.price?.product as string;
            if (productId && !ALLOWED_PRODUCT_IDS.includes(productId)) {
                log(`Ignored renewal product: ${productId} (Not Crypto Analyzer)`);
                return jsonResponse({ received: true, status: 'ignored_product_renewal' });
            }

            // Ignora prima fattura (già gestita da checkout.session.completed)
            if (invoice.billing_reason === 'subscription_create') {
                log('Ignored first invoice (handled by checkout)');
                return jsonResponse({ received: true });
            }

            const customerEmail = await resolveEmailFromInvoice(invoice, log);
            const subscriptionId = invoice.subscription as string | null;

            if (customerEmail && subscriptionId) {
                log(`Renewal paid for: ${customerEmail} (sub: ${subscriptionId})`);

                await processRenewal(customerEmail, subscriptionId, supabase, log);

                const amountDisplay = `${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency?.toUpperCase()}`;
                const msg = `🔄 **RINNOVO ANALYZER PAGATO!**\n\n👤 Utente: \`${customerEmail}\`\n💸 Importo: **${amountDisplay}**\n📅 Abbonamento esteso\n✅ Stato: Attivo`;

                await sendTelegram(msg, log);
            }
        }

        // =====================================================================
        // ABBONAMENTO CANCELLATO → Ritorno FREEMIUM
        // =====================================================================
        else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            try {
                const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                const customerEmail = customer.email;

                if (customerEmail) {
                    log(`Subscription cancelled for: ${customerEmail}`);

                    await processExpiration(customerEmail, supabase, log);

                    const msg = `🚫 **ABBONAMENTO ANALYZER SCADUTO**\n\n👤 Utente: \`${customerEmail}\`\n📉 Stato: **FREEMIUM**\n⚡ Il cliente è tornato in modalità gratuita`;

                    await sendTelegram(msg, log);
                }
            } catch (e: any) {
                log(`Error resolving customer for cancelled sub: ${e.message}`);
            }
        }

        // =====================================================================
        // PAGAMENTO FALLITO
        // =====================================================================
        else if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object as Stripe.Invoice;
            const customerEmail = await resolveEmailFromInvoice(invoice, log);
            const attempt = invoice.attempt_count || 0;

            if (customerEmail) {
                log(`Payment failed for: ${customerEmail} (attempt ${attempt})`);

                const msg = `⚠️ **PAGAMENTO ANALYZER FALLITO!**\n\n👤 Utente: \`${customerEmail}\`\n🔄 Tentativo: #${attempt}\n❌ Il rinnovo automatico ha avuto un problema`;

                await sendTelegram(msg, log);
            }
        }

        else {
            log(`Ignored event type: ${event.type}`);
        }

        // Salva log nel DB
        try {
            await supabase.from('webhook_debug_logs').insert([{ logs: logs.join('\n') }]);
        } catch (err) {
            console.error('Failed to save logs to DB:', err);
        }

        return jsonResponse({ received: true });

    } catch (error: any) {
        const errorMsg = `CRITICAL ERROR: ${error.message}`;
        log(errorMsg);
        await supabase?.from('webhook_debug_logs').insert([{ logs: logs.join('\n') + `\nCRASH: ${errorMsg}` }]).catch(() => { });
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});


// =============================================================================
// FUNZIONI DI SUPPORTO
// =============================================================================

/**
 * Calcola data scadenza in base all'importo pagato.
 * <=100€ → mensile (30gg), >100€ → annuale (365gg)
 */
function calculateExpiry(amountCents: number | null, subscriptionId: string | null): Date | null {
    if (!subscriptionId) return null; // Pagamento one-time, nessuna scadenza

    const now = new Date();
    // Euristica: importi <= 10000 centesimi (100€) = mensile, altrimenti annuale
    if (amountCents && amountCents > 10000) {
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
}

/**
 * Aggiorna stato pagamento su stripe_payments con scadenza e subscription_id
 */
async function updatePaymentStatus(
    email: string,
    paymentId: string,
    subscriptionId: string | null,
    expiresAt: Date | null,
    supabase: any,
    log: any
): Promise<boolean> {
    try {
        // CHECK IDEMPOTENZA: Se esiste già un pagamento completato con lo stesso ID, skip
        const { data: alreadyProcessed } = await supabase
            .from('stripe_payments')
            .select('id')
            .eq('payment_id', paymentId)
            .eq('status', 'completed')
            .limit(1)
            .single();

        if (alreadyProcessed) {
            log(`Payment ${paymentId} already processed (Idempotency). Skipping.`);
            return true;
        }

        // Cerca pagamento pending per questo utente
        const { data: pending, error: searchError } = await supabase
            .from('stripe_payments')
            .select('id, status')
            .eq('user_email', email)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (searchError && searchError.code !== 'PGRST116') {
            log(`DB Search Error: ${searchError.message}`);
            return false;
        }

        // Dati aggiornamento con scadenza
        const updateData: any = {
            status: 'completed',
            payment_id: paymentId,
            updated_at: new Date().toISOString()
        };

        // Aggiungi subscription_id e expires_at se presenti
        if (subscriptionId) updateData.subscription_id = subscriptionId;
        if (expiresAt) updateData.expires_at = expiresAt.toISOString();

        if (pending) {
            log(`Found pending payment ${pending.id} for ${email}`);
            const { error: updateErr } = await supabase
                .from('stripe_payments')
                .update(updateData)
                .eq('id', pending.id);

            if (updateErr) {
                log(`DB Update Error: ${updateErr.message}`);
                return false;
            }
            log('DB Updated (status → completed, expires_at set)');
            return true;
        } else {
            log(`No pending payment found for ${email}. Creating NEW record.`);
            const { error: insertError } = await supabase
                .from('stripe_payments')
                .insert([{
                    user_email: email,
                    plan_type: 'unknown',
                    status: 'completed',
                    payment_id: paymentId,
                    amount: 0,
                    currency: 'eur',
                    activation_token: 'MANUAL_' + Date.now(),
                    subscription_id: subscriptionId || null,
                    expires_at: expiresAt ? expiresAt.toISOString() : null
                }]);

            if (insertError) {
                log(`DB Insert Error: ${insertError.message}`);
                return false;
            }
            return true;
        }
    } catch (e: any) {
        log(`UpdatePayment Exception: ${e.message}`);
        return false;
    }
}

/**
 * Gestisce il rinnovo: estende expires_at di 30gg (mensile) dalla data attuale
 */
async function processRenewal(email: string, subscriptionId: string, supabase: any, log: any) {
    try {
        // Trova il record con questo subscription_id o email
        const { data, error } = await supabase
            .from('stripe_payments')
            .select('id, expires_at')
            .eq('user_email', email)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            log(`No active payment found for renewal: ${email}`);
            return;
        }

        // Calcola nuova scadenza: dalla scadenza attuale o da ora
        let baseDate = new Date();
        if (data.expires_at) {
            const currentExpiry = new Date(data.expires_at);
            if (currentExpiry > baseDate) baseDate = currentExpiry;
        }

        const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { error: updateError } = await supabase
            .from('stripe_payments')
            .update({
                expires_at: newExpiry.toISOString(),
                subscription_id: subscriptionId,
                status: 'completed',
                updated_at: new Date().toISOString(),
                // Reset flag notifiche per il nuovo ciclo
                notified_7d: false,
                notified_1d: false,
                notified_expired: false
            })
            .eq('id', data.id);

        if (updateError) {
            log(`Renewal update error: ${updateError.message}`);
        } else {
            log(`Renewal processed: new expiry ${newExpiry.toLocaleDateString('it-IT')}`);
        }
    } catch (e: any) {
        log(`ProcessRenewal Exception: ${e.message}`);
    }
}

/**
 * Gestisce la scadenza/cancellazione: segna come expired per ritorno FREEMIUM
 */
async function processExpiration(email: string, supabase: any, log: any) {
    try {
        const { data, error } = await supabase
            .from('stripe_payments')
            .select('id')
            .eq('user_email', email)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            log(`No active payment found to expire for: ${email}`);
            return;
        }

        const { error: updateError } = await supabase
            .from('stripe_payments')
            .update({
                status: 'expired',
                updated_at: new Date().toISOString(),
                notified_expired: true
            })
            .eq('id', data.id);

        if (updateError) {
            log(`Expiration update error: ${updateError.message}`);
        } else {
            log(`Payment ${data.id} marked as expired → FREEMIUM`);
        }
    } catch (e: any) {
        log(`ProcessExpiration Exception: ${e.message}`);
    }
}

/**
 * Risolvi email dal checkout session
 */
async function resolveEmail(session: any, log: any): Promise<string | null> {
    let email = session.customer_email || session.customer_details?.email || null;
    if (!email && session.customer) {
        try {
            const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
            email = customer.email || null;
        } catch (e: any) { log(`Customer fetch error: ${e.message}`); }
    }
    return email;
}

/**
 * Risolvi email dalla fattura
 */
async function resolveEmailFromInvoice(invoice: any, log: any): Promise<string | null> {
    let email = invoice.customer_email || null;
    if (!email && invoice.customer) {
        try {
            const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
            email = customer.email || null;
        } catch (e: any) { log(`Customer fetch error: ${e.message}`); }
    }
    return email;
}

/**
 * Invia notifica Telegram all'admin
 */
async function sendTelegram(text: string, log: any) {
    if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
        log('WARNING: Telegram token or Chat ID missing. Notification skipped.');
        return;
    }
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: text,
                parse_mode: 'Markdown'
            })
        });
        const data = await res.json();
        if (data.ok) {
            log('Telegram notification sent successfully.');
        } else {
            log(`Telegram Error: ${JSON.stringify(data)}`);
        }
    } catch (e: any) {
        log(`Telegram Send Exception: ${e.message}`);
    }
}

/**
 * Helper per risposte JSON standard
 */
function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}
