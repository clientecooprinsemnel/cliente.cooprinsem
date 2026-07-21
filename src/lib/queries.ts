import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

/** KPIs principales del dashboard. */
export async function getDashboardKpis() {
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

/** Órdenes de trabajo con cliente, repuesto y técnico. */
export async function getOrdenes(limit?: number): Promise<OrdenConRelaciones[]> {
  let query = supabase
    .from("ordenes_trabajo")
    .select(
      "id,folio,estado,prioridad,descripcion_falla,fecha_reporte,clientes(nombre),repuestos(nombre,sku),tecnicos(nombre)"
    )
    .order("fecha_reporte", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return (data ?? []) as unknown as OrdenConRelaciones[];
}

/** Distribución de OTs por estado (para gráfico). */
export async function getDistribucionEstados() {
  const { data } = await supabase.from("ordenes_trabajo").select("estado");
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.estado, (counts.get(row.estado) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([estado, total]) => ({
    estado,
    total,
  }));
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

/** Rutas del día con sus paradas (vista del técnico). */
export async function getRutasDia(): Promise<RutaDia[]> {
  const { data } = await supabase
    .from("rutas")
    .select(
      "id,fecha,estado,tecnicos(nombre),vehiculos(patente,modelo),ruta_paradas(id,secuencia,tipo,completada,ordenes_trabajo(folio,descripcion_falla,clientes(nombre,direccion),repuestos(nombre,sku)))"
    )
    .order("fecha", { ascending: false });
  return (data ?? []) as unknown as RutaDia[];
}
