import type { Enums } from "@/types/database";

/** Formatea un número como pesos chilenos (CLP). */
export function formatCLP(value: number | null | undefined): string {
  const n = value ?? 0;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Formatea una fecha ISO a formato corto es-CL. */
export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

type EstadoOT = Enums<"estado_ot">;

/** Etiqueta legible para cada estado de OT. */
export const estadoLabel: Record<EstadoOT, string> = {
  reportada: "Reportada",
  asignada: "Asignada",
  en_ruta: "En ruta",
  repuesto_entregado: "Repuesto entregado",
  en_reparacion: "En reparación",
  reparado: "Reparado",
  devuelto: "Devuelto",
  cerrada: "Cerrada",
  cancelada: "Cancelada",
};

/** Clases de color (Tailwind) para el badge de cada estado. */
export const estadoColor: Record<EstadoOT, string> = {
  reportada: "bg-amber-100 text-amber-800",
  asignada: "bg-sky-100 text-sky-800",
  en_ruta: "bg-indigo-100 text-indigo-800",
  repuesto_entregado: "bg-emerald-100 text-emerald-800",
  en_reparacion: "bg-orange-100 text-orange-800",
  reparado: "bg-teal-100 text-teal-800",
  devuelto: "bg-lime-100 text-lime-800",
  cerrada: "bg-slate-200 text-slate-700",
  cancelada: "bg-rose-100 text-rose-800",
};
