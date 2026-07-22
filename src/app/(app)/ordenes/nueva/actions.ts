"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { Enums } from "@/types/database";

/** Crea una OT. Si se asigna técnico, queda en estado 'asignada' (le llega al técnico). */
export async function crearOrden(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const cliente_id = String(formData.get("cliente_id"));
  const repuesto_requerido_id = (formData.get("repuesto_id") as string) || null;
  const tecnico_id = (formData.get("tecnico_id") as string) || null;
  const vehiculo_id = (formData.get("vehiculo_id") as string) || null;
  const prioridad = Number(formData.get("prioridad") || 3);
  const descripcion_falla = (formData.get("descripcion") as string) || null;
  const estado: Enums<"estado_ot"> = tecnico_id ? "asignada" : "reportada";

  await supabase.from("ordenes_trabajo").insert({
    cliente_id,
    repuesto_requerido_id,
    tecnico_id,
    vehiculo_id,
    prioridad,
    descripcion_falla,
    estado,
    fecha_asignacion: tecnico_id ? new Date().toISOString() : null,
  });

  revalidatePath("/ordenes");
  revalidatePath("/tecnico");
  redirect("/ordenes");
}
