// @ts-nocheck
/**
 * check-expiring-subscriptions/index.ts
 * ========================================
 * v2 - Aggiunta notifica Telegram ai clienti
 *
 * Edge Function schedulata (cron giornaliero) per verificare
 * abbonamenti in scadenza e inviare notifiche ai clienti.
 *
 * Logica:
 * - 7 giorni prima: notifica "Il tuo abbonamento scade tra 7 giorni"
 * - 1 giorno prima: notifica "Il tuo abbonamento scade domani"
 * - Scaduto: segna come expired (→ FREEMIUM) e notifica
 *
 * Canali: Telegram (cliente + admin)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

// =============================================================================
// CONFIGURAZIONE
// =============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const ADMIN_CHAT_ID = Deno.env.get('ADMIN_CHAT_ID') || '5454410388';

const DASHBOARD_URL = 'https://dashboard.cryptoanalyzerpro.com';

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

// =============================================================================
// HANDLER
// =============================================================================

Deno.serve(async (req: Request) => {
    const logs: string[] = [];
    const log = (msg: string) => {
        const line = `[${new Date().toISOString()}] ${msg}`;
        console.log(line);
        logs.push(line);
    };

    log('=== CHECK EXPIRING SUBSCRIPTIONS v2 ===');

    if (!supabase) {
        return new Response(JSON.stringify({ error: 'Missing Supabase config' }), { status: 503 });
    }

    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in1day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    let notified7d = 0;
    let notified1d = 0;
    let expired = 0;

    try {
        // =================================================================
        // 1. ABBONAMENTI SCADUTI → Segna come expired (FREEMIUM)
        // =================================================================
        const { data: expiredSubs, error: expError } = await supabase
            .from('stripe_payments')
            .select('id, user_email, expires_at, plan_type, telegram_chat_id')
            .eq('status', 'completed')
            .not('expires_at', 'is', null)
            .lt('expires_at', now.toISOString())
            .eq('notified_expired', false);

        if (expError) {
            log(`Error fetching expired subs: ${expError.message}`);
        } else if (expiredSubs && expiredSubs.length > 0) {
            log(`Found ${expiredSubs.length} expired subscriptions`);

            for (const sub of expiredSubs) {
                // Aggiorna status a expired
                await supabase
                    .from('stripe_payments')
                    .update({
                        status: 'expired',
                        notified_expired: true,
                        updated_at: now.toISOString()
                    })
                    .eq('id', sub.id);

                // Notifica cliente via Telegram (se ha chat_id)
                if (sub.telegram_chat_id) {
                    await sendTelegramCustomer(
                        sub.telegram_chat_id,
                        `🚫 *Abbonamento Scaduto*\n\n` +
                        `Il tuo abbonamento a *Crypto Analyzer Pro* è scaduto.\n\n` +
                        `Il tuo account è tornato in modalità *FREEMIUM* con funzionalità limitate.\n\n` +
                        `👉 Rinnova su: ${DASHBOARD_URL}`,
                        log
                    );
                    log(`Telegram sent to customer: ${sub.user_email}`);
                } else {
                    log(`No telegram_chat_id for ${sub.user_email} - skipping customer notification`);
                }

                // Notifica admin
                await sendTelegramAdmin(
                    `🚫 **ABBONAMENTO SCADUTO**\n\n👤 ${sub.user_email}\n📦 Piano: ${sub.plan_type || 'N/A'}\n📉 Stato: **FREEMIUM**`,
                    log
                );

                expired++;
            }
        }

        // =================================================================
        // 2. SCADENZA TRA 1 GIORNO → Notifica urgente
        // =================================================================
        const { data: expiring1d, error: err1d } = await supabase
            .from('stripe_payments')
            .select('id, user_email, expires_at, plan_type, telegram_chat_id')
            .eq('status', 'completed')
            .not('expires_at', 'is', null)
            .gt('expires_at', now.toISOString())
            .lte('expires_at', in1day.toISOString())
            .eq('notified_1d', false);

        if (err1d) {
            log(`Error fetching 1d expiring: ${err1d.message}`);
        } else if (expiring1d && expiring1d.length > 0) {
            log(`Found ${expiring1d.length} subscriptions expiring in 1 day`);

            for (const sub of expiring1d) {
                await supabase
                    .from('stripe_payments')
                    .update({ notified_1d: true })
                    .eq('id', sub.id);

                // Notifica cliente via Telegram
                if (sub.telegram_chat_id) {
                    await sendTelegramCustomer(
                        sub.telegram_chat_id,
                        `⚠️ *Scadenza Domani!*\n\n` +
                        `Il tuo abbonamento a *Crypto Analyzer Pro* scade *domani*!\n\n` +
                        `Se non rinnovi, tornerai in modalità FREEMIUM.\n\n` +
                        `👉 Rinnova su: ${DASHBOARD_URL}`,
                        log
                    );
                    log(`1-day warning sent to: ${sub.user_email}`);
                }

                await sendTelegramAdmin(
                    `⚠️ **SCADENZA DOMANI**\n\n👤 ${sub.user_email}\n📦 Piano: ${sub.plan_type || 'N/A'}\n⏰ Scade domani`,
                    log
                );

                notified1d++;
            }
        }

        // =================================================================
        // 3. SCADENZA TRA 7 GIORNI → Notifica preventiva
        // =================================================================
        const { data: expiring7d, error: err7d } = await supabase
            .from('stripe_payments')
            .select('id, user_email, expires_at, plan_type, telegram_chat_id')
            .eq('status', 'completed')
            .not('expires_at', 'is', null)
            .gt('expires_at', in1day.toISOString())
            .lte('expires_at', in7days.toISOString())
            .eq('notified_7d', false);

        if (err7d) {
            log(`Error fetching 7d expiring: ${err7d.message}`);
        } else if (expiring7d && expiring7d.length > 0) {
            log(`Found ${expiring7d.length} subscriptions expiring in 7 days`);

            for (const sub of expiring7d) {
                await supabase
                    .from('stripe_payments')
                    .update({ notified_7d: true })
                    .eq('id', sub.id);

                const daysLeft = Math.ceil(
                    (new Date(sub.expires_at).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
                );

                // Notifica cliente via Telegram
                if (sub.telegram_chat_id) {
                    await sendTelegramCustomer(
                        sub.telegram_chat_id,
                        `📅 *Promemoria Scadenza*\n\n` +
                        `Il tuo abbonamento a *Crypto Analyzer Pro* scade tra *${daysLeft} giorni*.\n\n` +
                        `Ricordati di rinnovare per mantenere l'accesso PRO!\n\n` +
                        `👉 Dashboard: ${DASHBOARD_URL}`,
                        log
                    );
                    log(`7-day warning sent to: ${sub.user_email}`);
                }

                notified7d++;
            }
        }

        const summary = `✅ Check completato: ${expired} scaduti, ${notified1d} notifica 1gg, ${notified7d} notifica 7gg`;
        log(summary);

        // Salva log nel DB
        await supabase.from('webhook_debug_logs').insert([{
            logs: `[CRON v2] ${logs.join('\n')}`
        }]).catch(() => { });

        return new Response(JSON.stringify({
            status: 'ok',
            expired,
            notified_1d: notified1d,
            notified_7d: notified7d,
            summary
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        log(`CRITICAL ERROR: ${error.message}`);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});


// =============================================================================
// TELEGRAM - NOTIFICHE CLIENTE
// =============================================================================

/**
 * Invia notifica Telegram al cliente
 */
async function sendTelegramCustomer(chatId: string, text: string, log: any) {
    if (!TELEGRAM_BOT_TOKEN || !chatId) {
        log('WARNING: Missing bot token or chat_id for customer notification');
        return false;
    }
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });
        const data = await res.json();
        if (data.ok) {
            log(`Telegram customer notification sent to ${chatId}`);
            return true;
        } else {
            log(`Telegram Customer Error: ${JSON.stringify(data)}`);
            return false;
        }
    } catch (e: any) {
        log(`Telegram Customer Exception: ${e.message}`);
        return false;
    }
}

/**
 * Invia notifica Telegram all'admin
 */
async function sendTelegramAdmin(text: string, log: any) {
    if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
        log('WARNING: Telegram config missing');
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
            log('Telegram admin notification sent.');
        } else {
            log(`Telegram Error: ${JSON.stringify(data)}`);
        }
    } catch (e: any) {
        log(`Telegram Exception: ${e.message}`);
    }
}
