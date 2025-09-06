import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente com o prefixo VITE_, como esperado pelo Vite.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis foram carregadas corretamente.
if (!supabaseUrl || !supabaseAnonKey) {
  // Em vez de injetar HTML, lança um erro claro que pode ser visto na consola do navegador.
  throw new Error("CRITICAL: Supabase credentials are not set in environment variables. Please check your .env file or Netlify environment settings (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
}

// Cria e exporta o cliente Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
