import { createClient } from '@supabase/supabase-js';

// Legge le variabili dal file .env.local
// In Vite si usa import.meta.env invece di process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Controllo di sicurezza per evitare crash se il file .env non viene letto
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Mancano le variabili d'ambiente VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Controlla il file .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseKey);