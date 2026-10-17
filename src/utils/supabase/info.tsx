// Beta-only configuration. No fallback to the production Supabase project.
// Vite embeds VITE_* values into the built frontend; never use service_role or secret keys here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("FisioMind Beta: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

const url = new URL(supabaseUrl);
if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) {
  throw new Error("FisioMind Beta: invalid Supabase URL");
}

export const projectId = url.hostname.slice(0, -".supabase.co".length);
export const publicAnonKey = supabaseKey;
