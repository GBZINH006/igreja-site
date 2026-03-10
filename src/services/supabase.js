// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Logs úteis no dev
if (!supabaseUrl) console.error('❌ VITE_SUPABASE_URL não definida (.env.local)');
if (!supabaseAnonKey) console.error('❌ VITE_SUPABASE_ANON_KEY não definida (.env.local)');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});