import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These variables are expected to be set in the environment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;;

// The execution environment should provide these variables.
// If they are missing, the app will show an error instead of crashing.
if (!supabaseUrl || !supabaseAnonKey) {
  // Display a clear error message in the UI if credentials are not set
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #F7FAFC;">
        <div style="text-align: center; background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h1 style="color: #2D3748; font-size: 24px; font-weight: 700;">Configuration Error</h1>
          <p style="color: #718096; margin-top: 16px;">Supabase credentials are not configured.</p>
          <p style="color: #A0AEC0; margin-top: 8px; font-size: 14px;">Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.</p>
        </div>
      </div>
    `;
  }
  throw new Error("CRITICAL: Supabase credentials are not set in environment variables (SUPABASE_URL, SUPABASE_ANON_KEY).");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
