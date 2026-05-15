import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin Supabase client (server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Next.js App Router server component client
export const createSupabaseServerClient = () =>
  createServerComponentClient({ cookies });

// Next.js App Router client component client
export const createSupabaseBrowserClient = () =>
  createClientComponentClient();

export default supabaseClient;
