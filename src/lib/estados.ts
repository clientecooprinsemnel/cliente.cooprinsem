import type { Enums } from "@/types/database";

type EstadoOT = Enums<"estado_ot">;

/** Flujo lineal de avance de una OT (lo que puede accionar el técnico en terreno). */
const flujo: Partial<Record<EstadoOT, { siguiente: EstadoOT; accion: string }>> = {
  asignada: { siguiente: "repuesto_entregado", accion: "Marcar repuesto entregado" },
  repuesto_entregado: { siguiente: "en_reparacion", accion: "Enviar a reparación" },
  en_reparacion: { siguiente: "reparado", accion: "Marcar reparado" },
  reparado: { siguiente: "devuelto", accion: "Marcar devuelto al cliente" },
  devuelto: { siguiente: "cerrada", accion: "Cerrar orden" },
};

/** Devuelve la transición siguiente para un estado, o null si no hay. */
export function siguienteTransicion(estado: EstadoOT) {
  return flujo[estado] ?? null;
}

/** Valida que `destino` sea efectivamente el estado siguiente de `origen`. */
export function transicionValida(origen: EstadoOT, destino: EstadoOT) {
  return flujo[origen]?.siguiente === destino;
}
