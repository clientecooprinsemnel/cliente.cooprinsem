import { MapPin, Package, ArrowDownToLine, CheckCircle2, Circle } from "lucide-react";
import { getRutasDia } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TecnicoPage() {
  const rutas = await getRutasDia();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Ruta del Técnico</h1>
        <p className="text-sm text-muted">
          Entregas y retiros de repuestos asignados
        </p>
      </header>

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
