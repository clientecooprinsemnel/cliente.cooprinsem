import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa tu .env.local"
  );
}

/**
 * Cliente Supabase tipado con el esquema de la base (src/types/database.ts).
 * Usa la clave publicable (segura para el cliente).
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
