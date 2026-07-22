import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/** KPIs principales del dashboard. */
export async function getDashboardKpis() {
  const supabase = await createClient();
  const [arriendo, ordenes, tecnicos] = await Promise.all([
    supabase.from("v_repuestos_en_arriendo").select("monto_acumulado"),
    supabase.from("ordenes_trabajo").select("estado"),
    supabase.from("tecnicos").select("id").eq("activo", true),
  ]);

  const enArriendo = arriendo.data ?? [];
  const ots = ordenes.data ?? [];

  const ingresoArriendo = enArriendo.reduce(
    (acc, r) => acc + (r.monto_acumulado ?? 0),
    0
  );
  const activas = ots.filter(
    (o) => o.estado !== "cerrada" && o.estado !== "cancelada"
  ).length;

  return {
    otsActivas: activas,
    otsTotales: ots.length,
    repuestosEnArriendo: enArriendo.length,
    ingresoArriendo,
    tecnicosActivos: (tecnicos.data ?? []).length,
  };
}

/** Repuestos actualmente en arriendo (para tabla del dashboard). */
export async function getRepuestosEnArriendo(): Promise<
  Tables<"v_repuestos_en_arriendo">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_repuestos_en_arriendo")
    .select("*")
    .order("monto_acumulado", { ascending: false });
  return data ?? [];
}

/** Ranking de repuestos por margen. */
export async function getMargenRepuestos(): Promise<
  Tables<"v_margen_repuestos">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_margen_repuestos")
    .select("*")
    .order("margen", { ascending: false });
  return data ?? [];
}

/** Productividad por técnico. */
export async function getProductividadTecnicos(): Promise<
  Tables<"v_productividad_tecnicos">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_productividad_tecnicos")
    .select("*")
    .order("total_cerradas", { ascending: false });
  return data ?? [];
}

export type OrdenConRelaciones = {
  id: string;
  folio: number;
  estado: Tables<"ordenes_trabajo">["estado"];
  prioridad: number;
  descripcion_falla: string | null;
  fecha_reporte: string;
  clientes: { nombre: string } | null;
  repuestos: { nombre: string; sku: string } | null;
  tecnicos: { nombre: string } | null;
};

/** Órdenes de trabajo con cliente, repuesto y técnico. Filtra por técnico si se indica. */
export async function getOrdenes(opts?: {
  limit?: number;
  tecnicoId?: string;
}): Promise<OrdenConRelaciones[]> {
  const supabase = await createClient();
  let query = supabase
    .from("ordenes_trabajo")
    .select(
      "id,folio,estado,prioridad,descripcion_falla,fecha_reporte,clientes(nombre),repuestos(nombre,sku),tecnicos(nombre)"
    )
    .order("fecha_reporte", { ascending: false });
  if (opts?.tecnicoId) query = query.eq("tecnico_id", opts.tecnicoId);
  if (opts?.limit) query = query.limit(opts.limit);
  const { data } = await query;
  return (data ?? []) as unknown as OrdenConRelaciones[];
}

export type ParadaRuta = {
  id: string;
  secuencia: number;
  tipo: Tables<"ruta_paradas">["tipo"];
  completada: boolean;
  ordenes_trabajo: {
    folio: number;
    descripcion_falla: string | null;
    clientes: { nombre: string; direccion: string | null } | null;
    repuestos: { nombre: string; sku: string } | null;
  } | null;
};

export type RutaDia = {
  id: string;
  fecha: string;
  estado: string;
  tecnicos: { nombre: string } | null;
  vehiculos: { patente: string; modelo: string | null } | null;
  ruta_paradas: ParadaRuta[];
};

/** Rutas del día con sus paradas. Filtra por técnico si se indica. */
export async function getRutasDia(tecnicoId?: string): Promise<RutaDia[]> {
  const supabase = await createClient();
  let query = supabase
    .from("rutas")
    .select(
      "id,fecha,estado,tecnicos(nombre),vehiculos(patente,modelo),ruta_paradas(id,secuencia,tipo,completada,ordenes_trabajo(folio,descripcion_falla,clientes(nombre,direccion),repuestos(nombre,sku)))"
    )
    .order("fecha", { ascending: false });
  if (tecnicoId) query = query.eq("tecnico_id", tecnicoId);
  const { data } = await query;
  return (data ?? []) as unknown as RutaDia[];
}

// ---------- Listas para el formulario de creación de OT ----------

export async function getClientes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("id,nombre,direccion")
    .order("nombre");
  return data ?? [];
}

export async function getRepuestos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("repuestos")
    .select("id,nombre,sku")
    .order("nombre");
  return data ?? [];
}

export async function getTecnicos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tecnicos")
    .select("id,nombre")
    .eq("activo", true)
    .order("nombre");
  return data ?? [];
}

export async function getVehiculos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehiculos")
    .select("id,patente,modelo,tecnico_id")
    .eq("activo", true)
    .order("patente");
  return data ?? [];
}
