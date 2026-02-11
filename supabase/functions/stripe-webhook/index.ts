import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Telegram Config (Admin Notification)
// Fallback hardcoded tokens for immediate fix if ENV vars are missing
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '7551319945:AAF8QRYd79ifalEI4ByL2LPdm1PwmgqD11Y';
const ADMIN_CHAT_ID = Deno.env.get('ADMIN_CHAT_ID') || '5454410388';

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

Deno.serve(async (req: Request) => {
    const logs: string[] = [];
    const log = (msg: string) => {
        console.log(msg);
        logs.push(msg);
    };

    log('=== STRIPE WEBHOOK v10 STARTED ===');

    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    // Fail soft if config missing to avoid infinite Stripe retries
    if (!stripe || !supabase || !STRIPE_WEBHOOK_SECRET) {
        log('CRITICAL: MISSING CONFIG (Stripe/Supabase keys)');
        return new Response(JSON.stringify({ error: 'Configuration Error', logs }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            log('Error: Missing stripe-signature header');
            return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 400 });
        }

        let event: Stripe.Event;
        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
            log(`Event Verified: ${event.type} [${event.id}]`);
        } catch (err: any) {
            log(`Signature Verification Failed: ${err.message}`);
            return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
        }

        // Process Event
        let customerEmail: string | null = null;
        let paymentId: string = event.id;
        let amountTotal: number | null = null;
        let currency: string | null = null;
        let eventType = event.type;

        if (eventType === 'checkout_session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            customerEmail = session.customer_email || session.customer_details?.email || null;
            paymentId = session.id;
            amountTotal = session.amount_total;
            currency = session.currency;

            // Try fetch email from customer ID if missing
            if (!customerEmail && session.customer) {
                log(`Fetching email for customer ID: ${session.customer}`);
                try {
                    const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
                    customerEmail = customer.email || null;
                    if (customerEmail) log(`-> Found email: ${customerEmail}`);
                } catch (e: any) { log(`-> Warning: Customer fetch failed: ${e.message}`); }
            }

        } else if (eventType === 'invoice.paid') {
            const invoice = event.data.object as Stripe.Invoice;
            customerEmail = invoice.customer_email || null;
            paymentId = invoice.id;
            amountTotal = invoice.amount_paid;
            currency = invoice.currency;

            if (!customerEmail && invoice.customer) {
                log(`Fetching email for customer ID: ${invoice.customer}`);
                try {
                    const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
                    customerEmail = customer.email || null;
                    if (customerEmail) log(`-> Found email: ${customerEmail}`);
                } catch (e: any) { log(`-> Warning: Customer fetch failed: ${e.message}`); }
            }
        } else {
            log(`Ignored event type: ${eventType}`);
        }

        if (customerEmail) {
            log(`Processing Payment - Email: ${customerEmail}, ID: ${paymentId}`);

            // 1. UPDATE DB (stripe_payments)
            const updateResult = await updatePaymentStatus(customerEmail, paymentId, supabase, log);

            // 2. SEND NOTIFICATION (Telegram)
            // Send if updated OR if payment was seemingly valid (to ensure admin knows)
            // Avoid sending on ignored events
            const moneyStr = amountTotal ? `${(amountTotal / 100).toFixed(2)} ${currency?.toUpperCase()}` : 'N/A';

            const message = `💰 **NUOVO PAGAMENTO STRIPE**\n\n` +
                `👤 **Utente:** \`${customerEmail}\`\n` +
                `💵 **Importo:** \`${moneyStr}\`\n` +
                `📋 **Evento:** ${eventType}\n` +
                `✅ **Stato DB:** ${updateResult ? 'AGGIORNATO' : '⚠️ NON TROVATO/GIA AGGIORNATO'}`;

            await sendTelegram(message, log);

        } else if (eventType === 'checkout_session.completed' || eventType === 'invoice.paid') {
            log(`WARNING: Event ${eventType} has NO EMAIL. Cannot update DB.`);
            await sendTelegram(`⚠️ **PAGAMENTO SENZA EMAIL**\nEvento: ${eventType}\nCheck Stripe Dashboard!`, log);
        }

        // Save logs to DB (Best Effort)
        try {
            await supabase.from('webhook_debug_logs').insert([{ logs: logs.join('\n') }]);
        } catch (dbErr) {
            console.error('Failed to write logs to DB:', dbErr);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        const errorMsg = `CRITICAL ERROR: ${error.message}`;
        log(errorMsg);
        console.error(error); // Ensure it goes to Supabase console logs

        // Try to log crash to DB
        try {
            await supabase?.from('webhook_debug_logs').insert([{ logs: `CRASH: ${errorMsg}\nContext: ${logs.join('\n')}` }]);
        } catch { }

        // Return 500 to signal failure to Stripe (will retry)
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});

/**
 * Updates payment status in Supabase
 */
async function updatePaymentStatus(email: string, paymentId: string, supabase: any, log: any): Promise<boolean> {
    log(`Querying stripe_payments for ${email}...`);

    // Find the most recent record for this user (pending or completed)
    const { data: records, error: selectErr } = await supabase
        .from('stripe_payments')
        .select('id, status')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(1);

    if (selectErr) {
        log(`-> DB Select Error: ${selectErr.message}`);
        return false;
    }

    if (!records || records.length === 0) {
        log(`-> No record found for user ${email}`);
        return false;
    }

    const record = records[0];
    log(`-> Found record ID: ${record.id}, Status: ${record.status}`);

    // Always update to ensure payment_id and timestamp are fresh
    const { error: updateErr } = await supabase
        .from('stripe_payments')
        .update({
            status: 'completed',
            payment_id: paymentId,
            updated_at: new Date().toISOString()
        })
        .eq('id', record.id);

    if (updateErr) {
        log(`-> DB Update Error: ${updateErr.message}`);
        return false;
    }

    log(`-> SUCCESS: Record ${record.id} updated to 'completed'`);
    return true;
}

/**
 * Sends notification to Telegram Admin
 */
async function sendTelegram(text: string, log: any) {
    if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
        log('-> Telegram SKIP: Missing Token or Chat ID');
        return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    log(`-> Sending Telegram to ${ADMIN_CHAT_ID}...`);

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        if (!resp.ok) {
            const errText = await resp.text();
            log(`-> Telegram API Error: ${resp.status} - ${errText}`);
        } else {
            log('-> Telegram Sent OK');
        }
    } catch (e: any) {
        log(`-> Telegram Network Error: ${e.message}`);
    }
}
