"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { transicionValida } from "@/lib/estados";
import type { Enums } from "@/types/database";

/** Avanza el estado de una OT al siguiente del flujo. RLS restringe quién puede. */
export async function avanzarEstado(formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const otId = String(formData.get("ot_id"));
  const actual = String(formData.get("estado_actual")) as Enums<"estado_ot">;
  const destino = String(formData.get("estado_destino")) as Enums<"estado_ot">;

  if (!transicionValida(actual, destino)) return;

  const patch: { estado: Enums<"estado_ot">; fecha_cierre?: string } = {
    estado: destino,
  };
  if (destino === "cerrada") patch.fecha_cierre = new Date().toISOString();

  await supabase.from("ordenes_trabajo").update(patch).eq("id", otId);

  revalidatePath("/tecnico");
  revalidatePath("/ordenes");
  revalidatePath(`/ordenes/${otId}`);
}
