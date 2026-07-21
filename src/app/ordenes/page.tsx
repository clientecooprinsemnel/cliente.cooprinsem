import { EstadoBadge } from "@/components/EstadoBadge";
import { formatFecha } from "@/lib/format";
import { getOrdenes } from "@/lib/queries";

export const dynamic = "force-dynamic";

const prioridadLabel: Record<number, { label: string; className: string }> = {
  1: { label: "Alta", className: "text-rose-600" },
  2: { label: "Media", className: "text-amber-600" },
  3: { label: "Baja", className: "text-slate-500" },
};

export default async function OrdenesPage() {
  const ordenes = await getOrdenes();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">
          Órdenes de Trabajo
        </h1>
        <p className="text-sm text-muted">
          {ordenes.length} órdenes registradas — flujo completo de mantención
        </p>
      </header>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="px-5 py-3 font-medium">OT</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Falla</th>
                <th className="px-5 py-3 font-medium">Repuesto</th>
                <th className="px-5 py-3 font-medium">Técnico</th>
                <th className="px-5 py-3 font-medium">Prioridad</th>
                <th className="px-5 py-3 font-medium">Reporte</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const prio = prioridadLabel[o.prioridad] ?? prioridadLabel[3];
                return (
                  <tr
                    key={o.id}
                    className="border-b border-border last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-muted">
                      #{o.folio}
                    </td>
                    <td className="px-5 py-3 font-medium whitespace-nowrap">
                      {o.clientes?.nombre ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-muted max-w-xs truncate">
                      {o.descripcion_falla}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {o.repuestos ? (
                        <>
                          {o.repuestos.nombre}
                          <span className="ml-1 text-xs text-muted font-mono">
                            {o.repuestos.sku}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {o.tecnicos?.nombre ?? (
                        <span className="text-muted italic">Sin asignar</span>
                      )}
                    </td>
                    <td className={`px-5 py-3 font-medium ${prio.className}`}>
                      {prio.label}
                    </td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">
                      {formatFecha(o.fecha_reporte)}
                    </td>
                    <td className="px-5 py-3">
                      <EstadoBadge estado={o.estado} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
