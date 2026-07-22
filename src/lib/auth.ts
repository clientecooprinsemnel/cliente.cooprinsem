import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Sesion = {
  userId: string;
  email: string;
  perfil: Tables<"perfiles"> | null;
};

/** Devuelve la sesión actual (usuario + perfil) o null si no hay sesión. */
export async function getSesion(): Promise<Sesion | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email ?? "", perfil: perfil ?? null };
}

/** Exige sesión iniciada; si no, redirige a /login. */
export async function requireUser(): Promise<Sesion> {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");
  return sesion;
}

/** Exige rol admin/coordinador; los técnicos son enviados a su vista. */
export async function requireAdmin(): Promise<Sesion> {
  const sesion = await requireUser();
  if (sesion.perfil?.rol === "tecnico") redirect("/tecnico");
  return sesion;
}

/** Técnico asociado al usuario logueado (por perfil_id), o null. */
export async function getTecnicoActual(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tecnicos")
    .select("id,nombre")
    .eq("perfil_id", userId)
    .maybeSingle();
  return data;
}
