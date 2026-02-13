// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

declare const Deno: any;

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const ADMIN_CHAT_ID = Deno.env.get('ADMIN_CHAT_ID') || '5454410388';

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

Deno.serve(async (req: Request) => {
    const logs: string[] = [];
    const log = (msg: string) => {
        const line = `[${new Date().toISOString()}] ${msg}`;
        console.log(line);
        logs.push(line);
    };

    log('=== STRIPE WEBHOOK v15 (Fix Telegram & Column) ===');

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

        let customerEmail: string | null = null;
        let paymentId: string = event.id;
        let amountTotal: number | null = null;
        let currency: string | null = null;
        let paymentStatus: string = 'unknown';

        // Handle Events
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            customerEmail = session.customer_email || session.customer_details?.email || null;
            paymentId = session.id;
            amountTotal = session.amount_total;
            currency = session.currency;
            paymentStatus = session.payment_status;

            if (!customerEmail && session.customer) {
                try {
                    const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
                    customerEmail = customer.email || null;
                } catch (e: any) { log(`Customer fetch error: ${e.message}`); }
            }

        } else if (event.type === 'invoice.paid') {
            const invoice = event.data.object as Stripe.Invoice;
            customerEmail = invoice.customer_email || null;
            paymentId = invoice.id;
            amountTotal = invoice.amount_paid;
            currency = invoice.currency;
            paymentStatus = invoice.status || 'paid';

            if (!customerEmail && invoice.customer) {
                try {
                    const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
                    customerEmail = customer.email || null;
                } catch (e: any) { log(`Customer fetch error: ${e.message}`); }
            }
        } else {
            log(`Ignored event type: ${event.type}`);
        }

        if (customerEmail) {
            log(`Processing payment for: ${customerEmail} (Status: ${paymentStatus})`);

            const dbResult = await updatePaymentStatus(customerEmail, paymentId, supabase, log);

            const isSuccess = dbResult || paymentStatus === 'paid' || paymentStatus === 'complete';

            if (isSuccess) {
                const amountDisplay = amountTotal ? `${(amountTotal / 100).toFixed(2)} ${currency?.toUpperCase()}` : 'N/A';
                const msg = `💰 **PAGAMENTO ANALYZER RICEVUTO!**\n\n👤 Utente: \`${customerEmail}\`\n💸 Importo: **${amountDisplay}**\n🆔 Payment ID: \`${paymentId}\`\n📝 Evento: ${event.type}\n✅ DB Update: ${dbResult ? 'OK' : 'Record non trovato/Skip'}`;

                await sendTelegram(msg, log);
            }
        } else {
            if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
                log('No email found in event data');
            }
        }

        try {
            await supabase.from('webhook_debug_logs').insert([{ logs: logs.join('\n') }]);
        } catch (err) {
            console.error('Failed to save logs to DB:', err);
        }

        return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error: any) {
        const errorMsg = `CRITICAL ERROR: ${error.message}`;
        log(errorMsg);
        await supabase?.from('webhook_debug_logs').insert([{ logs: logs.join('\n') + `\nCRASH: ${errorMsg}` }]).catch(() => { });
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});

async function updatePaymentStatus(email: string, paymentId: string, supabase: any, log: any) {
    try {
        const { data: pending, error: searchError } = await supabase
            .from('stripe_payments')
            .select('id, status')
            .eq('user_email', email)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // CHECK IDEMPOTENZA: Se esiste già un pagamento completato con lo stesso ID, ignoriamo
        const { data: alreadyProcessed } = await supabase
            .from('stripe_payments')
            .select('id')
            .eq('payment_id', paymentId)
            .eq('status', 'completed')
            .limit(1)
            .single();

        if (alreadyProcessed) {
            log(`Payment ${paymentId} already processed (Idempotency Check). Skipping.`);
            return true;
        }

        if (searchError && searchError.code !== 'PGRST116') {
            log(`DB Search Error: ${searchError.message}`);
            return false;
        }

        if (pending) {
            log(`Found pending payment ${pending.id} for ${email}`);
            const { error: updateErr } = await supabase
                .from('stripe_payments')
                .update({
                    status: 'completed',
                    payment_id: paymentId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', pending.id);

            if (updateErr) {
                log(`DB Update Error: ${updateErr.message}`);
                return false;
            }
            log('DB Updated successfully (status -> completed)');
            return true;
        } else {
            log(`No pending payment found for ${email} in stripe_payments. Creating NEW record.`);
            const { error: insertError } = await supabase
                .from('stripe_payments')
                .insert([{
                    user_email: email,
                    plan_type: 'unknown',
                    status: 'completed',
                    payment_id: paymentId,
                    amount: 0,
                    currency: 'eur',
                    activation_token: 'MANUAL_' + Date.now()
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
