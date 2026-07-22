import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Package, User, Truck } from "lucide-react";
import { EstadoBadge } from "@/components/EstadoBadge";
import { requireAdmin } from "@/lib/auth";
import { getOrdenDetalle, getOrdenHistorial } from "@/lib/queries";
import { avanzarEstado } from "@/lib/ot-actions";
import { siguienteTransicion } from "@/lib/estados";
import { estadoLabel, formatCLP, formatFecha, formatFechaHora } from "@/lib/format";

export const dynamic = "force-dynamic";

const prioridad: Record<number, string> = { 1: "Alta", 2: "Media", 3: "Baja" };

function Dato({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm text-foreground">{children}</p>
      </div>
    </div>
  );
}

export default async function OrdenDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [ot, historial] = await Promise.all([
    getOrdenDetalle(id),
    getOrdenHistorial(id),
  ]);
  if (!ot) notFound();

  const trans = siguienteTransicion(ot.estado);

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <Link
          href="/ordenes"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Órdenes
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">OT #{ot.folio}</h1>
          <EstadoBadge estado={ot.estado} />
          <span className="text-sm text-muted">
            Prioridad {prioridad[ot.prioridad] ?? "—"}
          </span>
        </div>
      </header>

      {/* Info + control de estado */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Detalle</h2>
          <Dato icon={User} label="Cliente">
            {ot.clientes?.nombre ?? "—"}
          </Dato>
          {ot.clientes?.direccion && (
            <Dato icon={MapPin} label="Dirección">
              {ot.clientes.direccion}
            </Dato>
          )}
          {ot.clientes?.telefono && (
            <Dato icon={Phone} label="Teléfono">
              {ot.clientes.telefono}
            </Dato>
          )}
          <Dato icon={Package} label="Repuesto">
            {ot.repuestos
              ? `${ot.repuestos.nombre} (${ot.repuestos.sku}) · arriendo ${formatCLP(ot.repuestos.arriendo_diario)}/día`
              : "Sin definir"}
          </Dato>
          <Dato icon={User} label="Técnico">
            {ot.tecnicos?.nombre ?? "Sin asignar"}
          </Dato>
          {ot.vehiculos && (
            <Dato icon={Truck} label="Vehículo">
              {ot.vehiculos.patente}
              {ot.vehiculos.modelo ? ` · ${ot.vehiculos.modelo}` : ""}
            </Dato>
          )}
          <div className="pt-1 border-t border-border">
            <p className="text-xs text-muted mt-3">Falla reportada</p>
            <p className="text-sm text-foreground">
              {ot.descripcion_falla ?? "—"}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Gestión de estado</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Reportada</span>
              <span>{formatFecha(ot.fecha_reporte)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Asignada</span>
              <span>{formatFecha(ot.fecha_asignacion)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Cerrada</span>
              <span>{formatFecha(ot.fecha_cierre)}</span>
            </div>
          </div>

          {trans ? (
            <form action={avanzarEstado} className="pt-2">
              <input type="hidden" name="ot_id" value={ot.id} />
              <input type="hidden" name="estado_actual" value={ot.estado} />
              <input type="hidden" name="estado_destino" value={trans.siguiente} />
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-dark text-white px-4 py-2.5 text-sm font-medium hover:bg-brand transition-colors"
              >
                {trans.accion} →
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted pt-2">
              {ot.estado === "cerrada"
                ? "Orden cerrada."
                : ot.estado === "reportada"
                  ? "Asigna un técnico para iniciar el flujo."
                  : "Sin acciones disponibles."}
            </p>
          )}
        </div>
      </section>

      {/* Timeline / historial */}
      <section className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <h2 className="font-semibold text-foreground mb-4">Historial de estados</h2>
        <ol className="relative border-l border-border ml-2 space-y-5">
          {historial.map((h) => (
            <li key={h.id} className="ml-4">
              <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-brand" />
              <p className="text-sm font-medium text-foreground">
                {h.estado_anterior
                  ? `${estadoLabel[h.estado_anterior]} → ${estadoLabel[h.estado_nuevo]}`
                  : `Creada como ${estadoLabel[h.estado_nuevo]}`}
              </p>
              <p className="text-xs text-muted">
                {formatFechaHora(h.created_at)}
                {h.nombre ? ` · ${h.nombre}` : ""}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
