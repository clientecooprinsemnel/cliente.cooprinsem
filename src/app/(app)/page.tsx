import {
  ClipboardList,
  PackageOpen,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { EstadoBadge } from "@/components/EstadoBadge";
import { MargenChart } from "@/components/charts/MargenChart";
import { ProductividadChart } from "@/components/charts/ProductividadChart";
import { formatCLP, formatFecha } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";
import {
  getDashboardKpis,
  getMargenRepuestos,
  getOrdenes,
  getProductividadTecnicos,
  getRepuestosEnArriendo,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireAdmin();
  const [kpis, margen, productividad, enArriendo, ordenes] = await Promise.all([
    getDashboardKpis(),
    getMargenRepuestos(),
    getProductividadTecnicos(),
    getRepuestosEnArriendo(),
    getOrdenes({ limit: 6 }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">
          Panorama de equipos en mantención y arriendos activos
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Órdenes activas"
          value={kpis.otsActivas}
          hint={`${kpis.otsTotales} en total`}
          icon={ClipboardList}
        />
        <StatCard
          label="Repuestos en arriendo"
          value={kpis.repuestosEnArriendo}
          hint="prestados actualmente"
          icon={PackageOpen}
          accent="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Ingreso por arriendo"
          value={formatCLP(kpis.ingresoArriendo)}
          hint="acumulado a hoy"
          icon={DollarSign}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Técnicos activos"
          value={kpis.tecnicosActivos}
          hint="en operación"
          icon={Users}
          accent="bg-amber-50 text-amber-600"
        />
      </section>

      {/* Gráficos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground">
              Repuestos con mayor margen
            </h2>
          </div>
          <MargenChart data={margen} />
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground">
              Productividad por técnico
            </h2>
          </div>
          <ProductividadChart data={productividad} />
        </div>
      </section>

      {/* Repuestos en arriendo */}
      <section className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            Repuestos actualmente en arriendo
          </h2>
          <p className="text-sm text-muted">
            Facturación acumulada mientras se repara el equipo del cliente
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="px-5 py-3 font-medium">OT</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Repuesto</th>
                <th className="px-5 py-3 font-medium text-right">Días</th>
                <th className="px-5 py-3 font-medium text-right">Tarifa/día</th>
                <th className="px-5 py-3 font-medium text-right">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {enArriendo.map((r) => (
                <tr
                  key={r.prestamo_id}
                  className="border-b border-border last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-mono text-xs text-muted">
                    #{r.folio}
                  </td>
                  <td className="px-5 py-3">{r.cliente}</td>
                  <td className="px-5 py-3">
                    <span className="font-medium">{r.repuesto}</span>
                    <span className="ml-2 text-xs text-muted font-mono">
                      {r.sku}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{r.dias}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted">
                    {formatCLP(r.tarifa_diaria)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-brand-dark">
                    {formatCLP(r.monto_acumulado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Órdenes recientes */}
      <section className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Órdenes recientes</h2>
          <a href="/ordenes" className="text-sm text-brand hover:underline">
            Ver todas →
          </a>
        </div>
        <ul className="divide-y divide-border">
          {ordenes.map((o) => (
            <li key={o.id} className="px-5 py-3 flex items-center gap-4">
              <span className="font-mono text-xs text-muted w-10">#{o.folio}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">
                  {o.clientes?.nombre ?? "—"}
                </p>
                <p className="truncate text-xs text-muted">
                  {o.descripcion_falla}
                </p>
              </div>
              <span className="hidden sm:block text-xs text-muted">
                {formatFecha(o.fecha_reporte)}
              </span>
              <EstadoBadge estado={o.estado} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
