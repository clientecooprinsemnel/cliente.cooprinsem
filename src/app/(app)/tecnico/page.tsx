import {
  MapPin,
  Package,
  ArrowDownToLine,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { EstadoBadge } from "@/components/EstadoBadge";
import { requireUser, getTecnicoActual } from "@/lib/auth";
import { getOrdenes, getRutasDia } from "@/lib/queries";
import { siguienteTransicion } from "@/lib/estados";
import { avanzarEstado } from "@/lib/ot-actions";

export const dynamic = "force-dynamic";

export default async function TecnicoPage() {
  const sesion = await requireUser();
  const esTecnico = sesion.perfil?.rol === "tecnico";
  const tecnico = esTecnico ? await getTecnicoActual(sesion.userId) : null;

  const tecnicoId = tecnico?.id;
  const [ordenes, rutas] = await Promise.all([
    esTecnico ? getOrdenes({ tecnicoId }) : Promise.resolve([]),
    getRutasDia(tecnicoId),
  ]);

  const activas = ordenes.filter(
    (o) => o.estado !== "cerrada" && o.estado !== "cancelada"
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">
          {esTecnico ? `Hola, ${tecnico?.nombre ?? sesion.perfil?.nombre}` : "Ruta del Técnico"}
        </h1>
        <p className="text-sm text-muted">
          {esTecnico
            ? "Tus órdenes asignadas y tu ruta del día"
            : "Entregas y retiros de repuestos asignados"}
        </p>
      </header>

      {/* Órdenes asignadas al técnico */}
      {esTecnico && (
        <section className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              Mis órdenes asignadas ({activas.length})
            </h2>
          </div>
          {activas.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">
              No tienes órdenes activas asignadas.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {activas.map((o) => {
                const trans = siguienteTransicion(o.estado);
                return (
                  <li
                    key={o.id}
                    className="px-5 py-3 flex items-center gap-4"
                  >
                    <span className="font-mono text-xs text-muted w-10">
                      #{o.folio}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {o.clientes?.nombre ?? "—"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {o.descripcion_falla}
                        {o.repuestos
                          ? ` · ${o.repuestos.nombre} (${o.repuestos.sku})`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <EstadoBadge estado={o.estado} />
                      {trans && (
                        <form action={avanzarEstado}>
                          <input type="hidden" name="ot_id" value={o.id} />
                          <input
                            type="hidden"
                            name="estado_actual"
                            value={o.estado}
                          />
                          <input
                            type="hidden"
                            name="estado_destino"
                            value={trans.siguiente}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-brand text-brand hover:bg-brand-soft active:bg-brand-soft px-3 py-2 text-xs font-medium whitespace-nowrap"
                          >
                            {trans.accion} →
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Rutas del día */}
      <h2 className="text-lg font-semibold text-foreground pt-2">
        {esTecnico ? "Mi ruta de hoy" : "Rutas del día"}
      </h2>

      {rutas.length === 0 && (
        <div className="bg-surface rounded-xl border border-border p-8 text-center text-muted">
          No hay rutas planificadas.
        </div>
      )}

      {rutas.map((ruta) => {
        const paradas = [...ruta.ruta_paradas].sort(
          (a, b) => a.secuencia - b.secuencia
        );
        return (
          <div
            key={ruta.id}
            className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold text-foreground">
                  {ruta.tecnicos?.nombre ?? "—"}
                </p>
                <p className="text-xs text-muted">
                  {ruta.vehiculos
                    ? `${ruta.vehiculos.modelo ?? ""} · ${ruta.vehiculos.patente}`
                    : "Sin vehículo"}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-brand-soft text-brand-dark px-3 py-1 text-xs font-medium capitalize">
                {ruta.estado.replace(/_/g, " ")}
              </span>
            </div>

            <ol className="divide-y divide-border">
              {paradas.map((p) => (
                <li key={p.id} className="px-5 py-4 flex gap-4">
                  <div className="flex flex-col items-center">
                    {p.completada ? (
                      <CheckCircle2 className="h-6 w-6 text-brand" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.tipo === "entrega"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {p.tipo === "entrega" ? (
                          <Package className="h-3 w-3" />
                        ) : (
                          <ArrowDownToLine className="h-3 w-3" />
                        )}
                        {p.tipo === "entrega" ? "Entrega" : "Retiro"}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        OT #{p.ordenes_trabajo?.folio}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-sm">
                      {p.ordenes_trabajo?.clientes?.nombre ?? "—"}
                    </p>
                    {p.ordenes_trabajo?.clientes?.direccion && (
                      <p className="text-xs text-muted flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {p.ordenes_trabajo.clientes.direccion}
                      </p>
                    )}
                    {p.ordenes_trabajo?.repuestos && (
                      <p className="mt-1 text-xs text-muted">
                        {p.ordenes_trabajo.repuestos.nombre}{" "}
                        <span className="font-mono">
                          ({p.ordenes_trabajo.repuestos.sku})
                        </span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
