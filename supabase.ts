import { createClient } from '@supabase/supabase-js';

// ⚠️ SOSTITUISCI LE SCRITTE TRA VIRGOLETTE CON I TUOI CODICI VERI DI SUPABASE
const supabaseUrl = 'https://hlzjlsuirhulmjhbzmtd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsempsc3Vpcmh1bG1qaGJ6bXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NjY1MzYsImV4cCI6MjA3OTI0MjUzNn0.d8V5moslwfWxcQqkU4Sk5ujx2JDZYKucWREOvINawx4';

export const supabase = createClient(supabaseUrl, supabaseKey);